import axios from 'axios';
import Complaint from '../models/Complaint.model.js';
import User from '../models/User.model.js';
import AuditLog from '../models/AuditLog.model.js';
import Officer from '../models/Officer.model.js';
import Department from '../models/Department.model.js';

// --- HELPER: Map Database Dept Names to AI Categories ---
const mapToAICategory = (dbDeptName) => {
    const validLabels = [
        "Road", "Electricity", "Water", "Sanitation", "Police", "Fire", 
        "URBAN PLANNING & REGULATION", "Environmental Protection", 
        "Animal Control & Veterinary", "Disaster Management"
    ];
    // Find closest match (e.g., "Public Sanitation" -> "Sanitation")
    return validLabels.find(label => 
        dbDeptName.toLowerCase().includes(label.toLowerCase()) || 
        label.toLowerCase().includes(dbDeptName.toLowerCase())
    ) || null;
};

// Helper to check same day
const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
};

// @desc    Submit a new grievance
// @route   POST /api/complaints
export const createComplaint = async (req, res) => {
  try {
    const { title, description, location, zone, forceSubmit } = req.body;
    const userId = req.user._id;

    if (!zone || !title || !location) {
      return res.status(400).json({ success: false, message: "Zone is required." });
    }

    // --- 0. DAILY LIMIT CHECK (Max 3 per day) ---
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const dailyCount = await Complaint.countDocuments({
        citizen: userId,
        createdAt: { $gte: todayStart }
    });

    if (dailyCount >= 3) {
        return res.status(429).json({
            success: false,
            message: "Daily limit reached. You can only submit 3 complaints per day."
        });
    }

    // --- 0.5 DUPLICATE CHECK (Semantic Search) ---
    // Only run if user hasn't confirmed the warning yet (forceSubmit is false)
    if (!forceSubmit) {
        // Fetch ACTIVE complaints in the SAME ZONE to compare
        const nearbyComplaints = await Complaint.find({
            zone: zone,
            status: { $in: ['submitted', 'assigned', 'in_progress'] } // Only active ones
        }).select('description');

        const existingTexts = nearbyComplaints.map(c => c.description);

        if (existingTexts.length > 0) {
            try {
                const dupResponse = await axios.post('http://localhost:8000/check_duplicate', {
                    new_complaint: description,
                    existing_complaints: existingTexts
                });

                if (dupResponse.data.is_duplicate) {
                    return res.status(200).json({
                        success: false,
                        isDuplicateWarn: true, // Frontend triggers Modal
                        similarityScore: dupResponse.data.score,
                        message: "Warning: Similar complaint detected in this zone. Submitting duplicates may lower your Trust Score."
                    });
                }
            } catch (err) {
                console.error("AI Duplicate Check Failed (Continuing...):", err.message);
            }
        }
    }

    // --- 1. CALL PYTHON AI SERVICE (Classification) ---
    let aiCategory = 'Other';
    let aiPriorityLevel = 'Medium';
    let aiPriorityScore = 50;
    let aiConfidence = 0;

    try {
        const aiResponse = await axios.post('http://localhost:8000/predict', {
            text: description
        });

        const data = aiResponse.data;
        console.log("🤖 AI Response:", data);

        aiCategory = data.category;          
        aiPriorityLevel = data.priority_level; 
        aiPriorityScore = data.priority_score; 
        aiConfidence = data.ai_confidence;

    } catch (aiError) {
        console.error("⚠️ AI Service Error:", aiError.message);
        console.log("Using Default Fallback values.");
    }

    // --- 2. STRICT VALIDATION LOGIC ---
    let targetDeptId = null;
    let matchedDeptName = 'Unassigned';
    let assignedOfficerId = null;
    let complaintStatus = 'submitted'; // Default state

    // A. Verify if the AI Category exists as a Department in YOUR database
    if (aiCategory !== 'Other') {
        const matchedDept = await Department.findOne({
            $or: [
                { name: { $regex: `^${aiCategory}$`, $options: 'i' } }, // Exact match
                { code: { $regex: `^${aiCategory}$`, $options: 'i' } }
            ]
        });

        if (matchedDept) {
            targetDeptId = matchedDept._id;
            matchedDeptName = matchedDept.name;
        } else {
            console.log(`⚠️ Dept '${aiCategory}' not found in DB. Falling back to 'Other'.`);
            aiCategory = 'Other';
        }
    }

    // B. Only attempt assignment if we have a valid Department
    if (targetDeptId) {
        // Find an officer who matches BOTH Zone AND Department
        const responsibleOfficer = await Officer.findOne({ 
            jurisdictionZones: { $in: [zone] },
            department: targetDeptId
        }).populate('user');

        if (responsibleOfficer) {
            assignedOfficerId = responsibleOfficer.user._id;
            complaintStatus = 'assigned';
        } else {
            console.log(`⚠️ No Officer found for Zone: ${zone} in Dept: ${matchedDeptName}`);
        }
    }

    // --- 3. CREATE COMPLAINT ---
    const complaint = await Complaint.create({
      title,
      description,
      location,
      zone, 
      citizen: userId,
      
      category: aiCategory,
      priorityLevel: aiPriorityLevel,
      priorityScore: aiPriorityScore,
      aiAnalysis: {
        confidence: aiConfidence,
        summary: `AI classified as ${aiCategory}`
      },
      assignedOfficer: assignedOfficerId,
      department: targetDeptId, 
      status: complaintStatus, 
      history: [{
        action: 'SUBMITTED',
        performedBy: userId,
        remarks: assignedOfficerId 
          ? `Auto-assigned to ${matchedDeptName} Officer` 
          : `Submitted. Categorized as ${aiCategory}. (Pending Assignment)`
      }]
    });

    res.status(201).json({ success: true, data: complaint });

  } catch (error) {
    console.error("Create Complaint Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged-in user's history
export const getMyHistory = async (req, res) => {
  try {
    let query = { citizen: req.user._id };
    
    if (req.user.role === 'officer') {
        query = { assignedOfficer: req.user._id };
    }

    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .populate('citizen', 'name email')
      .populate('department', 'name'); 

    res.status(200).json({ success: true, count: complaints.length, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Single Complaint
export const getComplaintById = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
            .populate('citizen', 'name email trustScore')
            .populate('assignedOfficer', 'name')
            .populate('department', 'name');

        if (!complaint) return res.status(404).json({ message: 'Not Found' });
        res.json({ success: true, data: complaint });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update Status & Log to Audit Trail
export const updateComplaintStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const complaintId = req.params.id;
    const officerId = req.user._id;

    // 1. Find Complaint
    const complaint = await Complaint.findById(complaintId).populate('citizen');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const oldStatus = complaint.status;
    
    // 2. Update Status
    complaint.status = status;

    // --- LOGIC CHANGE: If manually set to assigned, try to ensure officer is set ---
    if (status === 'assigned' && !complaint.assignedOfficer) {
        if (complaint.department && complaint.zone) {
            const officer = await Officer.findOne({ 
                jurisdictionZones: { $in: [complaint.zone] },
                department: complaint.department
            });
            if (officer) {
                complaint.assignedOfficer = officer.user;
            }
        }
    }

    // 3. Internal History (Complaint Timeline)
    complaint.history.push({
      action: `STATUS_CHANGE: ${oldStatus} -> ${status}`,
      performedBy: officerId,
      remarks: remarks || 'Status updated by officer'
    });

    // 4. Add Global Audit Log
    await AuditLog.create({
        action: 'STATUS_UPDATE',
        actor: officerId,
        targetId: complaint._id,
        details: `Status changed for Complaint :: ${complaint.title} (${complaint._id}) : ${oldStatus} -> ${status}`
    });

    // 5. Trust Score Logic (If rejected)
    if (status === 'rejected') {
      const citizen = await User.findById(complaint.citizen._id);
      if (citizen) {
          citizen.trustScore = Math.max(0, citizen.trustScore - 10);
          if (citizen.trustScore < 20) {
            citizen.isActive = false;
            await AuditLog.create({
                action: 'USER_BANNED',
                targetId: citizen._id,
                details: `Auto-ban due to low trust score. Triggered by rejection of Complaint ::  ${complaint.title} (${complaint._id})`,
                actor: officerId
            });
          }
          await citizen.save();
      }
    }

    // 6. Officer Stats Logic
    if (status === 'resolved' && oldStatus !== 'resolved') {
        await Officer.findOneAndUpdate(
            { user: officerId },
            { $inc: { 'stats.resolvedCount': 1 } }
        );
    }

    await complaint.save();
    res.json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reclassify (Human in the Loop) - With Names & IDs
// @desc    Reclassify (Human in the Loop) & Teach AI
// @route   PUT /api/complaints/:id/reclassify
export const reclassifyComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { departmentId, priority, reason } = req.body;

    // 1. Fetch Complaint with Dept data
    const complaint = await Complaint.findById(id).populate('department');
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

    // 2. Determine "Before" State
    const oldDeptObj = complaint.department;
    const oldPriority = complaint.priorityLevel;

    let isChanged = false;
    let changesLog = [];
    
    // Variables to hold the "Final Truth" for the AI
    let finalDeptName = oldDeptObj ? oldDeptObj.name : "";
    let finalPriority = oldPriority;

    // --- HANDLE DEPARTMENT CHANGE ---
    if (departmentId && (!oldDeptObj || oldDeptObj._id.toString() !== departmentId)) {
        const newDeptObj = await Department.findById(departmentId);
        
        if (newDeptObj) {
            complaint.department = departmentId;
            finalDeptName = newDeptObj.name; // Update Final Truth
            
            isChanged = true;
            changesLog.push(`Department: ${oldDeptObj ? oldDeptObj.name : 'None'} -> ${newDeptObj.name}`);

            // Reset Officer Logic
            const newOfficer = await Officer.findOne({ 
                department: departmentId, 
                jurisdictionZones: { $in: [complaint.zone] } 
            });
            complaint.assignedOfficer = newOfficer ? newOfficer.user : null;
            complaint.status = newOfficer ? 'assigned' : 'submitted';
        }
    }

    // --- HANDLE PRIORITY CHANGE ---
    if (priority && priority !== oldPriority) {
        complaint.priorityLevel = priority;
        finalPriority = priority; // Update Final Truth
        
        const scoreMap = { 'Critical': 95, 'High': 75, 'Medium': 50, 'Low': 25 };
        complaint.priorityScore = scoreMap[priority] || 50;

        isChanged = true;
        changesLog.push(`Priority: ${oldPriority} -> ${priority}`);
    }

    // --- SAVE & SEND FULL FEEDBACK ---
    if (isChanged) {
        complaint.history.push({
            action: 'RECLASSIFIED',
            performedBy: req.user._id,
            remarks: `Admin Update: ${changesLog.join(', ')}. Reason: ${reason || 'None'}`
        });

        await complaint.save();
        await AuditLog.create({
            action: 'ADMIN_OVERRIDE',
            actor: req.user._id,
            targetId: complaint._id,
            details: `Correction: ${changesLog.join(' | ')}`
        });

        // ** CRITICAL FIX: ALWAYS SEND FULL CONTEXT **
        // Even if we only changed Priority, we remind AI of the Dept.
        // Even if we only changed Dept, we remind AI of the Priority.
        
        const aiCategory = mapToAICategory(finalDeptName);
        
        if (aiCategory) {
            const feedbackPayload = {
                text: complaint.description,
                correct_category: aiCategory,   // e.g. "Electricity"
                correct_priority: finalPriority // e.g. "Critical"
            };

            console.log("🧠 Sending Full Context to AI:", feedbackPayload);
            
            axios.post('http://localhost:8000/feedback', feedbackPayload)
                .catch(err => console.error("AI Feedback Failed:", err.message));
        } else {
            console.log(`⚠️ Skipping AI feedback: Department '${finalDeptName}' not recognized by AI.`);
        }
    }

    res.status(200).json({ 
        success: true, 
        message: "Complaint updated & AI trained", 
        data: complaint 
    });

  } catch (error) {
    console.error("Reclassify Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get All Complaints (Dashboard)
export const getAllComplaints = async (req, res) => {
  try {
    let filter = {};

    // 1. Dept Admin: See complaints for their department
    if (req.user.role === 'dept_admin') {
       const dept = await Department.findOne({ admin: req.user._id });
       if (dept) filter.department = dept._id;
    }
    // 2. Officer: See complaints for their department (or just assigned to them)
    if (req.user.role === 'officer') {
       const officer = await Officer.findOne({ user: req.user._id });
       if (officer) filter.department = officer.department; 
    }

    // 1. Fetch ALL matching documents first
    let complaints = await Complaint.find(filter)
      .populate('citizen', 'name email')
      .populate('department', 'name')
      .populate('assignedOfficer', 'name');

    // 2. APPLY CUSTOM SORTING (JavaScript)
    // Goal: Date (Desc) -> Status (Unresolved First) -> Priority (Critical First)
    complaints.sort((a, b) => {
        // A. Primary Sort: Date (Desc - Newest First)
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        
        // If dates are different days, newer day wins
        // If same day, we continue to secondary sort
        if (dateA.toDateString() !== dateB.toDateString()) {
            return dateB - dateA; 
        }

        // B. Secondary Sort: Status (Unresolved comes before Resolved)
        // Define "Resolved" types
        const isResolvedA = ['resolved', 'rejected', 'closed'].includes(a.status);
        const isResolvedB = ['resolved', 'rejected', 'closed'].includes(b.status);

        if (isResolvedA !== isResolvedB) {
            return isResolvedA ? 1 : -1; // Unresolved (false) comes first
        }

        // C. Tertiary Sort: Priority (Critical > High > Medium > Low)
        const priorityMap = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        const scoreA = priorityMap[a.priorityLevel] || 0;
        const scoreB = priorityMap[b.priorityLevel] || 0;

        return scoreB - scoreA; // Higher score first
    });

    res.status(200).json({ success: true, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Trigger AI Retraining Manually (For Dashboard Button)
// @route   POST /api/complaints/retrain-ai
export const triggerAIRetraining = async (req, res) => {
    try {
        console.log("🔄 Admin triggered Manual Retraining...");
        
        // Call Python Service
        const aiResponse = await axios.post('http://localhost:8000/retrain', {}, { timeout: 5000 });

        // Log Action
        await AuditLog.create({
            action: 'AI_RETRAIN_TRIGGERED',
            actor: req.user._id,
            details: 'Admin manually triggered AI model retraining.'
        });

        res.status(200).json({
            success: true,
            message: "AI Retraining Started successfully. Models will update in background.",
            ai_response: aiResponse.data
        });

    } catch (error) {
        console.error("Retrain Error:", error.message);
        res.status(503).json({ 
            success: false, 
            message: "Failed to reach AI Service. Ensure Python backend is running." 
        });
    }
};
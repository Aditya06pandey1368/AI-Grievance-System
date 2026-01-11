import axios from 'axios'; // <--- NEW: To talk to Python AI
import Complaint from '../models/Complaint.model.js';
import User from '../models/User.model.js';
import AuditLog from '../models/AuditLog.model.js';
import Officer from '../models/Officer.model.js';
import Department from '../models/Department.model.js';

// @desc    Submit a new grievance
// @route   POST /api/complaints
export const createComplaint = async (req, res) => {
  try {
    const { title, description, location, zone } = req.body;
    const userId = req.user._id;

    if (!zone || !title || !location) {
      return res.status(400).json({ success: false, message: "Zone is required." });
    }

    // --- 1. CALL PYTHON AI SERVICE (Real Logic) ---
    let aiCategory = 'Other';
    let aiPriorityLevel = 'Medium';
    let aiPriorityScore = 50;
    let aiConfidence = 0;

    try {
        // Send description to your running Python Service
        const aiResponse = await axios.post('http://localhost:8000/predict', {
            text: description
        });

        const data = aiResponse.data;
        console.log("🤖 AI Response:", data); // Debugging

        // Update variables with REAL AI data
        aiCategory = data.category;             // e.g. "Fire", "Road"
        aiPriorityLevel = data.priority_level;  // e.g. "Critical"
        aiPriorityScore = data.priority_score;  // e.g. 95
        aiConfidence = data.ai_confidence;

    } catch (aiError) {
        console.error("⚠️ AI Service Error:", aiError.message);
        console.log("Using Default Fallback values.");
        // If Python is down, it defaults to 'Other' / 'Medium' so the app doesn't crash.
    }

    // --- 2. DYNAMIC DEPARTMENT LOOKUP ---
    // NO HARDCODED IDs! 
    // We search the DB for a Department that matches the AI Category.
    // e.g., If AI says "Fire", we look for a Dept named "Fire Dept" or code "DEPT_FIRE"
    let targetDeptId = null;
    let matchedDeptName = 'Unassigned';

    if (aiCategory !== 'Other') {
        const matchedDept = await Department.findOne({
            $or: [
                { name: { $regex: aiCategory, $options: 'i' } }, // Matches "Fire Department" if category is "Fire"
                { code: { $regex: aiCategory, $options: 'i' } }
            ]
        });

        if (matchedDept) {
            targetDeptId = matchedDept._id;
            matchedDeptName = matchedDept.name;
            console.log(`✅ Routing: Category "${aiCategory}" -> Department "${matchedDept.name}"`);
        } else {
            console.log(`⚠️ Routing: No Department found in DB matching "${aiCategory}"`);
        }
    }

    // --- 3. AUTO-ASSIGNMENT LOGIC ---
    // Find Officer who matches:
    // 1. The Zone (e.g., "Ward 1")
    // 2. The Department (e.g., "Fire Dept") - IF a department was identified
    let assignedOfficerId = null;
    let complaintStatus = 'submitted';

    let officerQuery = { jurisdictionZones: { $in: [zone] } };
    
    if (targetDeptId) {
        officerQuery.department = targetDeptId;
    }

    const responsibleOfficer = await Officer.findOne(officerQuery).populate('user');

    if (responsibleOfficer) {
        assignedOfficerId = responsibleOfficer.user._id;
        complaintStatus = 'assigned';
        console.log(`✅ Auto-Assigned to Officer: ${responsibleOfficer.user.email}`);
    } else {
        console.log(`❌ No Officer found for Zone "${zone}" & Dept "${matchedDeptName}"`);
    }

    // --- 4. CREATE COMPLAINT ---
    const complaint = await Complaint.create({
      title,
      description,
      location,
      zone, 
      citizen: userId,
      
      // AI DATA
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
          ? `Auto-assigned to ${responsibleOfficer.user.name} (${matchedDeptName})` 
          : 'Submitted (Waiting for assignment)'
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
    
    // If Officer: Show complaints assigned to them
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

// @desc    Update Status
export const updateComplaintStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const complaintId = req.params.id;
    const officerId = req.user._id;

    const complaint = await Complaint.findById(complaintId).populate('citizen');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const oldStatus = complaint.status;
    complaint.status = status;

    // History Log
    complaint.history.push({
      action: `STATUS_CHANGE: ${oldStatus} -> ${status}`,
      performedBy: officerId,
      remarks: remarks || 'Status updated by officer'
    });

    // Trust Score Logic
    if (status === 'rejected') {
      const citizen = await User.findById(complaint.citizen._id);
      if (citizen) {
          citizen.trustScore = Math.max(0, citizen.trustScore - 10);
          if (citizen.trustScore < 20) {
            citizen.isActive = false;
            await AuditLog.create({
                action: 'USER_BANNED',
                targetId: citizen._id,
                details: 'Auto-ban due to low trust score',
                actor: officerId
            });
          }
          await citizen.save();
      }
    }

    // Officer Stats Logic
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

export const getAllComplaintsForAdmin = async (req, res) => {
  try {
    // 1. Fetch all complaints from DB
    // 2. Populate 'citizen' to get the name of the person who filed it
    // 3. Sort by newest first (-1)
    const complaints = await Complaint.find()
      .populate("citizen", "name email") 
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: complaints, 
    });
  } catch (error) {
    console.error("Error fetching admin complaints:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
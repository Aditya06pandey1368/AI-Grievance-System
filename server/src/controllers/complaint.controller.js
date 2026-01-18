import axios from 'axios';
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

    // --- 1. CALL PYTHON AI SERVICE ---
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

    // --- 2. DYNAMIC DEPARTMENT LOOKUP ---
    let targetDeptId = null;
    let matchedDeptName = 'Unassigned';

    if (aiCategory !== 'Other') {
        const matchedDept = await Department.findOne({
            $or: [
                { name: { $regex: aiCategory, $options: 'i' } },
                { code: { $regex: aiCategory, $options: 'i' } }
            ]
        });

        if (matchedDept) {
            targetDeptId = matchedDept._id;
            matchedDeptName = matchedDept.name;
        }
    }

    // --- 3. AUTO-ASSIGNMENT LOGIC ---
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
    }

    // --- 4. CREATE COMPLAINT ---
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
// ... (imports remain the same: axios, Complaint, User, AuditLog, Officer, Department)

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

    // 3. Internal History (Complaint Timeline)
    complaint.history.push({
      action: `STATUS_CHANGE: ${oldStatus} -> ${status}`,
      performedBy: officerId,
      remarks: remarks || 'Status updated by officer'
    });

    // 4. --- NEW: Add Global Audit Log ---
    await AuditLog.create({
        action: 'STATUS_UPDATE',
        actor: officerId,
        targetId: complaint._id,
        // Shows Complaint ID and the specific change
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
export const reclassifyComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { departmentId, priority } = req.body;

    // 1. Find Complaint & Populate Department to get the OLD Name
    const complaint = await Complaint.findById(id).populate('department');
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

    // 2. Capture Old Values
    const oldDeptObj = complaint.department;
    const oldDeptId = oldDeptObj ? oldDeptObj._id.toString() : 'N/A';
    const oldDeptName = oldDeptObj ? oldDeptObj.name : 'Unassigned';
    
    const oldPriority = complaint.priorityLevel || 'Low'; 

    let isChanged = false;

    // --- LOGIC 1: Handle Department Change ---
    if (departmentId && departmentId !== oldDeptId) {
        // Fetch NEW Department to get its Name
        const newDeptObj = await Department.findById(departmentId);
        const newDeptName = newDeptObj ? newDeptObj.name : 'Unknown Dept';

        complaint.department = departmentId;
        isChanged = true;

        await AuditLog.create({
            action: 'DEPT_REASSIGNMENT',
            actor: req.user._id,
            targetId: complaint._id,
            // Format: Complaint ID | DeptID(Name) -> DeptID(Name)
            details: `Reassigned Complaint :: ${complaint.title} (${complaint._id})   :  ${oldDeptName} (${oldDeptId})   ->  ${newDeptName} (${departmentId})  `
        });
    }

    // --- LOGIC 2: Handle Priority Change ---
    if (priority && priority !== oldPriority) {
        complaint.priorityLevel = priority;
        isChanged = true;

        await AuditLog.create({
            action: 'PRIORITY_UPDATE',
            actor: req.user._id,
            targetId: complaint._id,
            // Format: Complaint ID | Old -> New
            details: `Priority updated for Complaint :: ${complaint.title} (${complaint._id}) :  ${oldPriority}  ->  ${priority}`
        });
    }

    // 3. Save
    if (isChanged) {
        await complaint.save();
    }

    res.status(200).json({ 
        success: true, 
        message: "Complaint updated successfully",
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
    // Adjust logic here if you want them to see *everything* in their dept or just *their* tickets
    if (req.user.role === 'officer') {
       const officer = await Officer.findOne({ user: req.user._id });
       if (officer) filter.department = officer.department; 
    }

    const complaints = await Complaint.find(filter)
      .populate('citizen', 'name email')
      .populate('department', 'name')
      .populate('assignedOfficer', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
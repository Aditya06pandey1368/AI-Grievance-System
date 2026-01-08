import Complaint from '../models/Complaint.model.js';
import User from '../models/User.model.js';
import AuditLog from '../models/AuditLog.model.js';
import Officer from '../models/Officer.model.js';
// Note: We removed Officer import to rely on User Ref for simplicity

// @desc    Submit a new grievance
// @route   POST /api/complaints
export const createComplaint = async (req, res) => {
  try {
    const { title, description, location, zone } = req.body;
    const userId = req.user._id;

    // 1. Validation
    if (!zone || !title || !location) {
      return res.status(400).json({ success: false, message: "Zone is required." });
    }

    // 2. AUTO-ASSIGNMENT LOGIC (Fixed for Exact String Matching)
    let assignedOfficerId = null;
    let complaintStatus = 'submitted';

    // We search for an officer who has the EXACT string "Ward 1 (North)" in their list
    const responsibleOfficer = await Officer.findOne({ 
        jurisdictionZones: { $in: [zone] } 
    }).populate('user');

    if (responsibleOfficer) {
        assignedOfficerId = responsibleOfficer.user._id;
        complaintStatus = 'assigned';
    }

    // 3. AI LOGIC (Fixed Priority Score)
    let aiCategory = 'Other';
    let aiPriorityLevel = 'Medium';
    let aiPriorityScore = 50; // Default Score

    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('fire') || lowerDesc.includes('accident')) {
        aiCategory = 'Fire'; 
        aiPriorityLevel = 'Critical';
        aiPriorityScore = 95; // High score for critical
    } else if (lowerDesc.includes('road') || lowerDesc.includes('pothole')) {
        aiCategory = 'Road';
        aiPriorityLevel = 'High';
        aiPriorityScore = 80;
    } else if (lowerDesc.includes('water')) { 
        aiCategory = 'Water';
        aiPriorityLevel = 'Medium';
        aiPriorityScore = 60;
    }

    // 4. Create Complaint
    const complaint = await Complaint.create({
      title,
      description,
      location,
      zone, 
      citizen: userId,
      
      // AI DATA
      category: aiCategory,
      priorityLevel: aiPriorityLevel,
      priorityScore: aiPriorityScore, // <--- Added Score
      
      assignedOfficer: assignedOfficerId,
      status: complaintStatus, 

      history: [{
        action: 'SUBMITTED',
        performedBy: userId,
        remarks: assignedOfficerId 
          ? `Auto-assigned to ${responsibleOfficer.user.name}` 
          : 'Submitted (Waiting for assignment)'
      }]
    });

    res.status(201).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged-in user's history
// @route   GET /api/complaints/my-history
export const getMyHistory = async (req, res) => {
  try {
    // 1. Default: Show complaints created by this citizen
    let query = { citizen: req.user._id };
    
    // 2. If Officer: Show complaints ASSIGNED to this officer (by User ID)
    if (req.user.role === 'officer') {
        // Since we changed assignedOfficer to Ref 'User', we just match the IDs
        query = { assignedOfficer: req.user._id };
    }

    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .populate('citizen', 'name email');

    res.status(200).json({ success: true, count: complaints.length, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Single Complaint by ID
// @route   GET /api/complaints/:id
export const getComplaintById = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
            .populate('citizen', 'name email')
            .populate('assignedOfficer', 'name'); // Populates Officer Name

        if (!complaint) return res.status(404).json({ message: 'Not Found' });

        res.json({ success: true, data: complaint });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update Status & Handle Trust Score logic
// @route   PUT /api/complaints/:id/status
export const updateComplaintStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const complaintId = req.params.id;
    const officerId = req.user._id;

    const complaint = await Complaint.findById(complaintId).populate('citizen');

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const oldStatus = complaint.status;
    complaint.status = status;

    // 1. ADD HISTORY LOG
    complaint.history.push({
      action: `STATUS_CHANGE: ${oldStatus} -> ${status}`,
      performedBy: officerId,
      remarks: remarks || 'Status updated by officer'
    });

    // 2. TRUST SCORE LOGIC (Anti-Fraud)
    if (status === 'rejected') {
      const citizen = await User.findById(complaint.citizen._id);
      if (citizen) {
          // Decrease score by 10
          citizen.trustScore = Math.max(0, citizen.trustScore - 10);
          
          // Auto-Ban if score drops below 20
          if (citizen.trustScore < 20) {
            citizen.isActive = false;
            // Log the ban
            if (AuditLog) {
                await AuditLog.create({
                    action: 'USER_BANNED',
                    targetId: citizen._id,
                    details: 'Auto-ban due to low trust score',
                    actor: officerId
                });
            }
          }
          await citizen.save();
      }
    }

    await complaint.save();

    res.json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
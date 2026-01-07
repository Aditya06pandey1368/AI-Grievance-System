import * as complaintService from '../services/complaint.service.js';
import Complaint from '../models/Complaint.model.js';
import User from '../models/User.model.js';
import Officer from '../models/Officer.model.js';
import AuditLog from '../models/AuditLog.model.js';

// @desc    Submit a new grievance
// @route   POST /api/complaints
export const submitComplaint = async (req, res) => {
  try {
    const { title, description, location, zone } = req.body;
    const userId = req.user._id;

    if (!zone) {
      return res.status(400).json({ success: false, message: "Zone is required for routing." });
    }

    // Handle Multiple Images
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    }

    const complaint = await complaintService.createNewComplaint(
      title, description, userId, location, zone, imageUrls
    );

    res.status(201).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged-in user's history
// @route   GET /api/complaints/my-history
export const getMyHistory = async (req, res) => {
  try {
    // If officer, show assigned complaints. If citizen, show submitted.
    let query = { citizen: req.user._id };
    
    if (req.user.role === 'officer') {
      const officerProfile = await Officer.findOne({ user: req.user._id });
      if (officerProfile) {
        query = { assignedOfficer: officerProfile._id };
      }
    }

    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .populate('department', 'name');

    res.status(200).json({ success: true, count: complaints.length, data: complaints });
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
      
      // Decrease score by 10
      citizen.trustScore = Math.max(0, citizen.trustScore - 10);
      
      // Auto-Ban if score drops below 20
      if (citizen.trustScore < 20) {
        citizen.isActive = false;
        await AuditLog.create({
            action: 'USER_BANNED',
            targetId: citizen._id,
            details: 'Auto-ban due to low trust score',
        });
      }
      await citizen.save();
    }

    // 3. OFFICER STATS LOGIC
    if (status === 'resolved' && oldStatus !== 'resolved') {
      // Find the officer profile associated with the current user
      await Officer.findOneAndUpdate(
        { user: officerId }, 
        { $inc: { resolvedComplaints: 1, activeComplaints: -1 } }
      );
    }

    await complaint.save();

    res.json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
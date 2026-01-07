import * as complaintService from '../services/complaint.service.js';

// @desc    Submit a new grievance
// @route   POST /api/complaints
// @access  Private (Citizen)
export const submitComplaint = async (req, res) => {
  try {
    console.log("📂 File received:", req.file);
    const { title, description, location } = req.body;
    const userId = req.user._id;

    // 👇 Check if a file was uploaded
    let imageUrl = '';
    if (req.file) {
      // Create the URL: http://localhost:5000/uploads/filename.jpg
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Call service (Pass imageUrl)
    const complaint = await complaintService.createNewComplaint(
      title, 
      description, 
      userId, 
      location,
      imageUrl // <--- Pass this new arg
    );

    res.status(201).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged-in user's history
// @route   GET /api/complaints/my-history
// @access  Private
export const getMyHistory = async (req, res) => {
  try {
    const complaints = await complaintService.getUserComplaints(req.user._id);
    res.status(200).json({ success: true, count: complaints.length, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get ALL complaints (Admin only)
// @route   GET /api/complaints/admin/all
export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await complaintService.getAllComplaints();
    res.json({ success: true, count: complaints.length, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Status (e.g., "In Progress" -> "Resolved")
// @route   PUT /api/complaints/:id
export const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await complaintService.updateStatus(req.params.id, status);
    res.json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
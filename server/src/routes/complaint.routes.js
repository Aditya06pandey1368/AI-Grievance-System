import express from 'express';
// import multer from 'multer'; // <-- Not needed because you import 'upload' below
import { upload } from '../middlewares/uploadMiddleware.js'; // <-- Using your existing middleware
import { 
  submitComplaint, 
  getMyHistory, 
  getAllComplaints, 
  updateComplaintStatus 
} from '../controllers/complaint.controller.js';

import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// --- CITIZEN ROUTES ---

// 1. Submit Complaint
// We use 'upload.single' here. This fixes the "destructure" error by parsing the form data.
// NOTE: I removed the duplicate route that didn't have 'upload.single'.
router.post('/', protect, upload.single('image'), submitComplaint);

// 2. Get History
router.get('/my-history', protect, getMyHistory);


// --- ADMIN ROUTES ---

router.get('/admin/all', protect, authorize('admin', 'officer'), getAllComplaints);
router.put('/:id', protect, authorize('admin', 'officer'), updateComplaintStatus);

export default router;
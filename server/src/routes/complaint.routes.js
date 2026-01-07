import express from 'express';
import upload from '../middlewares/uploadMiddleware.js'; 
import { 
  submitComplaint, 
  getMyHistory, 
  updateComplaintStatus 
} from '../controllers/complaint.controller.js';

import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

// --- CITIZEN ROUTES ---

// 1. Submit Complaint
// We use 'upload.array' here to support up to 5 images
router.post('/', protect, upload.array('images', 5), submitComplaint);

// 2. Get History
router.get('/my-history', protect, getMyHistory);


// --- OFFICER / ADMIN ROUTES ---

// Update Status (Only Officers and Dept Admins can do this)
router.put('/:id/status', protect, authorize('officer', 'dept_admin', 'super_admin'), updateComplaintStatus);

export default router;
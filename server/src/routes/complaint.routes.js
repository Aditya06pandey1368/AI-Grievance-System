import express from 'express';
// 👇 UPDATE THIS IMPORT LINE
import { 
  submitComplaint, 
  getMyHistory, 
  getAllComplaints,       // <-- You were missing this
  updateComplaintStatus   // <-- And this
} from '../controllers/complaint.controller.js';

import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Citizen Routes
router.post('/', protect, submitComplaint);
router.get('/my-history', protect, getMyHistory);

// Admin Routes (Protected + Authorized)
// Now Node knows what 'getAllComplaints' is!
router.get('/admin/all', protect, authorize('admin', 'officer'), getAllComplaints);
router.put('/:id', protect, authorize('admin', 'officer'), updateComplaintStatus);

export default router;
import express from 'express';
import upload from '../middlewares/uploadMiddleware.js'; 
import { 
  createComplaint, 
  getMyHistory, 
  getComplaintById, 
  updateComplaintStatus,
  getAllComplaints, 
  reclassifyComplaint
} from '../controllers/complaint.controller.js';

import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

// --- DASHBOARD ROUTES ---
// Fix: Added 'officer' so they can load the table data
router.get("/admin/all", protect, authorize('super_admin', 'dept_admin', 'officer'), getAllComplaints);


// --- CITIZEN ROUTES ---
router.post('/', protect, upload.array('images', 5), createComplaint); 
router.get('/my-history', protect, getMyHistory);


// --- SHARED / DYNAMIC ROUTES ---
router.get('/:id', protect, getComplaintById); 

// --- FEATURE: HUMAN IN THE LOOP ---
// Fix: Added 'officer' so they can manually correct AI mistakes
router.put('/:id/reclassify', protect, authorize('dept_admin', 'super_admin', 'officer'), reclassifyComplaint);

// Update Status
router.patch('/:id/status', protect, authorize('officer', 'dept_admin', 'super_admin'), updateComplaintStatus);

export default router;
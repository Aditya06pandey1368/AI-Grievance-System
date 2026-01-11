import express from 'express';
import upload from '../middlewares/uploadMiddleware.js'; 
import { 
  createComplaint, 
  getMyHistory, 
  getComplaintById, 
  updateComplaintStatus,
  getAllComplaintsForAdmin
} from '../controllers/complaint.controller.js';

import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

// --- ADMIN ROUTES ---
// ⚠️ IMPORTANT: This MUST come BEFORE '/:id' or Express will think "admin" is an ID.
// I replaced 'verifyToken'/'verifyAdmin' with your imported 'protect'/'authorize'
router.get("/admin/all", protect, authorize('super_admin'), getAllComplaintsForAdmin);


// --- CITIZEN ROUTES ---

// 1. Submit Complaint
router.post('/', protect, upload.array('images', 5), createComplaint); 

// 2. Get History
router.get('/my-history', protect, getMyHistory);


// --- SHARED / DYNAMIC ROUTES ---

// 3. Get Single Complaint Details
// This captures anything not matched above (e.g. /12345)
router.get('/:id', protect, getComplaintById); 


// --- OFFICER / ADMIN ROUTES ---

// Update Status
router.put('/:id/status', protect, authorize('officer', 'dept_admin', 'super_admin'), updateComplaintStatus);

export default router;
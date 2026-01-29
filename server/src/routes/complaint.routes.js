import express from 'express';
import upload from '../middlewares/uploadMiddleware.js'; 
import { 
  createComplaint, 
  getMyHistory, 
  getComplaintById, 
  updateComplaintStatus,
  getAllComplaints, 
  reclassifyComplaint,
  triggerAIRetraining // <--- Imported the new controller function
} from '../controllers/complaint.controller.js';

import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

// --- 1. ADMIN & DASHBOARD ROUTES ---
// Get all complaints (Filtered by jurisdiction inside controller)
// Added 'officer' so they can load their dashboard table
router.get("/admin/all", protect, authorize('super_admin', 'dept_admin', 'officer'), getAllComplaints);

// --- 2. AI MANAGEMENT ROUTES (NEW) ---
// Trigger manual retraining of the AI Model
// Restricted to 'super_admin' only to prevent spamming the Python server
router.post('/retrain-ai', protect, authorize('super_admin'), triggerAIRetraining);

// --- 3. CITIZEN ROUTES ---
// Submit a new complaint with images
router.post('/', protect, upload.array('images', 5), createComplaint); 

// Get logged-in user's history
router.get('/my-history', protect, getMyHistory);

// --- 4. SHARED / DYNAMIC ROUTES ---
// Get specific complaint details by ID
// (Placed after specific routes like 'my-history' to avoid conflict)
router.get('/:id', protect, getComplaintById); 

// --- 5. ACTION ROUTES ---
// Reclassify Department/Priority (Human in the Loop) -> Teaches AI
// Added 'officer' so they can manually correct AI mistakes if assigned incorrectly
router.put('/:id/reclassify', protect, authorize('dept_admin', 'super_admin', 'officer'), reclassifyComplaint);

// Update Status (Assigned -> In Progress -> Resolved)
router.patch('/:id/status', protect, authorize('officer', 'dept_admin', 'super_admin'), updateComplaintStatus);

export default router;
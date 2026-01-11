import express from 'express';
import { 
    createOfficer, 
    getAllUsers, 
    getAllOfficers, 
    deleteUser, 
    updateUserStatus,
    getAllAuditLogs // <--- Added missing import
} from '../controllers/admin.controller.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

// Apply 'protect' to all routes automatically
router.use(protect);

router.post('/create-officer', authorize('super_admin', 'dept_admin'), createOfficer);
router.get('/users', authorize('super_admin', 'dept_admin'), getAllUsers);

// NEW ROUTES
router.get('/officers', authorize('super_admin', 'dept_admin'), getAllOfficers);
router.delete('/users/:id', authorize('super_admin', 'dept_admin'), deleteUser);

// FIXED LOGS ROUTE:
// 1. Removed 'verifyToken' (handled by router.use(protect) above)
// 2. Replaced 'verifyAdmin' with authorize('super_admin')
router.get("/logs", authorize('super_admin'), getAllAuditLogs);

router.put('/users/:id/status', authorize('super_admin', 'dept_admin'), updateUserStatus);

export default router;
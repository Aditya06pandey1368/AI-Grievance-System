import express from 'express';
import { 
    createOfficer, 
    getAllUsers, 
    getAllOfficers, 
    deleteUser, 
    updateUserStatus,
    getAllAuditLogs,
    getAllDepartments,
    updateOfficer
} from '../controllers/admin.controller.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

router.use(protect);

// Admin-only routes
router.post('/create-officer', authorize('super_admin', 'dept_admin'), createOfficer);
router.get('/users', authorize('super_admin', 'dept_admin'), getAllUsers);
router.delete('/users/:id', authorize('super_admin', 'dept_admin'), deleteUser);
router.put('/users/:id/status', authorize('super_admin', 'dept_admin'), updateUserStatus);
router.get("/logs", authorize('super_admin'), getAllAuditLogs);
router.put('/officers/:id', protect, authorize('dept_admin', 'super_admin'), updateOfficer);

// SHARED ROUTES (Added 'officer')
// Officers need this to view the dashboard stats
router.get('/officers', authorize('super_admin', 'dept_admin', 'officer'), getAllOfficers);

// Officers need this to populate the "Reassign Department" dropdown
router.get('/departments', authorize('dept_admin', 'super_admin', 'officer'), getAllDepartments);

export default router;
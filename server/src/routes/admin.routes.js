import express from 'express';
import { 
    createOfficer, 
    getAllUsers, 
    updateUserStatus 
} from '../controllers/admin.controller.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

// All routes here require protection
router.use(protect);

// Create Officer: Only Super Admin or Dept Admin
router.post('/create-officer', authorize('super_admin', 'dept_admin'), createOfficer);

// Get All Users: Only Admins
router.get('/users', authorize('super_admin', 'dept_admin'), getAllUsers);

// Ban/Unban User: Only Admins
router.put('/users/:id/status', authorize('super_admin', 'dept_admin'), updateUserStatus);

export default router;
import express from 'express';
import { 
    createOfficer, 
    getAllUsers, 
    getAllOfficers, // <--- New Import
    deleteUser,     // <--- New Import
    updateUserStatus 
} from '../controllers/admin.controller.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/create-officer', authorize('super_admin', 'dept_admin'), createOfficer);
router.get('/users', authorize('super_admin', 'dept_admin'), getAllUsers);

// NEW ROUTES FOR BUG 4
router.get('/officers', authorize('super_admin', 'dept_admin'), getAllOfficers);
router.delete('/users/:id', authorize('super_admin', 'dept_admin'), deleteUser);

router.put('/users/:id/status', authorize('super_admin', 'dept_admin'), updateUserStatus);

export default router;
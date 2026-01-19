import express from 'express';
import { 
    createDepartment, 
    getAllDepartments, 
    deleteDepartment, 
    updateDepartment 
} from '../controllers/department.controller.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('super_admin'), createDepartment);
router.get('/', protect, authorize('super_admin'), getAllDepartments);
router.delete('/:id', protect, authorize('super_admin'), deleteDepartment);
router.put('/:id', protect, authorize('super_admin'), updateDepartment);

export default router;
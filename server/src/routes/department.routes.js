import express from 'express';
import { createDepartment, getDepartments } from '../controllers/department.controller.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

// Public: List departments
router.get('/', getDepartments);

// Private: Only 'super_admin' can create a department
router.post('/', protect, authorize('super_admin'), createDepartment);

export default router;
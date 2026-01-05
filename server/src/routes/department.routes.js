import express from 'express';
import { createDepartment, getDepartments } from '../controllers/department.controller.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public: Anyone can see the list of departments
router.get('/', getDepartments);

// Private: Only 'super_admin' can create a department
// Notice how we chain the middleware: protect -> authorize -> controller
router.post('/', protect, authorize('super_admin'), createDepartment);

export default router;
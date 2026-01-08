import express from 'express';
import { 
  createDepartment, 
  getAllDepartments // <--- CHANGED from 'getDepartments' to 'getAllDepartments'
} from '../controllers/department.controller.js';

// Import middlewares if you are using them to protect routes
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

// Route: POST /api/departments
// Create a new Department (Only Super Admin can do this)
router.post('/', protect, authorize('super_admin'), createDepartment);

// Route: GET /api/departments
// Get all departments (Useful for dropdowns in frontend)
router.get('/', getAllDepartments);

export default router;
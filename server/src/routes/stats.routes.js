import express from 'express';
import { getDashboardStats } from '../controllers/stats.controller.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

// Accessible by Officer, Dept Admin, and Super Admin
router.get('/dashboard', protect, authorize('officer', 'dept_admin', 'super_admin'), getDashboardStats);

export default router;
import express from 'express';
import { getSLAStatus } from '../controllers/sla.controller.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

router.get('/tracker', protect, authorize('super_admin', 'dept_admin'), getSLAStatus);

export default router;
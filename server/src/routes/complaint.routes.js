import express from 'express';
import { submitComplaint, getMyHistory } from '../controllers/complaint.controller.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes here need the user to be logged in
router.post('/', protect, submitComplaint);
router.get('/my-history', protect, getMyHistory);

export default router;
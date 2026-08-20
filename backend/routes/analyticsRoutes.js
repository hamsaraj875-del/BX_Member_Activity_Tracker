import express from 'express';
import { getDashboardAnalytics, getDetailedAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardAnalytics);
router.get('/detailed', getDetailedAnalytics);

export default router;

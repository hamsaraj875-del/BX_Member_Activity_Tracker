import express from 'express';
import { getActivities, getMemberActivities, createActivity } from '../controllers/activityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getActivities);
router.get('/member/:id', getMemberActivities);
router.post('/', createActivity);

export default router;

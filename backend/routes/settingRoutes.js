import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getSettings);
router.put('/', authorize('superadmin'), updateSettings);

export default router;

import express from 'express';
import { getContributions, createContribution, verifyContribution } from '../controllers/contributionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getContributions);
router.post('/', createContribution);
router.put('/:id/verify', authorize('superadmin', 'lead'), verifyContribution);

export default router;

import express from 'express';
import {
  getMembers,
  getMemberById,
  updateMemberProfile,
  syncMember,
  syncAllMembers,
  deleteMember,
} from '../controllers/memberController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getMembers);
router.get('/:id', getMemberById);
router.put('/:id', updateMemberProfile);
router.post('/:id/sync', syncMember);
router.post('/sync-all', authorize('superadmin'), syncAllMembers);
router.delete('/:id', authorize('superadmin'), deleteMember);

export default router;

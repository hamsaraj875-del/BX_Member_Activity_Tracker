import express from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  regenerateQR,
} from '../controllers/eventController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', authorize('superadmin', 'lead'), createEvent);
router.put('/:id', authorize('superadmin', 'lead'), updateEvent);
router.delete('/:id', authorize('superadmin', 'lead'), deleteEvent);
router.post('/:id/regenerate-qr', authorize('superadmin', 'lead'), regenerateQR);

export default router;

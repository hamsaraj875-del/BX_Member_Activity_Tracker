import express from 'express';
import {
  markAttendanceViaQR,
  markAttendanceManual,
  getMemberAttendanceAnalytics,
  getClubAttendanceAnalytics,
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/mark-qr', markAttendanceViaQR);
router.post('/mark-manual', authorize('superadmin', 'lead'), markAttendanceManual);
router.get('/member/:id', getMemberAttendanceAnalytics);
router.get('/analytics', getClubAttendanceAnalytics);

export default router;

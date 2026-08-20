import express from 'express';
import { register, login, logout, getMe, updatePassword, forgotPassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.post('/forgotpassword', forgotPassword);
router.get('/me', protect, getMe);
router.put('/updatepassword', protect, updatePassword);

export default router;

import User from '../models/User.js';
import MemberProfile from '../models/MemberProfile.js';

export const protect = async (req, res, next) => {
  let userId = req.session?.userId;

  // Cross-domain fallback: check Authorization header if cookie was blocked
  if (!userId && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    const token = req.headers.authorization.split(' ')[1];
    if (token && token !== 'null' && token !== 'undefined') {
      userId = token;
    }
  }

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated. Session expired or not logged in. Please login.',
    });
  }

  try {
    const user = await User.findById(userId).select('-password');

    if (!user) {
      req.session.destroy();
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this session no longer exists.',
      });
    }

    if (user.status === 'inactive' || user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact BX leadership.',
      });
    }

    req.user = user;
    
    // Attach profileId to req.user for easy reference in controllers
    if (!req.user.profileId) {
      const profile = await MemberProfile.findOne({ user: user._id }).select('_id');
      if (profile) {
        req.user.profileId = profile._id;
      }
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Session validation error: ' + error.message,
    });
  }
};

import User from '../models/User.js';
import MemberProfile from '../models/MemberProfile.js';

export const protect = async (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated. Session expired or not logged in. Please login.',
    });
  }

  try {
    const user = await User.findById(req.session.userId).select('-password');

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

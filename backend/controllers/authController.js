import User from '../models/User.js';
import MemberProfile from '../models/MemberProfile.js';
import { syncMemberPlatforms } from '../services/platformAggregator.js';

// @desc    Register a new user & initialize MongoDB session
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, department = 'CSE', year = 1, bxRole = 'Member', platforms = [] } = req.body;
    const cleanEmail = email?.toLowerCase().trim();

    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // First user registered becomes superadmin automatically
    const count = await User.countDocuments({});
    const role = count === 0 ? 'superadmin' : 'member';

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role,
      status: 'active',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
    });

    const defaultPlatforms = [
      { name: 'github', username: '', profileUrl: '' },
      { name: 'leetcode', username: '', profileUrl: '' },
      { name: 'codeforces', username: '', profileUrl: '' },
      { name: 'kaggle', username: '', profileUrl: '' },
    ];

    const initialPlatforms = platforms.length > 0 ? platforms : defaultPlatforms;

    const profile = await MemberProfile.create({
      user: user._id,
      department,
      year,
      bxRole,
      platforms: initialPlatforms,
    });

    // Save session in MongoDB
    req.session.userId = user._id.toString();
    req.session.userRole = user.role;

    // Background sync if usernames provided
    if (platforms.some(p => p.username)) {
      syncMemberPlatforms(profile).catch(err => console.error('Sync error on register:', err.message));
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        profileId: profile._id,
        department: profile.department,
        year: profile.year,
        bxRole: profile.bxRole,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & start MongoDB session
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. No account found with this email. Please register first.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your email/password.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Your account is inactive. Please contact club administration.' });
    }

    // Save session in MongoDB
    req.session.userId = user._id.toString();
    req.session.userRole = user.role;

    const profile = await MemberProfile.findOne({ user: user._id });

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        profileId: profile?._id,
        department: profile?.department || 'CSE',
        year: profile?.year || 1,
        bxRole: profile?.bxRole || 'Member',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user & destroy MongoDB session
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Could not log out. Please try again.' });
      }
      res.clearCookie('connect.sid');
      res.json({ success: true, message: 'Logged out successfully' });
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user & profile from session
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const profile = await MemberProfile.findOne({ user: req.user.id });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        status: user.status,
        createdAt: user.createdAt,
        profileId: profile?._id,
        department: profile?.department || 'CSE',
        year: profile?.year || 1,
        bxRole: profile?.bxRole || 'Member',
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password does not match' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password handler
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with that email' });
    }

    res.json({
      success: true,
      message: 'Password reset link simulated: Please check your inbox or use password: "password123" for demo accounts.',
    });
  } catch (error) {
    next(error);
  }
};

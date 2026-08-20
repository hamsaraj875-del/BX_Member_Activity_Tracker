import MemberProfile from '../models/MemberProfile.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import Contribution from '../models/Contribution.js';
import Attendance from '../models/Attendance.js';
import { syncMemberPlatforms } from '../services/platformAggregator.js';

// @desc    Get all members with search, department, year, role filters
// @route   GET /api/members
// @access  Private
export const getMembers = async (req, res, next) => {
  try {
    const { search, department, year, role, sortBy = 'totalContributions', sortOrder = 'desc', page = 1, limit = 50 } = req.query;

    const query = {};

    if (department && department !== 'all') {
      query.department = department;
    }

    if (year && year !== 'all') {
      query.year = Number(year);
    }

    if (role && role !== 'all') {
      query.bxRole = role;
    }

    let memberProfiles = await MemberProfile.find(query)
      .populate('user', 'name email role status avatar createdAt')
      .lean();

    // Filter by search string across name, email, department, skills, platform usernames
    if (search) {
      const q = search.toLowerCase();
      memberProfiles = memberProfiles.filter((m) => {
        const nameMatch = m.user?.name?.toLowerCase().includes(q);
        const emailMatch = m.user?.email?.toLowerCase().includes(q);
        const deptMatch = m.department?.toLowerCase().includes(q);
        const roleMatch = m.bxRole?.toLowerCase().includes(q);
        const skillMatch = m.skills?.some(s => s.toLowerCase().includes(q));
        const platformMatch = m.platforms?.some(p => p.username?.toLowerCase().includes(q));
        return nameMatch || emailMatch || deptMatch || roleMatch || skillMatch || platformMatch;
      });
    }

    // Sorting
    memberProfiles.sort((a, b) => {
      let valA = 0;
      let valB = 0;

      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? (a.user?.name || '').localeCompare(b.user?.name || '')
          : (b.user?.name || '').localeCompare(a.user?.name || '');
      } else if (sortBy === 'githubCommits') {
        valA = a.statsSummary?.githubCommits || 0;
        valB = b.statsSummary?.githubCommits || 0;
      } else if (sortBy === 'leetcodeSolved') {
        valA = a.statsSummary?.leetcodeSolved || 0;
        valB = b.statsSummary?.leetcodeSolved || 0;
      } else if (sortBy === 'attendanceRate') {
        valA = a.statsSummary?.attendanceRate || 0;
        valB = b.statsSummary?.attendanceRate || 0;
      } else {
        // default totalContributions
        valA = a.statsSummary?.totalContributions || 0;
        valB = b.statsSummary?.totalContributions || 0;
      }

      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    const total = memberProfiles.length;
    const startIndex = (page - 1) * limit;
    const paginated = memberProfiles.slice(startIndex, startIndex + Number(limit));

    res.json({
      success: true,
      count: paginated.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: paginated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single member profile with full deep activity, attendance & contributions
// @route   GET /api/members/:id
// @access  Private
export const getMemberById = async (req, res, next) => {
  try {
    const profile = await MemberProfile.findById(req.params.id)
      .populate('user', 'name email role status avatar createdAt')
      .lean();

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Member profile not found' });
    }

    // Fetch recent activities
    const recentActivities = await Activity.find({ member: profile._id })
      .sort({ date: -1 })
      .limit(30)
      .lean();

    // Fetch contributions
    const contributions = await Contribution.find({ member: profile._id })
      .sort({ date: -1 })
      .lean();

    // Fetch attendance history
    const attendances = await Attendance.find({ member: profile._id })
      .populate('event', 'title date location type')
      .sort({ markedAt: -1 })
      .lean();

    // Calculate ranking relative to all members
    const allMembers = await MemberProfile.find({})
      .select('statsSummary.totalContributions')
      .sort({ 'statsSummary.totalContributions': -1 })
      .lean();

    const rank = allMembers.findIndex(m => m._id.toString() === profile._id.toString()) + 1;

    res.json({
      success: true,
      data: {
        ...profile,
        rank: rank > 0 ? rank : 1,
        recentActivities,
        contributions,
        attendances,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update member profile (User can update self, Superadmin/Lead can update any)
// @route   PUT /api/members/:id
// @access  Private
export const updateMemberProfile = async (req, res, next) => {
  try {
    let profile = await MemberProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Member profile not found' });
    }

    // Authorization check: user can only edit their own profile unless superadmin or lead
    const isOwner = profile.user.toString() === req.user.id;
    const isStaff = ['superadmin', 'lead'].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this profile' });
    }

    const { department, year, bxRole, bio, phone, skills, platforms, socialLinks, name, avatar } = req.body;

    if (department) profile.department = department;
    if (year) profile.year = year;
    if (bio !== undefined) profile.bio = bio;
    if (phone !== undefined) profile.phone = phone;
    if (skills) profile.skills = skills;
    if (socialLinks) profile.socialLinks = socialLinks;

    // Only staff can promote/change BX Role
    if (bxRole && isStaff) {
      profile.bxRole = bxRole;
    }

    // Update platforms array
    if (platforms && Array.isArray(platforms)) {
      profile.platforms = platforms;
    }

    await profile.save();

    // Also update User record if name or avatar changed
    if (name || avatar) {
      const user = await User.findById(profile.user);
      if (user) {
        if (name) user.name = name;
        if (avatar) user.avatar = avatar;
        await user.save();
      }
    }

    // Auto-sync after platform change
    const updated = await syncMemberPlatforms(profile);

    const populated = await MemberProfile.findById(updated._id).populate('user', 'name email role status avatar');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger platform data sync for a member
// @route   POST /api/members/:id/sync
// @access  Private
export const syncMember = async (req, res, next) => {
  try {
    const profile = await MemberProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Member profile not found' });
    }

    const synced = await syncMemberPlatforms(profile);
    const populated = await MemberProfile.findById(synced._id).populate('user', 'name email role status avatar');

    res.json({
      success: true,
      message: 'Platforms synced successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sync all members platform data (Superadmin only)
// @route   POST /api/members/sync-all
// @access  Private (Superadmin)
export const syncAllMembers = async (req, res, next) => {
  try {
    const profiles = await MemberProfile.find({});
    for (let p of profiles) {
      await syncMemberPlatforms(p);
    }

    res.json({
      success: true,
      message: `Successfully synchronized platform stats for all ${profiles.length} members.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a member (Superadmin only)
// @route   DELETE /api/members/:id
// @access  Private (Superadmin)
export const deleteMember = async (req, res, next) => {
  try {
    const profile = await MemberProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Member profile not found' });
    }

    await User.findByIdAndDelete(profile.user);
    await Activity.deleteMany({ member: profile._id });
    await Contribution.deleteMany({ member: profile._id });
    await Attendance.deleteMany({ member: profile._id });
    await MemberProfile.findByIdAndDelete(profile._id);

    res.json({
      success: true,
      message: 'Member and all associated data deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

import Activity from '../models/Activity.js';
import MemberProfile from '../models/MemberProfile.js';

// @desc    Get activity logs with multi-filters (member, platform, department, year, date range)
// @route   GET /api/activity
// @access  Private
export const getActivities = async (req, res, next) => {
  try {
    const {
      memberId,
      platform,
      activityType,
      department,
      year,
      startDate,
      endDate,
      limit = 50,
      page = 1,
    } = req.query;

    const query = {};

    if (memberId && memberId !== 'all') {
      query.member = memberId;
    }

    if (platform && platform !== 'all') {
      query.platform = platform;
    }

    if (activityType && activityType !== 'all') {
      query.activityType = activityType;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // If department or year filter is supplied, resolve member IDs first
    if ((department && department !== 'all') || (year && year !== 'all')) {
      const memberQuery = {};
      if (department && department !== 'all') memberQuery.department = department;
      if (year && year !== 'all') memberQuery.year = Number(year);

      const matchedMembers = await MemberProfile.find(memberQuery).select('_id');
      const memberIds = matchedMembers.map(m => m._id);

      if (query.member) {
        // If already filtered by member, make sure it's in the list
        if (!memberIds.some(id => id.toString() === query.member.toString())) {
          return res.json({ success: true, count: 0, total: 0, data: [] });
        }
      } else {
        query.member = { $in: memberIds };
      }
    }

    const total = await Activity.countDocuments(query);
    const activities = await Activity.find(query)
      .populate({
        path: 'member',
        select: 'department year bxRole',
        populate: { path: 'user', select: 'name avatar email' },
      })
      .sort({ date: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      count: activities.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get activity logs for a specific member
// @route   GET /api/activity/member/:id
// @access  Private
export const getMemberActivities = async (req, res, next) => {
  try {
    const activities = await Activity.find({ member: req.params.id })
      .sort({ date: -1 })
      .limit(100)
      .lean();

    res.json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manually log an activity / achievement
// @route   POST /api/activity
// @access  Private
export const createActivity = async (req, res, next) => {
  try {
    const { memberId, platform, activityType, value = 1, metadata = {}, date = new Date() } = req.body;

    const profile = await MemberProfile.findById(memberId || req.user.profileId);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Member profile not found' });
    }

    const activity = await Activity.create({
      member: profile._id,
      user: profile.user,
      platform,
      activityType,
      value,
      date,
      metadata,
    });

    res.status(201).json({
      success: true,
      message: 'Activity recorded successfully',
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

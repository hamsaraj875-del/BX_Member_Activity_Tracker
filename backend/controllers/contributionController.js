import Contribution from '../models/Contribution.js';
import MemberProfile from '../models/MemberProfile.js';

// @desc    Get contributions list with filters
// @route   GET /api/contributions
// @access  Private
export const getContributions = async (req, res, next) => {
  try {
    const { memberId, source, type, department, limit = 50, page = 1 } = req.query;

    const query = {};
    if (memberId && memberId !== 'all') query.member = memberId;
    if (source && source !== 'all') query.source = source;
    if (type && type !== 'all') query.type = type;

    if (department && department !== 'all') {
      const matched = await MemberProfile.find({ department }).select('_id');
      query.member = { $in: matched.map(m => m._id) };
    }

    const total = await Contribution.countDocuments(query);
    const contributions = await Contribution.find(query)
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
      count: contributions.length,
      total,
      data: contributions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new contribution record
// @route   POST /api/contributions
// @access  Private
export const createContribution = async (req, res, next) => {
  try {
    const { memberId, source, type, title, description, date, impactScore = 10, link, metadata = {} } = req.body;

    let targetMemberId = memberId;
    if (!targetMemberId) {
      const selfProfile = await MemberProfile.findOne({ user: req.user.id });
      targetMemberId = selfProfile?._id;
    }

    const profile = await MemberProfile.findById(targetMemberId);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Target member profile not found' });
    }

    const isStaff = ['superadmin', 'lead'].includes(req.user.role);

    const contribution = await Contribution.create({
      member: profile._id,
      user: profile.user,
      source: source || 'project',
      type: type || 'code_commit',
      title,
      description,
      date: date || new Date(),
      verified: isStaff ? true : false,
      impactScore: Number(impactScore) || 10,
      link,
      metadata,
    });

    // Update member total contributions
    profile.statsSummary.totalContributions = (profile.statsSummary.totalContributions || 0) + Number(impactScore);
    await profile.save();

    res.status(201).json({
      success: true,
      message: 'Contribution logged successfully',
      data: contribution,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify or edit a contribution (Staff only)
// @route   PUT /api/contributions/:id/verify
// @access  Private (Admin/Lead)
export const verifyContribution = async (req, res, next) => {
  try {
    const contribution = await Contribution.findById(req.params.id);
    if (!contribution) {
      return res.status(404).json({ success: false, message: 'Contribution not found' });
    }

    contribution.verified = req.body.verified !== undefined ? req.body.verified : true;
    await contribution.save();

    res.json({
      success: true,
      message: 'Contribution verification status updated',
      data: contribution,
    });
  } catch (error) {
    next(error);
  }
};

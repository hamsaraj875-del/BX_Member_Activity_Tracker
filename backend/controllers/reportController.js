import Report from '../models/Report.js';
import MemberProfile from '../models/MemberProfile.js';
import Activity from '../models/Activity.js';
import Contribution from '../models/Contribution.js';
import Event from '../models/Event.js';
import Attendance from '../models/Attendance.js';

// @desc    Generate a report (Individual, Monthly, or Club)
// @route   POST /api/reports/generate
// @access  Private
export const generateReport = async (req, res, next) => {
  try {
    const { type = 'club', memberId, department = 'all', year = 'all', startDate, endDate } = req.body;

    let title = '';
    let summaryData = {};

    if (type === 'individual') {
      const targetId = memberId || req.user.profileId;
      const profile = await MemberProfile.findById(targetId).populate('user', 'name email role avatar');

      if (!profile) {
        return res.status(404).json({ success: false, message: 'Member profile not found' });
      }

      title = `Member Activity & Performance Report: ${profile.user?.name}`;

      const activities = await Activity.find({ member: profile._id }).sort({ date: -1 }).limit(50).lean();
      const contributions = await Contribution.find({ member: profile._id }).sort({ date: -1 }).lean();
      const attendances = await Attendance.find({ member: profile._id }).populate('event', 'title date location').lean();

      summaryData = {
        member: {
          id: profile._id,
          name: profile.user?.name,
          email: profile.user?.email,
          department: profile.department,
          year: profile.year,
          bxRole: profile.bxRole,
        },
        stats: profile.statsSummary,
        platforms: profile.platforms,
        recentActivities: activities,
        contributions: contributions,
        attendanceHistory: attendances,
        generatedAt: new Date(),
      };
    } else if (type === 'monthly') {
      const now = new Date();
      title = `Monthly BX Club Performance Summary (${now.toLocaleString('default', { month: 'long', year: 'numeric' })})`;

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      const topContributors = await MemberProfile.find({})
        .populate('user', 'name email')
        .sort({ 'statsSummary.totalContributions': -1 })
        .limit(10)
        .lean();

      const monthlyActivities = await Activity.find({
        date: { $gte: startOfMonth, $lte: endOfMonth },
      }).lean();

      const eventsCount = await Event.countDocuments({
        date: { $gte: startOfMonth, $lte: endOfMonth },
      });

      summaryData = {
        month: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
        totalMonthlyActivities: monthlyActivities.length,
        eventsHosted: eventsCount,
        topContributors: topContributors.map(t => ({
          name: t.user?.name,
          department: t.department,
          contributions: t.statsSummary?.totalContributions,
          attendanceRate: t.statsSummary?.attendanceRate,
        })),
        generatedAt: new Date(),
      };
    } else {
      // Club-wide report
      title = `BX Technical Club Complete Intelligence & Activity Audit Report`;

      const members = await MemberProfile.find({}).populate('user', 'name email role').lean();
      const events = await Event.find({}).lean();
      const totalContributionsCount = await Contribution.countDocuments({});

      const deptSummary = {};
      members.forEach(m => {
        const d = m.department || 'Other';
        if (!deptSummary[d]) deptSummary[d] = { count: 0, totalScore: 0 };
        deptSummary[d].count += 1;
        deptSummary[d].totalScore += m.statsSummary?.totalContributions || 0;
      });

      summaryData = {
        totalMembers: members.length,
        totalEvents: events.length,
        totalContributions: totalContributionsCount,
        departmentBreakdown: deptSummary,
        generatedAt: new Date(),
        membersSummary: members.map(m => ({
          name: m.user?.name,
          email: m.user?.email,
          department: m.department,
          year: m.year,
          bxRole: m.bxRole,
          githubCommits: m.statsSummary?.githubCommits || 0,
          leetcodeSolved: m.statsSummary?.leetcodeSolved || 0,
          codeforcesRating: m.statsSummary?.codeforcesRating || 0,
          attendanceRate: `${m.statsSummary?.attendanceRate || 0}%`,
          totalContributions: m.statsSummary?.totalContributions || 0,
        })),
      };
    }

    const report = await Report.create({
      title,
      type,
      generatedBy: req.user.id,
      targetMember: memberId || null,
      filters: { department, year },
      summaryData,
    });

    res.status(201).json({
      success: true,
      message: 'Report generated successfully',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all saved reports
// @route   GET /api/reports
// @access  Private
export const getReports = async (req, res, next) => {
  try {
    const reports = await Report.find({})
      .populate('generatedBy', 'name email avatar')
      .populate('targetMember', 'department year bxRole')
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    res.json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single report by ID
// @route   GET /api/reports/:id
// @access  Private
export const getReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('generatedBy', 'name email avatar')
      .populate('targetMember', 'department year bxRole')
      .lean();

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

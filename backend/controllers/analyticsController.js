import MemberProfile from '../models/MemberProfile.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import Contribution from '../models/Contribution.js';
import Event from '../models/Event.js';
import Attendance from '../models/Attendance.js';

// @desc    Get complete main dashboard analytics in a single optimized payload
// @route   GET /api/analytics/dashboard
// @access  Private
export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const totalMembers = await MemberProfile.countDocuments({});
    const activeUsers = await User.countDocuments({ status: 'active' });
    const inactiveUsers = await User.countDocuments({ status: 'inactive' });
    const totalEvents = await Event.countDocuments({});
    const totalContributions = await Contribution.countDocuments({});

    // Platform and coding totals aggregation
    const members = await MemberProfile.find({}).lean();
    let totalCommits = 0;
    let totalLeetcode = 0;
    let totalCodeforces = 0;
    let totalKaggle = 0;
    let totalAttendancePercentageSum = 0;

    const departmentMap = { CSE: 0, ECE: 0, ISE: 0, EEE: 0, ME: 0, AIDS: 0, CSBS: 0, Other: 0 };
    const yearMap = { '1st Year': 0, '2nd Year': 0, '3rd Year': 0, '4th Year': 0 };

    members.forEach(m => {
      const s = m.statsSummary || {};
      totalCommits += s.githubCommits || 0;
      totalLeetcode += s.leetcodeSolved || 0;
      totalCodeforces += s.codeforcesSolved || 0;
      totalKaggle += (s.kaggleCompetitions || 0) + (s.kaggleNotebooks || 0);
      totalAttendancePercentageSum += s.attendanceRate || 0;

      if (m.department && departmentMap[m.department] !== undefined) {
        departmentMap[m.department] += 1;
      } else {
        departmentMap.Other += 1;
      }

      const yKey = `${m.year || 1}${['st', 'nd', 'rd', 'th'][Math.min(3, (m.year || 1) - 1)]} Year`;
      if (yearMap[yKey] !== undefined) {
        yearMap[yKey] += 1;
      }
    });

    const averageAttendance = totalMembers > 0 ? Math.round(totalAttendancePercentageSum / totalMembers) : 0;

    // Monthly Activity Time-Series for the past 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyActivities = await Activity.aggregate([
      { $match: { date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            platform: '$platform',
          },
          count: { $sum: '$value' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendMap = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      trendMap[key] = {
        name: key,
        github: 0,
        leetcode: 0,
        codeforces: 0,
        kaggle: 0,
        total: 0,
      };
    }

    monthlyActivities.forEach(item => {
      const monthIdx = item._id.month - 1;
      const key = `${monthNames[monthIdx]} ${item._id.year.toString().slice(-2)}`;
      if (trendMap[key]) {
        const plat = item._id.platform;
        const val = item.count;
        if (plat === 'github') trendMap[key].github += val;
        else if (plat === 'leetcode') trendMap[key].leetcode += val;
        else if (plat === 'codeforces') trendMap[key].codeforces += val;
        else if (plat === 'kaggle') trendMap[key].kaggle += val;
        trendMap[key].total += val;
      }
    });

    const activityTrend = Object.values(trendMap);

    // Platform Distribution Breakdown
    const platformUsage = [
      { name: 'GitHub', value: totalCommits || 1, color: '#38bdf8' },
      { name: 'LeetCode', value: totalLeetcode || 1, color: '#fbbf24' },
      { name: 'Codeforces', value: totalCodeforces || 1, color: '#f87171' },
      { name: 'Kaggle', value: totalKaggle || 1, color: '#34d399' },
    ];

    // Attendance Trend for the last 6 events
    const recentEvents = await Event.find({}).sort({ date: -1 }).limit(6).lean();
    recentEvents.reverse();
    const attendanceTrend = [];
    for (let ev of recentEvents) {
      const presentCount = await Attendance.countDocuments({ event: ev._id, status: 'present' });
      attendanceTrend.push({
        title: ev.title.length > 15 ? `${ev.title.slice(0, 12)}...` : ev.title,
        date: new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        attendees: presentCount,
        rate: totalMembers > 0 ? Math.round((presentCount / totalMembers) * 100) : 0,
      });
    }

    // Top Members Leaderboard
    const topMembersData = await MemberProfile.find({})
      .populate('user', 'name email avatar')
      .sort({ 'statsSummary.totalContributions': -1 })
      .limit(10)
      .lean();

    const topMembers = topMembersData.map((m, idx) => ({
      rank: idx + 1,
      id: m._id,
      name: m.user?.name || 'BX Member',
      avatar: m.user?.avatar,
      department: m.department,
      year: m.year,
      bxRole: m.bxRole,
      githubCommits: m.statsSummary?.githubCommits || 0,
      leetcodeSolved: m.statsSummary?.leetcodeSolved || 0,
      codeforcesRating: m.statsSummary?.codeforcesRating || 0,
      attendanceRate: m.statsSummary?.attendanceRate || 0,
      totalContributions: m.statsSummary?.totalContributions || 0,
    }));

    // Department & Year Engagement formatted for Recharts
    const departmentStats = Object.keys(departmentMap).map(dept => ({
      department: dept,
      members: departmentMap[dept],
    }));

    const yearStats = Object.keys(yearMap).map(yr => ({
      year: yr,
      members: yearMap[yr],
    }));

    res.json({
      success: true,
      data: {
        stats: {
          totalMembers,
          activeMembers: activeUsers,
          inactiveMembers: inactiveUsers,
          totalEvents,
          averageAttendance,
          totalContributions,
          codingStats: {
            githubCommits: totalCommits,
            leetcodeSolved: totalLeetcode,
            codeforcesSolved: totalCodeforces,
            kaggleCompetitions: totalKaggle,
          },
        },
        activityTrend,
        platformUsage,
        attendanceTrend,
        departmentStats,
        yearStats,
        topMembers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed deep analytics for specific dimensions
// @route   GET /api/analytics/detailed
// @access  Private
export const getDetailedAnalytics = async (req, res, next) => {
  try {
    const totalMembers = await MemberProfile.countDocuments({});
    const members = await MemberProfile.find({}).populate('user', 'name email status').lean();

    // Department engagement calculation with average contributions per department
    const deptTotals = {};
    members.forEach(m => {
      const d = m.department || 'Other';
      if (!deptTotals[d]) {
        deptTotals[d] = { count: 0, contributions: 0, commits: 0, leetcode: 0, attendanceSum: 0 };
      }
      deptTotals[d].count += 1;
      deptTotals[d].contributions += m.statsSummary?.totalContributions || 0;
      deptTotals[d].commits += m.statsSummary?.githubCommits || 0;
      deptTotals[d].leetcode += m.statsSummary?.leetcodeSolved || 0;
      deptTotals[d].attendanceSum += m.statsSummary?.attendanceRate || 0;
    });

    const departmentPerformance = Object.keys(deptTotals).map(k => ({
      department: k,
      memberCount: deptTotals[k].count,
      avgContributions: Math.round(deptTotals[k].contributions / Math.max(1, deptTotals[k].count)),
      avgCommits: Math.round(deptTotals[k].commits / Math.max(1, deptTotals[k].count)),
      avgLeetcode: Math.round(deptTotals[k].leetcode / Math.max(1, deptTotals[k].count)),
      avgAttendance: Math.round(deptTotals[k].attendanceSum / Math.max(1, deptTotals[k].count)),
    }));

    // Year-wise comparison
    const yearTotals = {};
    members.forEach(m => {
      const y = `Year ${m.year || 1}`;
      if (!yearTotals[y]) {
        yearTotals[y] = { count: 0, contributions: 0, commits: 0, leetcode: 0, attendanceSum: 0 };
      }
      yearTotals[y].count += 1;
      yearTotals[y].contributions += m.statsSummary?.totalContributions || 0;
      yearTotals[y].commits += m.statsSummary?.githubCommits || 0;
      yearTotals[y].leetcode += m.statsSummary?.leetcodeSolved || 0;
      yearTotals[y].attendanceSum += m.statsSummary?.attendanceRate || 0;
    });

    const yearPerformance = Object.keys(yearTotals).map(k => ({
      year: k,
      memberCount: yearTotals[k].count,
      avgContributions: Math.round(yearTotals[k].contributions / Math.max(1, yearTotals[k].count)),
      avgCommits: Math.round(yearTotals[k].commits / Math.max(1, yearTotals[k].count)),
      avgLeetcode: Math.round(yearTotals[k].leetcode / Math.max(1, yearTotals[k].count)),
      avgAttendance: Math.round(yearTotals[k].attendanceSum / Math.max(1, yearTotals[k].count)),
    }));

    res.json({
      success: true,
      data: {
        totalMembers,
        departmentPerformance,
        yearPerformance,
      },
    });
  } catch (error) {
    next(error);
  }
};

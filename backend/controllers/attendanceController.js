import Attendance from '../models/Attendance.js';
import Event from '../models/Event.js';
import MemberProfile from '../models/MemberProfile.js';
import Contribution from '../models/Contribution.js';

// @desc    Mark attendance via QR code scan or token
// @route   POST /api/attendance/mark-qr
// @access  Private
export const markAttendanceViaQR = async (req, res, next) => {
  try {
    const { token, eventId } = req.body;

    // Locate event by token or ID
    let event = null;
    if (token) {
      // Token might be a raw token string or JSON string from QR scanner
      let searchToken = token;
      try {
        const parsed = JSON.parse(token);
        if (parsed.token) searchToken = parsed.token;
      } catch (e) {
        // Not json, raw token
      }
      event = await Event.findOne({ qrCodeToken: searchToken });
    }

    if (!event && eventId) {
      event = await Event.findById(eventId);
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired QR code for this event.',
      });
    }

    if (!event.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Attendance for this event has been closed by the event lead.',
      });
    }

    const memberProfile = await MemberProfile.findOne({ user: req.user.id });
    if (!memberProfile) {
      return res.status(404).json({
        success: false,
        message: 'Member profile not found for this user.',
      });
    }

    // Check duplicate
    const existingAttendance = await Attendance.findOne({
      event: event._id,
      member: memberProfile._id,
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        alreadyMarked: true,
        message: `Attendance Already Recorded on ${new Date(existingAttendance.markedAt).toLocaleTimeString()}`,
        data: existingAttendance,
      });
    }

    const attendance = await Attendance.create({
      event: event._id,
      member: memberProfile._id,
      user: req.user.id,
      status: 'present',
      method: 'qr',
      markedAt: new Date(),
    });

    // Record a contribution entry for event participation
    await Contribution.create({
      member: memberProfile._id,
      user: req.user.id,
      source: 'bx_event',
      type: 'club_volunteer',
      title: `Attended: ${event.title}`,
      description: `Participated in BX ${event.type} on ${new Date(event.date).toLocaleDateString()}`,
      impactScore: 10,
      verified: true,
    });

    // Update member profile stats
    const totalEvents = await Event.countDocuments({ isActive: true });
    const attendedCount = await Attendance.countDocuments({ member: memberProfile._id, status: 'present' });
    memberProfile.statsSummary.eventsAttended = attendedCount;
    memberProfile.statsSummary.totalEvents = totalEvents;
    memberProfile.statsSummary.attendanceRate = Math.round((attendedCount / Math.max(1, totalEvents)) * 100);
    memberProfile.statsSummary.streakDays = (memberProfile.statsSummary.streakDays || 0) + 1;
    await memberProfile.save();

    res.status(201).json({
      success: true,
      message: `Attendance Marked Successfully for "${event.title}"! 🎉`,
      data: {
        attendance,
        event: {
          id: event._id,
          title: event.title,
          date: event.date,
          location: event.location,
        },
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        alreadyMarked: true,
        message: 'Attendance Already Recorded for this event.',
      });
    }
    next(error);
  }
};

// @desc    Mark attendance manually (Single or Batch by Lead/Admin)
// @route   POST /api/attendance/mark-manual
// @access  Private (Admin / Lead)
export const markAttendanceManual = async (req, res, next) => {
  try {
    const { eventId, records } = req.body;
    // records: [{ memberId, status: 'present' | 'absent' | 'excused' }]

    if (!eventId || !records || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: 'Please provide eventId and records array' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const results = [];
    for (let item of records) {
      const profile = await MemberProfile.findById(item.memberId);
      if (!profile) continue;

      const record = await Attendance.findOneAndUpdate(
        { event: eventId, member: profile._id },
        {
          user: profile.user,
          status: item.status || 'present',
          method: 'manual',
          markedBy: req.user.id,
          markedAt: new Date(),
        },
        { upsert: true, new: true }
      );
      results.push(record);
    }

    res.json({
      success: true,
      message: `Attendance updated for ${results.length} members`,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance analytics for a single member (Streaks, percentages, history)
// @route   GET /api/attendance/member/:id
// @access  Private
export const getMemberAttendanceAnalytics = async (req, res, next) => {
  try {
    const memberId = req.params.id;
    const profile = await MemberProfile.findById(memberId);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Member profile not found' });
    }

    const allEvents = await Event.find({ isActive: true }).sort({ date: -1 }).lean();
    const attendanceRecords = await Attendance.find({ member: memberId })
      .populate('event', 'title date location type')
      .sort({ markedAt: -1 })
      .lean();

    const attendedEvents = attendanceRecords.filter(a => a.status === 'present');
    const totalEventsCount = allEvents.length;
    const attendedCount = attendedEvents.length;
    const missedCount = Math.max(0, totalEventsCount - attendedCount);
    const attendancePercentage = totalEventsCount > 0 ? Math.round((attendedCount / totalEventsCount) * 100) : 0;

    // Calculate consecutive streak from chronological attendance
    let streak = 0;
    for (let e of allEvents) {
      const didAttend = attendanceRecords.some(a => a.event?._id?.toString() === e._id.toString() && a.status === 'present');
      if (didAttend) {
        streak++;
      } else {
        break;
      }
    }

    const lastAttended = attendedEvents.length > 0 ? attendedEvents[0] : null;

    res.json({
      success: true,
      data: {
        totalEvents: totalEventsCount,
        eventsAttended: attendedCount,
        eventsMissed: missedCount,
        attendancePercentage,
        streak,
        lastAttendedEvent: lastAttended ? {
          title: lastAttended.event?.title,
          date: lastAttended.event?.date,
          markedAt: lastAttended.markedAt,
          method: lastAttended.method,
        } : null,
        history: attendanceRecords,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get club-wide attendance trends and breakdown
// @route   GET /api/attendance/analytics
// @access  Private
export const getClubAttendanceAnalytics = async (req, res, next) => {
  try {
    const events = await Event.find({}).sort({ date: 1 }).lean();
    const totalMembers = await MemberProfile.countDocuments({});

    const eventTrends = [];
    for (let ev of events) {
      const presentCount = await Attendance.countDocuments({ event: ev._id, status: 'present' });
      eventTrends.push({
        eventId: ev._id,
        title: ev.title,
        date: ev.date,
        type: ev.type,
        presentCount,
        rate: totalMembers > 0 ? Math.round((presentCount / totalMembers) * 100) : 0,
      });
    }

    // Department-wise attendance breakdown
    const deptAgg = await Attendance.aggregate([
      { $match: { status: 'present' } },
      {
        $lookup: {
          from: 'memberprofiles',
          localField: 'member',
          foreignField: '_id',
          as: 'profile',
        },
      },
      { $unwind: '$profile' },
      {
        $group: {
          _id: '$profile.department',
          count: { $sum: 1 },
        },
      },
    ]);

    const departmentAttendance = deptAgg.map(d => ({
      department: d._id,
      count: d.count,
    }));

    res.json({
      success: true,
      data: {
        eventTrends,
        departmentAttendance,
      },
    });
  } catch (error) {
    next(error);
  }
};

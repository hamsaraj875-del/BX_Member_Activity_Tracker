import QRCode from 'qrcode';
import crypto from 'crypto';
import Event from '../models/Event.js';
import Attendance from '../models/Attendance.js';

// @desc    Get all events with attendance counts
// @route   GET /api/events
// @access  Private
export const getEvents = async (req, res, next) => {
  try {
    const { type, status = 'all', limit = 50 } = req.query;

    const query = {};
    if (type && type !== 'all') query.type = type;
    if (status === 'active') query.isActive = true;

    const events = await Event.find(query)
      .populate('createdBy', 'name email avatar')
      .sort({ date: -1 })
      .limit(Number(limit))
      .lean();

    // Attach attendance count and current user's attendance status
    const eventIds = events.map(e => e._id);
    const attendanceStats = await Attendance.aggregate([
      { $match: { event: { $in: eventIds }, status: 'present' } },
      { $group: { _id: '$event', count: { $sum: 1 } } },
    ]);

    const statsMap = {};
    attendanceStats.forEach(item => {
      statsMap[item._id.toString()] = item.count;
    });

    // Check current user attendance status if user has a profile
    let userAttendanceMap = {};
    if (req.user) {
      const userAttendances = await Attendance.find({
        event: { $in: eventIds },
        user: req.user.id,
      }).lean();

      userAttendances.forEach(a => {
        userAttendanceMap[a.event.toString()] = a.status;
      });
    }

    const enhancedEvents = events.map(e => ({
      ...e,
      attendeesCount: statsMap[e._id.toString()] || 0,
      userAttendanceStatus: userAttendanceMap[e._id.toString()] || 'unmarked',
    }));

    res.json({
      success: true,
      count: enhancedEvents.length,
      data: enhancedEvents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID with attendees list
// @route   GET /api/events/:id
// @access  Private
export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .lean();

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const attendees = await Attendance.find({ event: event._id })
      .populate({
        path: 'member',
        select: 'department year bxRole',
        populate: { path: 'user', select: 'name email avatar' },
      })
      .sort({ markedAt: -1 })
      .lean();

    res.json({
      success: true,
      data: {
        ...event,
        attendees,
        attendeesCount: attendees.filter(a => a.status === 'present').length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new event with automatic QR generation
// @route   POST /api/events
// @access  Private (Admin / Lead)
export const createEvent = async (req, res, next) => {
  try {
    const { title, description, date, startTime, endTime, location, type, capacity = 100 } = req.body;

    const qrCodeToken = crypto.randomBytes(16).toString('hex');

    // Generate QR Code data URL payload: { eventId, token }
    const qrPayload = JSON.stringify({ token: qrCodeToken });
    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      color: {
        dark: '#4f46e5',
        light: '#ffffff',
      },
    });

    const event = await Event.create({
      title,
      description,
      date,
      startTime: startTime || '17:00',
      endTime: endTime || '19:00',
      location: location || 'Tech Hub BX Hall',
      type: type || 'workshop',
      capacity,
      qrCodeToken,
      qrCodeDataUrl,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully with QR code',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Admin / Lead)
export const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Admin / Lead)
export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    await Attendance.deleteMany({ event: event._id });
    await Event.findByIdAndDelete(event._id);

    res.json({
      success: true,
      message: 'Event and associated attendance records deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Regenerate event QR code
// @route   POST /api/events/:id/regenerate-qr
// @access  Private (Admin / Lead)
export const regenerateQR = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const qrCodeToken = crypto.randomBytes(16).toString('hex');
    const qrPayload = JSON.stringify({ token: qrCodeToken, eventId: event._id });
    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      color: { dark: '#4f46e5', light: '#ffffff' },
    });

    event.qrCodeToken = qrCodeToken;
    event.qrCodeDataUrl = qrCodeDataUrl;
    await event.save();

    res.json({
      success: true,
      message: 'Event QR code refreshed',
      data: {
        qrCodeToken,
        qrCodeDataUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

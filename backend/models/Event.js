import mongoose from 'mongoose';
import crypto from 'crypto';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide event title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide event description'],
  },
  date: {
    type: Date,
    required: [true, 'Please provide event date'],
  },
  startTime: {
    type: String,
    required: [true, 'Please provide start time'],
    default: '17:00',
  },
  endTime: {
    type: String,
    required: [true, 'Please provide end time'],
    default: '19:00',
  },
  location: {
    type: String,
    required: [true, 'Please provide location or online link'],
    default: 'Tech Hub Audi / Discord',
  },
  type: {
    type: String,
    enum: ['meeting', 'workshop', 'hackathon', 'training', 'contest', 'social', 'webinar'],
    default: 'workshop',
  },
  bannerImage: {
    type: String,
    default: '',
  },
  qrCodeToken: {
    type: String,
    default: () => crypto.randomBytes(16).toString('hex'),
  },
  qrCodeDataUrl: {
    type: String,
    default: '',
  },
  qrExpiresAt: {
    type: Date,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  capacity: {
    type: Number,
    default: 100,
  },
}, {
  timestamps: true,
});

eventSchema.index({ date: -1 });

const Event = mongoose.model('Event', eventSchema);
export default Event;

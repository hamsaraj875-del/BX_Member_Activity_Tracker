import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MemberProfile',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'excused', 'late'],
    default: 'present',
  },
  method: {
    type: String,
    enum: ['qr', 'manual', 'registered', 'admin_override'],
    default: 'qr',
  },
  markedAt: {
    type: Date,
    default: Date.now,
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  notes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

attendanceSchema.index({ event: 1, member: 1 }, { unique: true });
attendanceSchema.index({ member: 1, markedAt: -1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;

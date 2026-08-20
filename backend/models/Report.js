import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['individual', 'monthly', 'club', 'event', 'department'],
    required: true,
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  targetMember: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MemberProfile',
    default: null,
  },
  dateRange: {
    startDate: { type: Date },
    endDate: { type: Date },
  },
  filters: {
    department: { type: String, default: 'all' },
    year: { type: String, default: 'all' },
    platform: { type: String, default: 'all' },
  },
  summaryData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Report = mongoose.model('Report', reportSchema);
export default Report;

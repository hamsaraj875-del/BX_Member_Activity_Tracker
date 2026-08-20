import mongoose from 'mongoose';

const platformSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['github', 'leetcode', 'codeforces', 'kaggle', 'linkedin', 'portfolio', 'hackerrank', 'geeksforgeeks', 'devfolio', 'other'],
    lowercase: true,
  },
  username: {
    type: String,
    default: '',
    trim: true,
  },
  profileUrl: {
    type: String,
    default: '',
    trim: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  lastSyncedAt: {
    type: Date,
    default: null,
  },
  stats: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, { _id: true });

const memberProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  department: {
    type: String,
    required: [true, 'Please specify a department'],
    enum: ['CSE', 'ECE', 'ISE', 'EEE', 'ME', 'AIDS', 'CSBS', 'Other'],
    default: 'CSE',
  },
  year: {
    type: Number,
    required: [true, 'Please specify academic year'],
    min: 1,
    max: 4,
    default: 1,
  },
  bxRole: {
    type: String,
    enum: ['Lead', 'Core Team', 'Senior Member', 'Member', 'Alumni'],
    default: 'Member',
  },
  bio: {
    type: String,
    default: 'Passionate developer & active member of BX Technical Club.',
    maxlength: 500,
  },
  phone: {
    type: String,
    default: '',
  },
  skills: [{
    type: String,
    trim: true,
  }],
  platforms: [platformSchema],
  socialLinks: {
    linkedin: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    twitter: { type: String, default: '' },
    hackerrank: { type: String, default: '' },
    geeksforgeeks: { type: String, default: '' },
  },
  statsSummary: {
    githubCommits: { type: Number, default: 0 },
    leetcodeSolved: { type: Number, default: 0 },
    leetcodeEasy: { type: Number, default: 0 },
    leetcodeMedium: { type: Number, default: 0 },
    leetcodeHard: { type: Number, default: 0 },
    codeforcesRating: { type: Number, default: 0 },
    codeforcesSolved: { type: Number, default: 0 },
    kaggleCompetitions: { type: Number, default: 0 },
    kaggleNotebooks: { type: Number, default: 0 },
    totalContributions: { type: Number, default: 0 },
    eventsAttended: { type: Number, default: 0 },
    totalEvents: { type: Number, default: 0 },
    attendanceRate: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
  },
}, {
  timestamps: true,
});

memberProfileSchema.index({ department: 1, year: 1, bxRole: 1 });
memberProfileSchema.index({ 'statsSummary.totalContributions': -1 });

const MemberProfile = mongoose.model('MemberProfile', memberProfileSchema);
export default MemberProfile;

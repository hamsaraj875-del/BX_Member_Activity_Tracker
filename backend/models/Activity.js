import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
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
  platform: {
    type: String,
    required: true,
    enum: ['github', 'leetcode', 'codeforces', 'kaggle', 'hackerrank', 'geeksforgeeks', 'club_event', 'other'],
    lowercase: true,
  },
  activityType: {
    type: String,
    required: true,
    enum: [
      'commits',
      'pr_merged',
      'repo_created',
      'problems_solved',
      'contest_rating',
      'contest_rank',
      'kaggle_competition',
      'kaggle_notebook',
      'kaggle_dataset',
      'event_attended',
      'workshop_completed',
      'other'
    ],
  },
  value: {
    type: Number,
    required: true,
    default: 1,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  metadata: {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    repo: { type: String, default: '' },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', 'Expert', 'N/A'], default: 'N/A' },
    contestName: { type: String, default: '' },
    rank: { type: Number, default: 0 },
    url: { type: String, default: '' },
    tags: [String],
  },
}, {
  timestamps: true,
});

activitySchema.index({ member: 1, date: -1 });
activitySchema.index({ platform: 1, date: -1 });
activitySchema.index({ date: -1 });

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;

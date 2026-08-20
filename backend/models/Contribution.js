import mongoose from 'mongoose';

const contributionSchema = new mongoose.Schema({
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
  source: {
    type: String,
    enum: ['github', 'leetcode', 'codeforces', 'kaggle', 'bx_event', 'project', 'mentorship', 'workshop', 'hackathon', 'other'],
    required: true,
  },
  type: {
    type: String,
    enum: [
      'code_commit',
      'pr_merge',
      'open_source',
      'problem_solution',
      'contest_podium',
      'kaggle_medal',
      'workshop_speaker',
      'event_organizer',
      'project_lead',
      'mentorship',
      'hackathon_winner',
      'club_volunteer',
      'other'
    ],
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please provide contribution title'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  verified: {
    type: Boolean,
    default: true,
  },
  impactScore: {
    type: Number,
    default: 10,
  },
  link: {
    type: String,
    default: '',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

contributionSchema.index({ member: 1, date: -1 });
contributionSchema.index({ source: 1, date: -1 });

const Contribution = mongoose.model('Contribution', contributionSchema);
export default Contribution;

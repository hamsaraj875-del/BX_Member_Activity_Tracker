const mongoose = require("mongoose");

// ── Sub-schemas ────────────────────────────────────────────────────────────────

const LinksSchema = new mongoose.Schema(
  {
    github: { type: String, default: "" },
    leetcode: { type: String, default: "" },
    codeforces: { type: String, default: "" },
    kaggle: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    portfolio: { type: String, default: "" },
  },
  { _id: false }
);

const GitHubMetricsSchema = new mongoose.Schema(
  {
    commits: { type: Number, default: 0 },
    repos: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
  },
  { _id: false }
);

const LeetCodeMetricsSchema = new mongoose.Schema(
  {
    solved: { type: Number, default: 0 },
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 },
    contestRating: { type: Number, default: 0 },
    badge: { type: String, default: "None" },
  },
  { _id: false }
);

const CodeforcesMetricsSchema = new mongoose.Schema(
  {
    rating: { type: Number, default: 0 },
    maxRating: { type: Number, default: 0 },
    rank: { type: String, default: "Unrated" },
    problemsSolved: { type: Number, default: 0 },
  },
  { _id: false }
);

const KaggleMetricsSchema = new mongoose.Schema(
  {
    competitions: { type: Number, default: 0 },
    notebooks: { type: Number, default: 0 },
    datasets: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
  },
  { _id: false }
);

const MetricsSchema = new mongoose.Schema(
  {
    github: { type: GitHubMetricsSchema, default: () => ({}) },
    leetcode: { type: LeetCodeMetricsSchema, default: () => ({}) },
    codeforces: { type: CodeforcesMetricsSchema, default: () => ({}) },
    kaggle: { type: KaggleMetricsSchema, default: () => ({}) },
  },
  { _id: false }
);

// ── Root Member Schema ─────────────────────────────────────────────────────────

const MemberSchema = new mongoose.Schema(
  {
    // Custom string ID (e.g. "mem-1") — used by the frontend to reference members
    memberId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      enum: ["CSE", "IT", "ECE", "ME"],
    },
    year: {
      type: String,
      required: true,
      enum: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
    },
    role: {
      type: String,
      required: true,
      enum: ["Member", "Lead", "Mentor"],
      default: "Member",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    links: { type: LinksSchema, default: () => ({}) },
    metrics: { type: MetricsSchema, default: () => ({}) },
    // Array of event IDs this member attended (e.g. ["evt-1", "evt-3"])
    attendance: { type: [String], default: [] },
    // Composite engagement score computed from metrics + attendance
    engagementPoints: { type: Number, default: 0 },
  },
  {
    timestamps: true, // adds createdAt, updatedAt automatically
  }
);

// ── Virtual: computed attendance count ────────────────────────────────────────
MemberSchema.virtual("attendanceCount").get(function () {
  return this.attendance.length;
});

// ── Static helper: recalculate engagement points ───────────────────────────────
MemberSchema.statics.calculateEngagementPoints = function (memberDoc) {
  let points = 0;
  const gh = memberDoc.metrics?.github || {};
  const lc = memberDoc.metrics?.leetcode || {};
  const cf = memberDoc.metrics?.codeforces || {};
  const kg = memberDoc.metrics?.kaggle || {};

  // GitHub
  points +=
    (gh.commits || 0) * 1.5 +
    (gh.repos || 0) * 8 +
    (gh.streak || 0) * 5;

  // LeetCode
  points +=
    (lc.easy || 0) * 2 +
    (lc.medium || 0) * 5 +
    (lc.hard || 0) * 10;
  if ((lc.contestRating || 0) > 0) {
    points += Math.max(0, (lc.contestRating - 1200) * 0.5);
  }

  // Codeforces
  points += (cf.problemsSolved || 0) * 4;
  if ((cf.rating || 0) > 0) {
    points += Math.max(0, (cf.rating - 1000) * 0.75);
  }

  // Kaggle
  points +=
    (kg.competitions || 0) * 50 +
    (kg.notebooks || 0) * 20 +
    (kg.datasets || 0) * 30 +
    (kg.points || 0) * 0.1;

  // Attendance
  points += (memberDoc.attendance?.length || 0) * 15;

  return Math.round(points);
};

// Auto-compute engagementPoints before every save
MemberSchema.pre("save", function (next) {
  this.engagementPoints = this.constructor.calculateEngagementPoints(this);
  next();
});

module.exports = mongoose.model("Member", MemberSchema);

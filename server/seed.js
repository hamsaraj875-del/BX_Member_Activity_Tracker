/**
 * seed.js — Seed the MongoDB database with BX Analytics default data.
 * Run once with:  node seed.js
 * 
 * Safe to re-run: uses upsert so it won't create duplicates.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Member = require("./models/Member");
const Event = require("./models/Event");

// ── Seed Data (ported from data.js) ──────────────────────────────────────────

const DEFAULT_EVENTS = [
  { id: "evt-1", title: "Git & GitHub Essentials",     date: "2026-07-05", type: "Workshop",  points: 10 },
  { id: "evt-2", title: "Monthly Code Clash #1",        date: "2026-07-12", type: "Contest",   points: 20 },
  { id: "evt-3", title: "Algorithm Deep Dive: Graphs",  date: "2026-07-18", type: "Workshop",  points: 15 },
  { id: "evt-4", title: "BX Hackfest 2026",             date: "2026-07-25", type: "Hackathon", points: 50 },
  { id: "evt-5", title: "Mid-Term General Meetup",      date: "2026-08-01", type: "Meeting",   points: 5  },
  { id: "evt-6", title: "Codeforces Practice Sprint",   date: "2026-08-08", type: "Contest",   points: 20 },
];

const DEFAULT_MEMBERS = [
  {
    id: "mem-1", name: "Rahul Sharma", email: "rahul.sharma@bxclub.org",
    department: "CSE", year: "3rd Year", role: "Lead", status: "Active",
    links: { github: "https://github.com/rahulsharma", leetcode: "https://leetcode.com/rahulsharma", codeforces: "https://codeforces.com/profile/rahulsharma", kaggle: "https://kaggle.com/rahulsharma", linkedin: "https://linkedin.com/in/rahulsharma", portfolio: "https://rahulsharma.dev" },
    metrics: {
      github: { commits: 142, repos: 12, streak: 18 },
      leetcode: { solved: 342, easy: 110, medium: 182, hard: 50, contestRating: 1945, badge: "Knight" },
      codeforces: { rating: 1620, maxRating: 1680, rank: "Specialist", problemsSolved: 210 },
      kaggle: { competitions: 5, notebooks: 8, datasets: 3, points: 1240 }
    },
    attendance: ["evt-1", "evt-2", "evt-3", "evt-4", "evt-5", "evt-6"]
  },
  {
    id: "mem-2", name: "Ananya Iyer", email: "ananya.iyer@bxclub.org",
    department: "CSE", year: "2nd Year", role: "Member", status: "Active",
    links: { github: "https://github.com/ananyaiyer", leetcode: "https://leetcode.com/ananyaiyer", codeforces: "", kaggle: "https://kaggle.com/ananyaiyer", linkedin: "https://linkedin.com/in/ananyaiyer", portfolio: "" },
    metrics: {
      github: { commits: 88, repos: 5, streak: 8 },
      leetcode: { solved: 215, easy: 95, medium: 100, hard: 20, contestRating: 1620, badge: "Specialist" },
      codeforces: { rating: 0, maxRating: 0, rank: "Unrated", problemsSolved: 0 },
      kaggle: { competitions: 8, notebooks: 15, datasets: 6, points: 4320 }
    },
    attendance: ["evt-1", "evt-2", "evt-4", "evt-5", "evt-6"]
  },
  {
    id: "mem-3", name: "Vikram Patel", email: "vikram.patel@bxclub.org",
    department: "IT", year: "4th Year", role: "Mentor", status: "Active",
    links: { github: "https://github.com/vikrampatel", leetcode: "https://leetcode.com/vikrampatel", codeforces: "https://codeforces.com/profile/vikrampatel", kaggle: "", linkedin: "https://linkedin.com/in/vikrampatel", portfolio: "https://patelvikram.com" },
    metrics: {
      github: { commits: 254, repos: 22, streak: 25 },
      leetcode: { solved: 580, easy: 150, medium: 320, hard: 110, contestRating: 2210, badge: "Guardian" },
      codeforces: { rating: 1910, maxRating: 1950, rank: "Candidate Master", problemsSolved: 430 },
      kaggle: { competitions: 1, notebooks: 2, datasets: 0, points: 150 }
    },
    attendance: ["evt-1", "evt-3", "evt-4", "evt-6"]
  },
  {
    id: "mem-4", name: "Sneha Reddy", email: "sneha.reddy@bxclub.org",
    department: "ECE", year: "2nd Year", role: "Member", status: "Active",
    links: { github: "https://github.com/snehareddy", leetcode: "https://leetcode.com/snehareddy", codeforces: "https://codeforces.com/profile/snehareddy", kaggle: "", linkedin: "https://linkedin.com/in/snehareddy", portfolio: "" },
    metrics: {
      github: { commits: 45, repos: 3, streak: 3 },
      leetcode: { solved: 89, easy: 50, medium: 35, hard: 4, contestRating: 1410, badge: "None" },
      codeforces: { rating: 1280, maxRating: 1320, rank: "Pupil", problemsSolved: 65 },
      kaggle: { competitions: 0, notebooks: 1, datasets: 1, points: 50 }
    },
    attendance: ["evt-1", "evt-2", "evt-3", "evt-5"]
  },
  {
    id: "mem-5", name: "Rohan Gupta", email: "rohan.gupta@bxclub.org",
    department: "CSE", year: "1st Year", role: "Member", status: "Active",
    links: { github: "https://github.com/rohangupta", leetcode: "https://leetcode.com/rohangupta", codeforces: "", kaggle: "", linkedin: "", portfolio: "" },
    metrics: {
      github: { commits: 15, repos: 2, streak: 2 },
      leetcode: { solved: 30, easy: 25, medium: 5, hard: 0, contestRating: 0, badge: "None" },
      codeforces: { rating: 0, maxRating: 0, rank: "Unrated", problemsSolved: 0 },
      kaggle: { competitions: 0, notebooks: 0, datasets: 0, points: 0 }
    },
    attendance: ["evt-5", "evt-6"]
  },
  {
    id: "mem-6", name: "Priya Nair", email: "priya.nair@bxclub.org",
    department: "IT", year: "3rd Year", role: "Member", status: "Active",
    links: { github: "https://github.com/priyanair", leetcode: "https://leetcode.com/priyanair", codeforces: "", kaggle: "https://kaggle.com/priyanair", linkedin: "https://linkedin.com/in/priyanair", portfolio: "" },
    metrics: {
      github: { commits: 62, repos: 4, streak: 5 },
      leetcode: { solved: 145, easy: 60, medium: 75, hard: 10, contestRating: 1515, badge: "None" },
      codeforces: { rating: 0, maxRating: 0, rank: "Unrated", problemsSolved: 0 },
      kaggle: { competitions: 6, notebooks: 12, datasets: 5, points: 3100 }
    },
    attendance: ["evt-1", "evt-3", "evt-4", "evt-5"]
  },
  {
    id: "mem-7", name: "Kabir Singh", email: "kabir.singh@bxclub.org",
    department: "ME", year: "2nd Year", role: "Member", status: "Inactive",
    links: { github: "https://github.com/kabirsingh", leetcode: "", codeforces: "", kaggle: "", linkedin: "", portfolio: "" },
    metrics: {
      github: { commits: 2, repos: 1, streak: 0 },
      leetcode: { solved: 0, easy: 0, medium: 0, hard: 0, contestRating: 0, badge: "None" },
      codeforces: { rating: 0, maxRating: 0, rank: "Unrated", problemsSolved: 0 },
      kaggle: { competitions: 0, notebooks: 0, datasets: 0, points: 0 }
    },
    attendance: ["evt-1"]
  },
  {
    id: "mem-8", name: "Tanya Sen", email: "tanya.sen@bxclub.org",
    department: "CSE", year: "4th Year", role: "Lead", status: "Active",
    links: { github: "https://github.com/tanyasen", leetcode: "https://leetcode.com/tanyasen", codeforces: "https://codeforces.com/profile/tanyasen", kaggle: "", linkedin: "https://linkedin.com/in/tanyasen", portfolio: "https://tanyasen.code" },
    metrics: {
      github: { commits: 312, repos: 18, streak: 30 },
      leetcode: { solved: 412, easy: 100, medium: 220, hard: 92, contestRating: 2010, badge: "Knight" },
      codeforces: { rating: 1750, maxRating: 1810, rank: "Expert", problemsSolved: 315 },
      kaggle: { competitions: 2, notebooks: 3, datasets: 1, points: 410 }
    },
    attendance: ["evt-1", "evt-2", "evt-3", "evt-4", "evt-6"]
  },
  {
    id: "mem-9", name: "Arjun Das", email: "arjun.das@bxclub.org",
    department: "ECE", year: "3rd Year", role: "Member", status: "Active",
    links: { github: "https://github.com/arjundas", leetcode: "https://leetcode.com/arjundas", codeforces: "https://codeforces.com/profile/arjundas", kaggle: "", linkedin: "https://linkedin.com/in/arjundas", portfolio: "" },
    metrics: {
      github: { commits: 94, repos: 6, streak: 12 },
      leetcode: { solved: 278, easy: 80, medium: 155, hard: 43, contestRating: 1840, badge: "Knight" },
      codeforces: { rating: 1580, maxRating: 1610, rank: "Specialist", problemsSolved: 198 },
      kaggle: { competitions: 0, notebooks: 0, datasets: 0, points: 0 }
    },
    attendance: ["evt-1", "evt-2", "evt-4", "evt-6"]
  },
  {
    id: "mem-10", name: "Meera Krishnan", email: "meera.k@bxclub.org",
    department: "IT", year: "2nd Year", role: "Member", status: "Active",
    links: { github: "https://github.com/meerakrishnan", leetcode: "https://leetcode.com/meerakrishnan", codeforces: "", kaggle: "", linkedin: "https://linkedin.com/in/meerakrishnan", portfolio: "" },
    metrics: {
      github: { commits: 38, repos: 3, streak: 4 },
      leetcode: { solved: 67, easy: 45, medium: 22, hard: 0, contestRating: 0, badge: "None" },
      codeforces: { rating: 0, maxRating: 0, rank: "Unrated", problemsSolved: 0 },
      kaggle: { competitions: 1, notebooks: 4, datasets: 2, points: 280 }
    },
    attendance: ["evt-1", "evt-2", "evt-3", "evt-4", "evt-5", "evt-6"]
  }
];

// ── Engagement Points Calculator (mirrors data.js) ────────────────────────────
function calculateEngagementPoints(member) {
  let points = 0;
  const gh = member.metrics.github;
  const lc = member.metrics.leetcode;
  const cf = member.metrics.codeforces;
  const kg = member.metrics.kaggle;

  points += (gh.commits * 1.5) + (gh.repos * 8) + (gh.streak * 5);
  points += (lc.easy * 2) + (lc.medium * 5) + (lc.hard * 10);
  if (lc.contestRating > 0) points += Math.max(0, (lc.contestRating - 1200) * 0.5);
  points += (cf.problemsSolved * 4);
  if (cf.rating > 0) points += Math.max(0, (cf.rating - 1000) * 0.75);
  points += (kg.competitions * 50) + (kg.notebooks * 20) + (kg.datasets * 30) + (kg.points * 0.1);
  points += (member.attendance.length * 15);

  return Math.round(points);
}

// ── Main Seed Function ────────────────────────────────────────────────────────
async function seed() {
  const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bx_analytics";

  console.log("🔗 Connecting to MongoDB:", MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB\n");

  // ── Seed Events ──
  console.log("📅 Seeding events...");
  let eventCount = 0;
  for (const evt of DEFAULT_EVENTS) {
    const result = await Event.findOneAndUpdate(
      { eventId: evt.id },
      { eventId: evt.id, title: evt.title, date: evt.date, type: evt.type, points: evt.points },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`   ${result.eventId} — ${result.title}`);
    eventCount++;
  }
  console.log(`✅ ${eventCount} events seeded.\n`);

  // ── Seed Members ──
  console.log("👥 Seeding members...");
  let memberCount = 0;
  for (const mem of DEFAULT_MEMBERS) {
    const engagementPoints = calculateEngagementPoints(mem);
    const result = await Member.findOneAndUpdate(
      { memberId: mem.id },
      {
        memberId: mem.id,
        name: mem.name,
        email: mem.email,
        department: mem.department,
        year: mem.year,
        role: mem.role,
        status: mem.status,
        links: mem.links,
        metrics: mem.metrics,
        attendance: mem.attendance,
        engagementPoints,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`   ${result.memberId} — ${result.name} (${result.engagementPoints} pts)`);
    memberCount++;
  }
  console.log(`✅ ${memberCount} members seeded.\n`);

  // ── Summary ──
  const totalMembers = await Member.countDocuments();
  const totalEvents = await Event.countDocuments();
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📊 Database summary:`);
  console.log(`   Members collection: ${totalMembers} documents`);
  console.log(`   Events  collection: ${totalEvents} documents`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 Seed complete! Run `npm start` to launch the server.");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});

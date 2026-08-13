// BX Analytics Dashboard Mock Data Seed
const DEFAULT_EVENTS = [
  { id: "evt-1", title: "Git & GitHub Essentials", date: "2026-07-05", type: "Workshop", points: 10 },
  { id: "evt-2", title: "Monthly Code Clash #1", date: "2026-07-12", type: "Contest", points: 20 },
  { id: "evt-3", title: "Algorithm Deep Dive: Graphs", date: "2026-07-18", type: "Workshop", points: 15 },
  { id: "evt-4", title: "BX Hackfest 2026", date: "2026-07-25", type: "Hackathon", points: 50 },
  { id: "evt-5", title: "Mid-Term General Meetup", date: "2026-08-01", type: "Meeting", points: 5 },
  { id: "evt-6", title: "Codeforces Practice Sprint", date: "2026-08-08", type: "Contest", points: 20 }
];

const DEFAULT_MEMBERS = [
  {
    id: "mem-1",
    name: "Rahul Sharma",
    email: "rahul.sharma@bxclub.org",
    department: "CSE",
    year: "3rd Year",
    role: "Lead",
    status: "Active",
    links: {
      github: "https://github.com/rahulsharma",
      leetcode: "https://leetcode.com/rahulsharma",
      codeforces: "https://codeforces.com/profile/rahulsharma",
      kaggle: "https://kaggle.com/rahulsharma",
      linkedin: "https://linkedin.com/in/rahulsharma",
      portfolio: "https://rahulsharma.dev"
    },
    metrics: {
      github: { commits: 142, repos: 12, streak: 18 },
      leetcode: { solved: 342, easy: 110, medium: 182, hard: 50, contestRating: 1945, badge: "Knight" },
      codeforces: { rating: 1620, maxRating: 1680, rank: "Specialist", problemsSolved: 210 },
      kaggle: { competitions: 5, notebooks: 8, datasets: 3, points: 1240 }
    },
    attendance: ["evt-1", "evt-2", "evt-3", "evt-4", "evt-5", "evt-6"] // 6/6
  },
  {
    id: "mem-2",
    name: "Ananya Iyer",
    email: "ananya.iyer@bxclub.org",
    department: "CSE",
    year: "2nd Year",
    role: "Member",
    status: "Active",
    links: {
      github: "https://github.com/ananyaiyer",
      leetcode: "https://leetcode.com/ananyaiyer",
      codeforces: "",
      kaggle: "https://kaggle.com/ananyaiyer",
      linkedin: "https://linkedin.com/in/ananyaiyer",
      portfolio: ""
    },
    metrics: {
      github: { commits: 88, repos: 5, streak: 8 },
      leetcode: { solved: 215, easy: 95, medium: 100, hard: 20, contestRating: 1620, badge: "Specialist" },
      codeforces: { rating: 0, maxRating: 0, rank: "Unrated", problemsSolved: 0 },
      kaggle: { competitions: 8, notebooks: 15, datasets: 6, points: 4320 }
    },
    attendance: ["evt-1", "evt-2", "evt-4", "evt-5", "evt-6"] // 5/6
  },
  {
    id: "mem-3",
    name: "Vikram Patel",
    email: "vikram.patel@bxclub.org",
    department: "IT",
    year: "4th Year",
    role: "Mentor",
    status: "Active",
    links: {
      github: "https://github.com/vikrampatel",
      leetcode: "https://leetcode.com/vikrampatel",
      codeforces: "https://codeforces.com/profile/vikrampatel",
      kaggle: "",
      linkedin: "https://linkedin.com/in/vikrampatel",
      portfolio: "https://patelvikram.com"
    },
    metrics: {
      github: { commits: 254, repos: 22, streak: 25 },
      leetcode: { solved: 580, easy: 150, medium: 320, hard: 110, contestRating: 2210, badge: "Guardian" },
      codeforces: { rating: 1910, maxRating: 1950, rank: "Candidate Master", problemsSolved: 430 },
      kaggle: { competitions: 1, notebooks: 2, datasets: 0, points: 150 }
    },
    attendance: ["evt-1", "evt-3", "evt-4", "evt-6"] // 4/6
  },
  {
    id: "mem-4",
    name: "Sneha Reddy",
    email: "sneha.reddy@bxclub.org",
    department: "ECE",
    year: "2nd Year",
    role: "Member",
    status: "Active",
    links: {
      github: "https://github.com/snehareddy",
      leetcode: "https://leetcode.com/snehareddy",
      codeforces: "https://codeforces.com/profile/snehareddy",
      kaggle: "",
      linkedin: "https://linkedin.com/in/snehareddy",
      portfolio: ""
    },
    metrics: {
      github: { commits: 45, repos: 3, streak: 3 },
      leetcode: { solved: 89, easy: 50, medium: 35, hard: 4, contestRating: 1410, badge: "None" },
      codeforces: { rating: 1280, maxRating: 1320, rank: "Pupil", problemsSolved: 65 },
      kaggle: { competitions: 0, notebooks: 1, datasets: 1, points: 50 }
    },
    attendance: ["evt-1", "evt-2", "evt-3", "evt-5"] // 4/6
  },
  {
    id: "mem-5",
    name: "Rohan Gupta",
    email: "rohan.gupta@bxclub.org",
    department: "CSE",
    year: "1st Year",
    role: "Member",
    status: "Active",
    links: {
      github: "https://github.com/rohangupta",
      leetcode: "https://leetcode.com/rohangupta",
      codeforces: "",
      kaggle: "",
      linkedin: "",
      portfolio: ""
    },
    metrics: {
      github: { commits: 15, repos: 2, streak: 2 },
      leetcode: { solved: 30, easy: 25, medium: 5, hard: 0, contestRating: 0, badge: "None" },
      codeforces: { rating: 0, maxRating: 0, rank: "Unrated", problemsSolved: 0 },
      kaggle: { competitions: 0, notebooks: 0, datasets: 0, points: 0 }
    },
    attendance: ["evt-5", "evt-6"] // 2/6
  },
  {
    id: "mem-6",
    name: "Priya Nair",
    email: "priya.nair@bxclub.org",
    department: "IT",
    year: "3rd Year",
    role: "Member",
    status: "Active",
    links: {
      github: "https://github.com/priyanair",
      leetcode: "https://leetcode.com/priyanair",
      codeforces: "",
      kaggle: "https://kaggle.com/priyanair",
      linkedin: "https://linkedin.com/in/priyanair",
      portfolio: ""
    },
    metrics: {
      github: { commits: 62, repos: 4, streak: 5 },
      leetcode: { solved: 145, easy: 60, medium: 75, hard: 10, contestRating: 1515, badge: "None" },
      codeforces: { rating: 0, maxRating: 0, rank: "Unrated", problemsSolved: 0 },
      kaggle: { competitions: 6, notebooks: 12, datasets: 5, points: 3100 }
    },
    attendance: ["evt-1", "evt-3", "evt-4", "evt-5"] // 4/6
  },
  {
    id: "mem-7",
    name: "Kabir Singh",
    email: "kabir.singh@bxclub.org",
    department: "ME",
    year: "2nd Year",
    role: "Member",
    status: "Inactive",
    links: {
      github: "https://github.com/kabirsingh",
      leetcode: "",
      codeforces: "",
      kaggle: "",
      linkedin: "",
      portfolio: ""
    },
    metrics: {
      github: { commits: 2, repos: 1, streak: 0 },
      leetcode: { solved: 0, easy: 0, medium: 0, hard: 0, contestRating: 0, badge: "None" },
      codeforces: { rating: 0, maxRating: 0, rank: "Unrated", problemsSolved: 0 },
      kaggle: { competitions: 0, notebooks: 0, datasets: 0, points: 0 }
    },
    attendance: ["evt-1"] // 1/6 (Inactive)
  },
  {
    id: "mem-8",
    name: "Tanya Sen",
    email: "tanya.sen@bxclub.org",
    department: "CSE",
    year: "4th Year",
    role: "Lead",
    status: "Active",
    links: {
      github: "https://github.com/tanyasen",
      leetcode: "https://leetcode.com/tanyasen",
      codeforces: "https://codeforces.com/profile/tanyasen",
      kaggle: "",
      linkedin: "https://linkedin.com/in/tanyasen",
      portfolio: "https://tanyasen.code"
    },
    metrics: {
      github: { commits: 312, repos: 18, streak: 30 },
      leetcode: { solved: 412, easy: 100, medium: 220, hard: 92, contestRating: 2010, badge: "Knight" },
      codeforces: { rating: 1750, maxRating: 1810, rank: "Expert", problemsSolved: 315 },
      kaggle: { competitions: 2, notebooks: 3, datasets: 1, points: 410 }
    },
    attendance: ["evt-1", "evt-2", "evt-3", "evt-4", "evt-6"] // 5/6
  },
  {
    id: "mem-9",
    name: "Arjun Das",
    email: "arjun.das@bxclub.org",
    department: "ECE",
    year: "3rd Year",
    role: "Member",
    status: "Active",
    links: {
      github: "https://github.com/arjundas",
      leetcode: "https://leetcode.com/arjundas",
      codeforces: "https://codeforces.com/profile/arjundas",
      kaggle: "",
      linkedin: "https://linkedin.com/in/arjundas",
      portfolio: ""
    },
    metrics: {
      github: { commits: 94, repos: 6, streak: 12 },
      leetcode: { solved: 278, easy: 80, medium: 155, hard: 43, contestRating: 1840, badge: "Knight" },
      codeforces: { rating: 1580, maxRating: 1610, rank: "Specialist", problemsSolved: 198 },
      kaggle: { competitions: 0, notebooks: 0, datasets: 0, points: 0 }
    },
    attendance: ["evt-1", "evt-2", "evt-4", "evt-6"] // 4/6
  },
  {
    id: "mem-10",
    name: "Meera Krishnan",
    email: "meera.k@bxclub.org",
    department: "IT",
    year: "2nd Year",
    role: "Member",
    status: "Active",
    links: {
      github: "https://github.com/meerakrishnan",
      leetcode: "https://leetcode.com/meerakrishnan",
      codeforces: "",
      kaggle: "",
      linkedin: "https://linkedin.com/in/meerakrishnan",
      portfolio: ""
    },
    metrics: {
      github: { commits: 38, repos: 3, streak: 4 },
      leetcode: { solved: 67, easy: 45, medium: 22, hard: 0, contestRating: 0, badge: "None" },
      codeforces: { rating: 0, maxRating: 0, rank: "Unrated", problemsSolved: 0 },
      kaggle: { competitions: 1, notebooks: 4, datasets: 2, points: 280 }
    },
    attendance: ["evt-1", "evt-2", "evt-3", "evt-4", "evt-5", "evt-6"] // 6/6
  }
];

// Calculate composite score based on activity to seed an "Engagement Points" metric
function calculateEngagementPoints(member) {
  let points = 0;
  
  // GitHub points: 1 per commit, 10 per repo, active streak bonus
  points += (member.metrics.github.commits * 1.5) + (member.metrics.github.repos * 8) + (member.metrics.github.streak * 5);
  
  // LeetCode points: 2 per Easy, 4 per Medium, 8 per Hard, contest rating bonus
  const lc = member.metrics.leetcode;
  points += (lc.easy * 2) + (lc.medium * 5) + (lc.hard * 10);
  if (lc.contestRating > 0) {
    points += Math.max(0, (lc.contestRating - 1200) * 0.5);
  }
  
  // Codeforces points: rating bonus, problems solved
  const cf = member.metrics.codeforces;
  points += (cf.problemsSolved * 4);
  if (cf.rating > 0) {
    points += Math.max(0, (cf.rating - 1000) * 0.75);
  }
  
  // Kaggle points: competitions and datasets
  const kg = member.metrics.kaggle;
  points += (kg.competitions * 50) + (kg.notebooks * 20) + (kg.datasets * 30) + (kg.points * 0.1);
  
  // Attendance points: 15 per attended event
  points += (member.attendance.length * 15);
  
  return Math.round(points);
}

// Add composite score
DEFAULT_MEMBERS.forEach(m => {
  m.engagementPoints = calculateEngagementPoints(m);
});

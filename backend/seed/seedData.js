import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import crypto from 'crypto';

import User from '../models/User.js';
import MemberProfile from '../models/MemberProfile.js';
import Activity from '../models/Activity.js';
import Contribution from '../models/Contribution.js';
import Event from '../models/Event.js';
import Attendance from '../models/Attendance.js';
import Setting from '../models/Setting.js';
import Report from '../models/Report.js';

dotenv.config();

const sampleMembers = [
  {
    name: 'Hamsaraj K',
    email: 'admin@bx.club',
    role: 'superadmin',
    department: 'CSE',
    year: 4,
    bxRole: 'Lead',
    bio: 'Lead Architect @ BX Club. Full-stack cloud engineer & competitive programming enthusiast.',
    github: 'hamsaraj',
    leetcode: 'hamsaraj_k',
    codeforces: 'hamsaraj_cf',
    kaggle: 'hamsaraj_ml',
    skills: ['React', 'Node.js', 'Go', 'Docker', 'System Design', 'Algorithms'],
  },
  {
    name: 'Aarav Sharma',
    email: 'lead@bx.club',
    role: 'lead',
    department: 'CSE',
    year: 3,
    bxRole: 'Lead',
    bio: 'Core Lead & Competitive Programmer. Passionate about graph algorithms and distributed systems.',
    github: 'aaravsharma-dev',
    leetcode: 'aarav_coder',
    codeforces: 'aarav_grandmaster',
    kaggle: 'aarav_ai',
    skills: ['C++', 'Python', 'Redis', 'Algorithms', 'Microservices'],
  },
  {
    name: 'Priya Sundaram',
    email: 'priya.s@bx.club',
    role: 'lead',
    department: 'ISE',
    year: 3,
    bxRole: 'Core Team',
    bio: 'AI/ML enthusiast and workshop coordinator for BX data science cohorts.',
    github: 'priyasundaram',
    leetcode: 'priya_codes',
    codeforces: 'priya_algo',
    kaggle: 'priya_sundaram',
    skills: ['PyTorch', 'TensorFlow', 'FastAPI', 'Pandas', 'Next.js'],
  },
  {
    name: 'Rohan Deshmukh',
    email: 'member@bx.club',
    role: 'member',
    department: 'ECE',
    year: 2,
    bxRole: 'Senior Member',
    bio: 'Embedded systems engineer & backend tinkerer. Active LeetCode daily problem solver.',
    github: 'rohandesh',
    leetcode: 'rohan_d',
    codeforces: 'rohan_cf',
    kaggle: 'rohan_kaggle',
    skills: ['C', 'Rust', 'Express', 'React', 'IoT'],
  },
  {
    name: 'Ananya Iyer',
    email: 'ananya.i@bx.club',
    role: 'member',
    department: 'AIDS',
    year: 2,
    bxRole: 'Core Team',
    bio: 'Machine Learning researcher and Kaggle 3x Notebooks Expert. BX Hackathon finalist.',
    github: 'ananyaiyer',
    leetcode: 'ananya_leetcode',
    codeforces: 'ananya_cf',
    kaggle: 'ananya_iyer',
    skills: ['Python', 'Scikit-Learn', 'Keras', 'OpenCV', 'TypeScript'],
  },
  {
    name: 'Vikramaditya Rao',
    email: 'vikram.rao@bx.club',
    role: 'member',
    department: 'CSE',
    year: 4,
    bxRole: 'Senior Member',
    bio: 'Open source contributor to Kubernetes and Linux kernel tooling.',
    github: 'vikramrao-dev',
    leetcode: 'vikram_rao',
    codeforces: 'vikram_expert',
    kaggle: 'vikram_ml',
    skills: ['Golang', 'Rust', 'Kubernetes', 'Linux', 'PostgreSQL'],
  },
  {
    name: 'Sneha Kulkarni',
    email: 'sneha.k@bx.club',
    role: 'member',
    department: 'ISE',
    year: 3,
    bxRole: 'Senior Member',
    bio: 'Frontend architect and UI/UX advocate. Love building slick dark interfaces and animations.',
    github: 'snehakulkarni',
    leetcode: 'sneha_k',
    codeforces: 'sneha_algo',
    kaggle: 'sneha_kulkarni',
    skills: ['React', 'Vue', 'Tailwind CSS', 'Framer Motion', 'Figma'],
  },
  {
    name: 'Karthik Nair',
    email: 'karthik.n@bx.club',
    role: 'member',
    department: 'EEE',
    year: 2,
    bxRole: 'Member',
    bio: 'Robotics and microcontroller programmer exploring full stack web applications.',
    github: 'karthiknair',
    leetcode: 'karthik_n',
    codeforces: 'karthik_cf',
    kaggle: 'karthik_ds',
    skills: ['C++', 'Arduino', 'Python', 'Node.js', 'MongoDB'],
  },
  {
    name: 'Tanvi Joshi',
    email: 'tanvi.j@bx.club',
    role: 'member',
    department: 'CSE',
    year: 1,
    bxRole: 'Member',
    bio: 'Freshman enthusiastic about competitive programming and open source hackathons.',
    github: 'tanvijoshi',
    leetcode: 'tanvi_j',
    codeforces: 'tanvi_code',
    kaggle: 'tanvi_kaggle',
    skills: ['Java', 'C++', 'HTML', 'CSS', 'JavaScript'],
  },
  {
    name: 'Aditya Verma',
    email: 'aditya.v@bx.club',
    role: 'member',
    department: 'ME',
    year: 3,
    bxRole: 'Member',
    bio: 'Mechanical engineering major transitioning into cloud computing and DevOps.',
    github: 'adityaverma',
    leetcode: 'aditya_v',
    codeforces: 'aditya_cf',
    kaggle: 'aditya_ml',
    skills: ['Python', 'Docker', 'AWS', 'Linux', 'Bash'],
  },
  {
    name: 'Meera Patel',
    email: 'meera.p@bx.club',
    role: 'member',
    department: 'CSBS',
    year: 2,
    bxRole: 'Member',
    bio: 'Business systems coder with focus on data analytics and financial algorithms.',
    github: 'meerapatel',
    leetcode: 'meera_p',
    codeforces: 'meera_algo',
    kaggle: 'meera_data',
    skills: ['SQL', 'Python', 'PowerBI', 'React', 'Flask'],
  },
  {
    name: 'Nikhil Gowda',
    email: 'nikhil.g@bx.club',
    role: 'member',
    department: 'CSE',
    year: 3,
    bxRole: 'Senior Member',
    bio: 'Cloud and cybersecurity fanatic. CTF solver and BX internal security auditor.',
    github: 'nikhilgowda',
    leetcode: 'nikhil_g',
    codeforces: 'nikhil_cf',
    kaggle: 'nikhil_kaggle',
    skills: ['Cybersecurity', 'Wireshark', 'Python', 'Go', 'Linux'],
  },
  {
    name: 'Divya Nambiar',
    email: 'divya.n@bx.club',
    role: 'member',
    department: 'ECE',
    year: 4,
    bxRole: 'Alumni',
    bio: 'Former BX Core Lead now mentoring juniors in DSA and system architecture.',
    github: 'divyanambiar',
    leetcode: 'divya_n',
    codeforces: 'divya_cf',
    kaggle: 'divya_ml',
    skills: ['System Design', 'Java', 'Spring Boot', 'Kafka', 'React'],
  },
  {
    name: 'Siddharth Menon',
    email: 'siddharth.m@bx.club',
    role: 'member',
    department: 'AIDS',
    year: 1,
    bxRole: 'Member',
    bio: 'Deep learning explorer and fast-learner. Building AI models for campus accessibility.',
    github: 'siddharthmenon',
    leetcode: 'sid_codes',
    codeforces: 'sid_algo',
    kaggle: 'sid_menon',
    skills: ['Python', 'PyTorch', 'FastAPI', 'Git', 'NumPy'],
  },
  {
    name: 'Rhea Sen',
    email: 'rhea.s@bx.club',
    role: 'member',
    department: 'ISE',
    year: 2,
    bxRole: 'Member',
    bio: 'Web3 and distributed ledger experimenter. BX hackathon organizer.',
    github: 'rheasen',
    leetcode: 'rhea_s',
    codeforces: 'rhea_cf',
    kaggle: 'rhea_kaggle',
    skills: ['Solidity', 'Rust', 'React', 'Node.js', 'GraphQL'],
  },
  {
    name: 'Abhinav Bhat',
    email: 'abhinav.b@bx.club',
    role: 'member',
    department: 'CSE',
    year: 2,
    bxRole: 'Member',
    bio: 'Full stack MERN developer building high performance web utilities for BX.',
    github: 'abhinavbhat',
    leetcode: 'abhi_leetcode',
    codeforces: 'abhi_cf',
    kaggle: 'abhi_data',
    skills: ['MongoDB', 'Express', 'React', 'Node.js', 'Tailwind'],
  },
  {
    name: 'Kavya Reddy',
    email: 'kavya.r@bx.club',
    role: 'member',
    department: 'ECE',
    year: 3,
    bxRole: 'Member',
    bio: 'Signal processing researcher and Python automation specialist.',
    github: 'kavyareddy',
    leetcode: 'kavya_r',
    codeforces: 'kavya_cf',
    kaggle: 'kavya_ai',
    skills: ['MATLAB', 'Python', 'C++', 'Django', 'PostgreSQL'],
  },
  {
    name: 'Harsh Vardhan',
    email: 'harsh.v@bx.club',
    role: 'member',
    department: 'ME',
    year: 2,
    bxRole: 'Member',
    bio: 'CAD & Robotics simulation engineer learning full stack dashboard development.',
    github: 'harshvardhan',
    leetcode: 'harsh_v',
    codeforces: 'harsh_cf',
    kaggle: 'harsh_kaggle',
    skills: ['ROS', 'C++', 'Python', 'Vue.js', 'Docker'],
  },
  {
    name: 'Varun Hegde',
    email: 'varun.h@bx.club',
    role: 'member',
    department: 'CSE',
    year: 3,
    bxRole: 'Core Team',
    bio: 'Competitive programmer, Codeforces Specialist, and technical problem setter for BX contests.',
    github: 'varunhegde',
    leetcode: 'varun_h',
    codeforces: 'varun_specialist',
    kaggle: 'varun_ml',
    skills: ['C++', 'Competitive Programming', 'Data Structures', 'Go'],
  },
  {
    name: 'Pooja Agarwal',
    email: 'pooja.a@bx.club',
    role: 'member',
    department: 'AIDS',
    year: 4,
    bxRole: 'Senior Member',
    bio: 'Senior AI engineer placed at top tech firm. Mentoring club members on machine learning workflows.',
    github: 'poojaagarwal',
    leetcode: 'pooja_a',
    codeforces: 'pooja_cf',
    kaggle: 'pooja_grandmaster',
    skills: ['MLOps', 'PyTorch', 'Kubeflow', 'Docker', 'FastAPI'],
  },
];

const sampleEvents = [
  {
    title: 'BX Inauguration & Tech Roadmap 2026',
    description: 'Annual opening orientation, club constitution review, and introduction to technical domains.',
    date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    startTime: '16:00',
    endTime: '18:30',
    location: 'Main Auditorium / Hall A',
    type: 'meeting',
  },
  {
    title: 'Advanced Graph Algorithms & Dynamic Programming',
    description: 'Deep dive into DFS/BFS variants, Dijkstra, segment trees, and DP optimization techniques.',
    date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    startTime: '17:00',
    endTime: '19:30',
    location: 'Computer Lab 3 & Discord Stream',
    type: 'workshop',
  },
  {
    title: 'BX 24-Hour Winter Hackathon 2026',
    description: 'Flagship hackathon tackling AI/ML, Web3, Smart Cities, and Developer Tools.',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    startTime: '10:00',
    endTime: '10:00 (Next Day)',
    location: 'BX Innovation Centre Hub',
    type: 'hackathon',
  },
  {
    title: 'MERN Stack & Scalable Cloud Microservices',
    description: 'Hands-on architectural masterclass building production systems with Docker and MongoDB.',
    date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    startTime: '17:30',
    endTime: '19:30',
    location: 'Lab 2 / Tech Seminar Hall',
    type: 'training',
  },
  {
    title: 'BX Algorithmic Showdown: Contest #14',
    description: '2.5-hour rated speed-coding contest for all departments.',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    startTime: '18:00',
    endTime: '20:30',
    location: 'Online Platform / Lab 4',
    type: 'contest',
  },
  {
    title: 'Upcoming: GenAI & LLM Fine-Tuning Bootcamp',
    description: 'Upcoming hands-on workshop on LangChain, RAG architecture, and local open-source LLMs.',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    startTime: '17:00',
    endTime: '19:00',
    location: 'Seminar Hall B',
    type: 'workshop',
  },
  {
    title: 'Upcoming: BX Spring Open Hackathon',
    description: 'Spring hackathon with industry mentors and cash prizes.',
    date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
    startTime: '09:00',
    endTime: '21:00',
    location: 'Innovation Arena',
    type: 'hackathon',
  },
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bx_analytics';
    console.log(`\nConnecting to MongoDB for seeding: ${mongoUri.replace(/:([^:@]{4})[^:@]*@/, ':****@')}...`);
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    console.log('Clearing existing data collections...');
    await User.deleteMany({});
    await MemberProfile.deleteMany({});
    await Activity.deleteMany({});
    await Contribution.deleteMany({});
    await Event.deleteMany({});
    await Attendance.deleteMany({});
    await Setting.deleteMany({});
    await Report.deleteMany({});

    console.log('Creating default system settings...');
    await Setting.create([
      { key: 'clubName', value: 'BX Technical Club', description: 'Official club title', isPublic: true },
      { key: 'tagline', value: 'Empowering Next-Gen Engineers Through Code & Collaboration', isPublic: true },
      { key: 'minAttendanceThreshold', value: 75, description: 'Minimum percentage for certificates', isPublic: true },
      { key: 'enabledPlatforms', value: ['github', 'leetcode', 'codeforces', 'kaggle', 'hackerrank', 'geeksforgeeks'], isPublic: true },
      { key: 'autoSyncIntervalHours', value: 12, description: 'Automatic background sync frequency', isPublic: false },
    ]);

    console.log(`Seeding ${sampleMembers.length} BX club members...`);
    const createdProfiles = [];
    const passwordHash = await bcrypt.hash('password123', 10);

    for (let m of sampleMembers) {
      const user = await User.create({
        name: m.name,
        email: m.email,
        password: 'password123', // Model pre-save will hash or we pass plain
        role: m.role,
        status: 'active',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(m.name)}`,
      });

      // Realistic stats generator
      const commits = Math.floor(Math.random() * 250) + 80;
      const easy = Math.floor(Math.random() * 80) + 30;
      const med = Math.floor(Math.random() * 60) + 20;
      const hard = Math.floor(Math.random() * 15) + 3;
      const totalSolved = easy + med + hard;
      const cfRating = Math.floor(Math.random() * 600) + 1250;
      const cfSolved = Math.floor(Math.random() * 120) + 30;
      const kaggleComps = Math.floor(Math.random() * 6) + 1;
      const kaggleNotebooks = Math.floor(Math.random() * 12) + 2;

      const platforms = [
        {
          name: 'github',
          username: m.github,
          profileUrl: `https://github.com/${m.github}`,
          verified: true,
          lastSyncedAt: new Date(),
          stats: {
            publicRepos: Math.floor(Math.random() * 20) + 8,
            totalCommits: commits,
            starsReceived: Math.floor(Math.random() * 45) + 5,
            pullRequestsMerged: Math.floor(Math.random() * 18) + 4,
            followers: Math.floor(Math.random() * 35) + 10,
          },
        },
        {
          name: 'leetcode',
          username: m.leetcode,
          profileUrl: `https://leetcode.com/${m.leetcode}`,
          verified: true,
          lastSyncedAt: new Date(),
          stats: {
            totalSolved,
            easySolved: easy,
            mediumSolved: med,
            hardSolved: hard,
            ranking: Math.floor(Math.random() * 60000) + 15000,
            contestRating: Math.floor(Math.random() * 400) + 1500,
            contestsAttended: Math.floor(Math.random() * 12) + 2,
          },
        },
        {
          name: 'codeforces',
          username: m.codeforces,
          profileUrl: `https://codeforces.com/profile/${m.codeforces}`,
          verified: true,
          lastSyncedAt: new Date(),
          stats: {
            rating: cfRating,
            maxRating: cfRating + 80,
            rank: cfRating >= 1600 ? 'Expert' : cfRating >= 1400 ? 'Specialist' : 'Pupil',
            problemsSolved: cfSolved,
            contestsCount: Math.floor(Math.random() * 15) + 3,
          },
        },
        {
          name: 'kaggle',
          username: m.kaggle,
          profileUrl: `https://kaggle.com/${m.kaggle}`,
          verified: true,
          lastSyncedAt: new Date(),
          stats: {
            competitions: kaggleComps,
            notebooks: kaggleNotebooks,
            tier: 'Expert',
          },
        },
        {
          name: 'linkedin',
          username: m.name.toLowerCase().replace(/\s+/g, '-'),
          profileUrl: `https://linkedin.com/in/${m.name.toLowerCase().replace(/\s+/g, '-')}`,
          verified: true,
        },
        {
          name: 'portfolio',
          username: m.github,
          profileUrl: `https://${m.github}.dev`,
          verified: true,
        },
      ];

      const profile = await MemberProfile.create({
        user: user._id,
        department: m.department,
        year: m.year,
        bxRole: m.bxRole,
        bio: m.bio,
        skills: m.skills,
        platforms,
        socialLinks: {
          linkedin: `https://linkedin.com/in/${m.name.toLowerCase().replace(/\s+/g, '-')}`,
          portfolio: `https://${m.github}.dev`,
        },
        statsSummary: {
          githubCommits: commits,
          leetcodeSolved: totalSolved,
          leetcodeEasy: easy,
          leetcodeMedium: med,
          leetcodeHard: hard,
          codeforcesRating: cfRating,
          codeforcesSolved: cfSolved,
          kaggleCompetitions: kaggleComps,
          kaggleNotebooks: kaggleNotebooks,
          totalContributions: commits + (totalSolved * 2) + (cfSolved * 3) + (kaggleComps * 20),
          eventsAttended: 0, // calculated later
          totalEvents: 0,
          attendanceRate: 0,
          streakDays: Math.floor(Math.random() * 14) + 1,
        },
      });

      createdProfiles.push({ profile, user, m });
    }

    console.log('Seeding Events & Generating QR codes...');
    const createdEvents = [];
    const superAdminUser = createdProfiles[0].user;

    for (let ev of sampleEvents) {
      const qrToken = crypto.randomBytes(16).toString('hex');
      const qrPayload = JSON.stringify({ token: qrToken });
      const qrDataUrl = await QRCode.toDataURL(qrPayload, {
        errorCorrectionLevel: 'H',
        margin: 2,
        color: { dark: '#4f46e5', light: '#ffffff' },
      });

      const event = await Event.create({
        ...ev,
        qrCodeToken: qrToken,
        qrCodeDataUrl: qrDataUrl,
        createdBy: superAdminUser._id,
      });

      createdEvents.push(event);
    }

    console.log('Seeding Attendance Records & Calculating Streaks...');
    const pastEvents = createdEvents.filter(e => new Date(e.date) <= new Date());

    for (let profileObj of createdProfiles) {
      let attendedCount = 0;
      for (let ev of pastEvents) {
        // 75-90% attendance probability for realistic club stats
        const isPresent = Math.random() > 0.22;
        const status = isPresent ? 'present' : (Math.random() > 0.5 ? 'absent' : 'excused');

        if (status === 'present') attendedCount++;

        await Attendance.create({
          event: ev._id,
          member: profileObj.profile._id,
          user: profileObj.user._id,
          status,
          method: Math.random() > 0.35 ? 'qr' : 'manual',
          markedAt: new Date(ev.date),
        });
      }

      const totalPast = pastEvents.length;
      const rate = totalPast > 0 ? Math.round((attendedCount / totalPast) * 100) : 0;
      profileObj.profile.statsSummary.eventsAttended = attendedCount;
      profileObj.profile.statsSummary.totalEvents = totalPast;
      profileObj.profile.statsSummary.attendanceRate = rate;
      profileObj.profile.statsSummary.totalContributions += (attendedCount * 10);
      await profileObj.profile.save();
    }

    console.log('Seeding Time-Series Activities & Historical Commits/Problems...');
    const now = new Date();

    for (let profileObj of createdProfiles) {
      const p = profileObj.profile;
      const u = profileObj.user;

      // Seed 25-40 historical activity entries spanning past 90 days
      for (let i = 0; i < 35; i++) {
        if (Math.random() > 0.4) {
          const actDate = new Date(now);
          actDate.setDate(now.getDate() - Math.floor(Math.random() * 90));

          const types = ['commits', 'problems_solved', 'contest_rating', 'kaggle_notebook'];
          const selectedType = types[Math.floor(Math.random() * types.length)];

          if (selectedType === 'commits') {
            const count = Math.floor(Math.random() * 8) + 1;
            await Activity.create({
              member: p._id,
              user: u._id,
              platform: 'github',
              activityType: 'commits',
              value: count,
              date: actDate,
              metadata: {
                title: `Pushed ${count} commits to repo`,
                repo: `bx-club/repo-${['core-ui', 'analytics-engine', 'algo-box', 'cloud-ops'][Math.floor(Math.random() * 4)]}`,
                url: `https://github.com/${profileObj.m.github}`,
              },
            });
          } else if (selectedType === 'problems_solved') {
            const count = Math.floor(Math.random() * 3) + 1;
            const diff = ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)];
            await Activity.create({
              member: p._id,
              user: u._id,
              platform: 'leetcode',
              activityType: 'problems_solved',
              value: count,
              date: actDate,
              metadata: {
                title: `Solved ${count} ${diff} LeetCode Problem(s)`,
                difficulty: diff,
                url: `https://leetcode.com/${profileObj.m.leetcode}`,
              },
            });
          } else if (selectedType === 'contest_rating') {
            const r = Math.floor(Math.random() * 300) + 1300;
            await Activity.create({
              member: p._id,
              user: u._id,
              platform: 'codeforces',
              activityType: 'contest_rating',
              value: r,
              date: actDate,
              metadata: {
                contestName: `Codeforces Round #${780 + Math.floor(Math.random() * 80)}`,
                rank: Math.floor(Math.random() * 1200) + 100,
              },
            });
          }
        }
      }

      // Seed 2-4 Concrete Verified Contributions
      const contributionPool = [
        { source: 'github', type: 'pr_merge', title: 'Implemented Realtime WebSocket Streamer in Club Repo', impactScore: 25 },
        { source: 'bx_event', type: 'workshop_speaker', title: 'Conducted Hands-on Segment Trees Workshop', impactScore: 35 },
        { source: 'project', type: 'project_lead', title: 'Architected BX QR Attendance Scanning Engine', impactScore: 40 },
        { source: 'hackathon', type: 'hackathon_winner', title: '1st Place Winner @ National Smart City Hackathon 2026', impactScore: 50 },
        { source: 'leetcode', type: 'problem_solution', title: 'Published Detailed Article on Monotonic Queue Patterns', impactScore: 15 },
        { source: 'kaggle', type: 'kaggle_medal', title: 'Bronze Medal in Kaggle BirdCLEF Audio Classification', impactScore: 30 },
      ];

      const sampleContribs = contributionPool.sort(() => 0.5 - Math.random()).slice(0, 3);
      for (let c of sampleContribs) {
        await Contribution.create({
          member: p._id,
          user: u._id,
          source: c.source,
          type: c.type,
          title: c.title,
          description: `High-impact technical contribution completed for BX community development.`,
          date: new Date(now.getTime() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000),
          impactScore: c.impactScore,
          verified: true,
        });
      }
    }

    console.log('\n=================================================');
    console.log('✅ BX ANALYTICS DATABASE SEEDING COMPLETED!');
    console.log('=================================================');
    console.log(`👤 Super Admin: admin@bx.club      / password123`);
    console.log(`👤 Lead User:   lead@bx.club       / password123`);
    console.log(`👤 Member User: member@bx.club     / password123`);
    console.log(`📊 Members Seeded:      ${createdProfiles.length}`);
    console.log(`📅 Events Seeded:       ${createdEvents.length}`);
    console.log(`📈 Activity & Attend:   Populated across all collections`);
    console.log('=================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();

import { fetchGithubStats } from './githubService.js';
import { fetchLeetcodeStats } from './leetcodeService.js';
import { fetchCodeforcesStats } from './codeforcesService.js';
import { fetchKaggleStats } from './kaggleService.js';
import Activity from '../models/Activity.js';
import Attendance from '../models/Attendance.js';
import Event from '../models/Event.js';
import MemberProfile from '../models/MemberProfile.js';

export const syncMemberPlatforms = async (memberProfile) => {
  if (!memberProfile) return null;

  let totalCommits = 0;
  let leetcodeTotal = 0;
  let leetcodeEasy = 0;
  let leetcodeMedium = 0;
  let leetcodeHard = 0;
  let cfRating = 0;
  let cfSolved = 0;
  let kaggleComps = 0;
  let kaggleNotebooks = 0;

  for (let p of memberProfile.platforms) {
    if (!p.username) continue;

    try {
      let stats = null;
      switch (p.name) {
        case 'github':
          stats = await fetchGithubStats(p.username);
          if (stats) {
            totalCommits = stats.totalCommits || 0;
            p.stats = stats;
            p.verified = true;
            p.lastSyncedAt = new Date();

            // Record recent activity entry
            await Activity.create({
              member: memberProfile._id,
              user: memberProfile.user,
              platform: 'github',
              activityType: 'commits',
              value: stats.totalCommits || 1,
              date: new Date(),
              metadata: {
                title: `GitHub Sync: ${stats.publicRepos || 0} Repos, ${stats.totalCommits || 0} Commits`,
                repo: p.username,
                url: p.profileUrl || `https://github.com/${p.username}`,
              },
            });
          }
          break;

        case 'leetcode':
          stats = await fetchLeetcodeStats(p.username);
          if (stats) {
            leetcodeTotal = stats.totalSolved || 0;
            leetcodeEasy = stats.easySolved || 0;
            leetcodeMedium = stats.mediumSolved || 0;
            leetcodeHard = stats.hardSolved || 0;
            p.stats = stats;
            p.verified = true;
            p.lastSyncedAt = new Date();

            await Activity.create({
              member: memberProfile._id,
              user: memberProfile.user,
              platform: 'leetcode',
              activityType: 'problems_solved',
              value: stats.totalSolved || 1,
              date: new Date(),
              metadata: {
                title: `LeetCode Sync: ${stats.totalSolved || 0} Solved (Rating: ${stats.contestRating || 'N/A'})`,
                difficulty: 'Medium',
                url: p.profileUrl || `https://leetcode.com/${p.username}`,
              },
            });
          }
          break;

        case 'codeforces':
          stats = await fetchCodeforcesStats(p.username);
          if (stats) {
            cfRating = stats.rating || 0;
            cfSolved = stats.problemsSolved || 0;
            p.stats = stats;
            p.verified = true;
            p.lastSyncedAt = new Date();

            await Activity.create({
              member: memberProfile._id,
              user: memberProfile.user,
              platform: 'codeforces',
              activityType: 'contest_rating',
              value: stats.rating || 1200,
              date: new Date(),
              metadata: {
                title: `Codeforces Sync: Rating ${stats.rating || 1200} (${stats.rank || 'Pupil'})`,
                rank: stats.rating || 1200,
                url: p.profileUrl || `https://codeforces.com/profile/${p.username}`,
              },
            });
          }
          break;

        case 'kaggle':
          stats = await fetchKaggleStats(p.username);
          if (stats) {
            kaggleComps = stats.competitions || 0;
            kaggleNotebooks = stats.notebooks || 0;
            p.stats = stats;
            p.verified = true;
            p.lastSyncedAt = new Date();
          }
          break;

        default:
          p.verified = true;
          p.lastSyncedAt = new Date();
          break;
      }
    } catch (err) {
      console.error(`Error syncing ${p.name} for ${p.username}:`, err.message);
    }
  }

  // Calculate attendance rates
  const totalEvents = await Event.countDocuments({ isActive: true });
  const attendedCount = await Attendance.countDocuments({
    member: memberProfile._id,
    status: 'present',
  });

  const attendanceRate = totalEvents > 0 ? Math.round((attendedCount / totalEvents) * 100) : 0;
  const totalContributions = totalCommits + (leetcodeTotal * 2) + (cfSolved * 3) + (kaggleComps * 15) + (attendedCount * 10);

  memberProfile.statsSummary = {
    ...memberProfile.statsSummary,
    githubCommits: totalCommits || memberProfile.statsSummary?.githubCommits || 0,
    leetcodeSolved: leetcodeTotal || memberProfile.statsSummary?.leetcodeSolved || 0,
    leetcodeEasy: leetcodeEasy || memberProfile.statsSummary?.leetcodeEasy || 0,
    leetcodeMedium: leetcodeMedium || memberProfile.statsSummary?.leetcodeMedium || 0,
    leetcodeHard: leetcodeHard || memberProfile.statsSummary?.leetcodeHard || 0,
    codeforcesRating: cfRating || memberProfile.statsSummary?.codeforcesRating || 0,
    codeforcesSolved: cfSolved || memberProfile.statsSummary?.codeforcesSolved || 0,
    kaggleCompetitions: kaggleComps || memberProfile.statsSummary?.kaggleCompetitions || 0,
    kaggleNotebooks: kaggleNotebooks || memberProfile.statsSummary?.kaggleNotebooks || 0,
    eventsAttended: attendedCount,
    totalEvents: totalEvents,
    attendanceRate: attendanceRate,
    totalContributions: totalContributions || memberProfile.statsSummary?.totalContributions || 10,
  };

  await memberProfile.save();
  return memberProfile;
};

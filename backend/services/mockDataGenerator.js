// Generates realistic mock platform stats and activity history

export const generateMockPlatformStats = (platformName, username = 'developer') => {
  switch (platformName.toLowerCase()) {
    case 'github': {
      const repos = Math.floor(Math.random() * 25) + 10;
      const stars = Math.floor(Math.random() * 60) + 5;
      const commits = Math.floor(Math.random() * 350) + 120;
      const prs = Math.floor(Math.random() * 30) + 8;
      return {
        username: username || 'bx_coder',
        publicRepos: repos,
        totalCommits: commits,
        starsReceived: stars,
        pullRequestsMerged: prs,
        followers: Math.floor(Math.random() * 40) + 10,
        contributedRepos: Math.floor(Math.random() * 8) + 3,
        streakDays: Math.floor(Math.random() * 45) + 5,
        lastActive: new Date().toISOString(),
      };
    }
    case 'leetcode': {
      const easy = Math.floor(Math.random() * 120) + 40;
      const medium = Math.floor(Math.random() * 90) + 30;
      const hard = Math.floor(Math.random() * 25) + 5;
      const total = easy + medium + hard;
      const rating = Math.floor(Math.random() * 600) + 1450;
      return {
        username: username || 'leetcode_bx',
        totalSolved: total,
        easySolved: easy,
        mediumSolved: medium,
        hardSolved: hard,
        ranking: Math.floor(Math.random() * 80000) + 12000,
        contestRating: rating,
        contestsAttended: Math.floor(Math.random() * 15) + 3,
        globalRanking: `${(Math.random() * 15 + 2).toFixed(1)}%`,
        acceptanceRate: `${(Math.random() * 25 + 55).toFixed(1)}%`,
      };
    }
    case 'codeforces': {
      const rating = Math.floor(Math.random() * 700) + 1200;
      const maxRating = rating + Math.floor(Math.random() * 120);
      let rank = 'Pupil';
      if (rating >= 1900) rank = 'Candidate Master';
      else if (rating >= 1600) rank = 'Expert';
      else if (rating >= 1400) rank = 'Specialist';
      return {
        username: username || 'cf_bx_master',
        rating,
        maxRating,
        rank,
        contestsCount: Math.floor(Math.random() * 20) + 4,
        problemsSolved: Math.floor(Math.random() * 180) + 50,
        contribution: Math.floor(Math.random() * 10),
      };
    }
    case 'kaggle': {
      const tiers = ['Expert', 'Master', 'Contributor', 'Grandmaster'];
      return {
        username: username || 'kaggle_bx',
        tier: tiers[Math.floor(Math.random() * (tiers.length - 1))],
        competitions: Math.floor(Math.random() * 8) + 1,
        notebooks: Math.floor(Math.random() * 18) + 4,
        datasets: Math.floor(Math.random() * 6) + 1,
        medals: {
          gold: Math.floor(Math.random() * 2),
          silver: Math.floor(Math.random() * 3),
          bronze: Math.floor(Math.random() * 5) + 1,
        },
      };
    }
    default:
      return {
        username,
        status: 'Active',
        lastUpdated: new Date().toISOString(),
      };
  }
};

export const generateHistoricalActivities = (memberId, userId, days = 90) => {
  const activities = [];
  const platforms = ['github', 'leetcode', 'codeforces', 'kaggle'];
  const now = new Date();

  for (let i = 0; i < days; i++) {
    const activityDate = new Date(now);
    activityDate.setDate(now.getDate() - i);

    // Random chance of activity on this day
    if (Math.random() > 0.45) {
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      if (platform === 'github') {
        const commitCount = Math.floor(Math.random() * 6) + 1;
        activities.push({
          member: memberId,
          user: userId,
          platform: 'github',
          activityType: 'commits',
          value: commitCount,
          date: activityDate,
          metadata: {
            title: `Pushed ${commitCount} commits to repository`,
            repo: `bx-club/project-${['alumni-portal', 'event-bot', 'algo-visualizer', 'core-api', 'cloud-tracker'][Math.floor(Math.random() * 5)]}`,
            url: 'https://github.com/bx-club',
          },
        });
      } else if (platform === 'leetcode') {
        const count = Math.floor(Math.random() * 3) + 1;
        const diffs = ['Easy', 'Medium', 'Hard'];
        const diff = diffs[Math.floor(Math.random() * diffs.length)];
        activities.push({
          member: memberId,
          user: userId,
          platform: 'leetcode',
          activityType: 'problems_solved',
          value: count,
          date: activityDate,
          metadata: {
            title: `Solved ${count} ${diff} problem(s)`,
            difficulty: diff,
            url: 'https://leetcode.com',
            tags: ['DP', 'Graph', 'Trees', 'Arrays', 'Two Pointers'].slice(0, 2),
          },
        });
      } else if (platform === 'codeforces' && i % 7 === 0) {
        const delta = Math.floor(Math.random() * 60) - 20;
        activities.push({
          member: memberId,
          user: userId,
          platform: 'codeforces',
          activityType: 'contest_rating',
          value: Math.floor(Math.random() * 300) + 1300,
          date: activityDate,
          metadata: {
            contestName: `Codeforces Round #${750 + Math.floor(Math.random() * 150)} (Div. 2)`,
            rank: Math.floor(Math.random() * 1500) + 200,
            delta,
          },
        });
      } else if (platform === 'kaggle' && i % 10 === 0) {
        activities.push({
          member: memberId,
          user: userId,
          platform: 'kaggle',
          activityType: 'kaggle_notebook',
          value: 1,
          date: activityDate,
          metadata: {
            title: 'EDA & Feature Engineering for Club Data Science Challenge',
            url: 'https://kaggle.com',
          },
        });
      }
    }
  }

  return activities;
};

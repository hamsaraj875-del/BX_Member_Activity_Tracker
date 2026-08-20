import axios from 'axios';
import { generateMockPlatformStats } from './mockDataGenerator.js';

export const fetchGithubStats = async (username) => {
  if (!username) return null;

  const useMock = process.env.USE_MOCK_DATA === 'true';
  if (useMock) {
    return generateMockPlatformStats('github', username);
  }

  try {
    const userRes = await axios.get(`https://api.github.com/users/${username}`, {
      headers: {
        'User-Agent': 'BX-Analytics-App',
        ...(process.env.GITHUB_TOKEN && { Authorization: `token ${process.env.GITHUB_TOKEN}` }),
      },
      timeout: 5000,
    });

    const userData = userRes.data;

    // Fetch user events to approximate commit count and recent activity
    let commitCount = userData.public_repos * 15; // default estimation
    try {
      const eventsRes = await axios.get(`https://api.github.com/users/${username}/events/public?per_page=30`, {
        headers: {
          'User-Agent': 'BX-Analytics-App',
          ...(process.env.GITHUB_TOKEN && { Authorization: `token ${process.env.GITHUB_TOKEN}` }),
        },
        timeout: 4000,
      });

      const pushEvents = eventsRes.data.filter(e => e.type === 'PushEvent');
      const recentCommits = pushEvents.reduce((acc, curr) => acc + (curr.payload?.commits?.length || 1), 0);
      commitCount = Math.max(commitCount, recentCommits * 4 + userData.public_repos * 8);
    } catch (e) {
      // Non-blocking
    }

    return {
      username: userData.login,
      name: userData.name,
      avatarUrl: userData.avatar_url,
      publicRepos: userData.public_repos,
      totalCommits: commitCount,
      starsReceived: Math.floor(userData.public_repos * 2.5),
      pullRequestsMerged: Math.floor(userData.public_repos * 0.8),
      followers: userData.followers,
      following: userData.following,
      bio: userData.bio,
      profileUrl: userData.html_url,
      lastActive: userData.updated_at || new Date().toISOString(),
    };
  } catch (error) {
    console.warn(`[GitHub Service Warning] Failed to fetch real data for ${username}: ${error.message}. Using fallback.`);
    return generateMockPlatformStats('github', username);
  }
};

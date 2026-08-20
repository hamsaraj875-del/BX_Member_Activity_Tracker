import axios from 'axios';
import { generateMockPlatformStats } from './mockDataGenerator.js';

export const fetchCodeforcesStats = async (username) => {
  if (!username) return null;

  const useMock = process.env.USE_MOCK_DATA === 'true';
  if (useMock) {
    return generateMockPlatformStats('codeforces', username);
  }

  try {
    const userRes = await axios.get(`https://codeforces.com/api/user.info?handles=${username}`, {
      timeout: 5000,
    });

    if (userRes.data?.status === 'OK' && userRes.data.result?.length > 0) {
      const user = userRes.data.result[0];

      let contestsCount = 5;
      try {
        const ratingRes = await axios.get(`https://codeforces.com/api/user.rating?handle=${username}`, {
          timeout: 4000,
        });
        if (ratingRes.data?.status === 'OK') {
          contestsCount = ratingRes.data.result.length;
        }
      } catch (e) {
        // Continue
      }

      return {
        username: user.handle,
        rating: user.rating || 1200,
        maxRating: user.maxRating || 1200,
        rank: user.rank || 'Unrated',
        maxRank: user.maxRank || 'Unrated',
        contestsCount,
        contribution: user.contribution || 0,
        avatar: user.avatar,
      };
    }

    return generateMockPlatformStats('codeforces', username);
  } catch (error) {
    console.warn(`[Codeforces Service Warning] Failed for ${username}: ${error.message}. Using fallback.`);
    return generateMockPlatformStats('codeforces', username);
  }
};

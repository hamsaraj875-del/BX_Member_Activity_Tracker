import { generateMockPlatformStats } from './mockDataGenerator.js';

export const fetchKaggleStats = async (username) => {
  if (!username) return null;
  // Kaggle lacks a direct unauthenticated public JSON API, so we provide structured data via mock generator with fallback
  return generateMockPlatformStats('kaggle', username);
};

/**
 * Application Constants
 */

module.exports = {
  // Categories
  CATEGORIES: [
    'Health',
    'Fitness',
    'Learning',
    'Wellness',
    'Productivity',
    'Social',
    'Finance',
    'Other'
  ],

  // Frequency Types
  FREQUENCIES: ['Daily', 'Weekly', 'Custom'],

  // Badge Tiers
  BADGE_TIERS: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],

  // Badge Rarities
  BADGE_RARITIES: ['Common', 'Rare', 'Epic', 'Legendary'],

  // Achievement Types
  ACHIEVEMENT_TYPES: ['streak', 'completion', 'level_up', 'badge_earned', 'milestone'],

  // Notification Types
  NOTIFICATION_TYPES: ['reminder', 'achievement', 'streak', 'level_up', 'badge', 'system'],

  // XP Values
  XP: {
    DEFAULT_HABIT_COMPLETION: 50,
    LEVEL_MULTIPLIER: 500, // XP needed = level * 500
    STREAK_MILESTONE_BONUS: 5 // XP per day for milestone streaks
  },

  // Pagination
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  },

  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100
  }
};

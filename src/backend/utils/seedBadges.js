const mongoose = require('mongoose');
require('dotenv').config();
const Badge = require('../models/Badge');

// Connect to database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

const badges = [
  // Completion Badges
  {
    name: 'First Step',
    description: 'Complete your first habit',
    icon: '🎯',
    color: '#CD7F32',
    tier: 'Bronze',
    category: 'Completion',
    requirement: { type: 'completions', value: 1, description: 'Complete 1 habit' },
    xpReward: 50,
    rarity: 'Common'
  },
  {
    name: 'Getting Started',
    description: 'Complete 10 habits',
    icon: '⭐',
    color: '#C0C0C0',
    tier: 'Silver',
    category: 'Completion',
    requirement: { type: 'completions', value: 10, description: 'Complete 10 habits' },
    xpReward: 100,
    rarity: 'Common'
  },
  {
    name: 'Habit Master',
    description: 'Complete 50 habits',
    icon: '🌟',
    color: '#FFD700',
    tier: 'Gold',
    category: 'Completion',
    requirement: { type: 'completions', value: 50, description: 'Complete 50 habits' },
    xpReward: 250,
    rarity: 'Rare'
  },
  {
    name: 'Century Club',
    description: 'Complete 100 habits',
    icon: '💯',
    color: '#E5E4E2',
    tier: 'Platinum',
    category: 'Completion',
    requirement: { type: 'completions', value: 100, description: 'Complete 100 habits' },
    xpReward: 500,
    rarity: 'Epic'
  },
  {
    name: 'Legendary',
    description: 'Complete 500 habits',
    icon: '👑',
    color: '#B9F2FF',
    tier: 'Diamond',
    category: 'Completion',
    requirement: { type: 'completions', value: 500, description: 'Complete 500 habits' },
    xpReward: 1000,
    rarity: 'Legendary'
  },

  // Streak Badges
  {
    name: 'Hot Streak',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    color: '#CD7F32',
    tier: 'Bronze',
    category: 'Streak',
    requirement: { type: 'streak', value: 3, description: 'Maintain a 3-day streak' },
    xpReward: 75,
    rarity: 'Common'
  },
  {
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    color: '#C0C0C0',
    tier: 'Silver',
    category: 'Streak',
    requirement: { type: 'streak', value: 7, description: 'Maintain a 7-day streak' },
    xpReward: 150,
    rarity: 'Rare'
  },
  {
    name: 'Fortnight Fighter',
    description: 'Maintain a 14-day streak',
    icon: '🔥',
    color: '#FFD700',
    tier: 'Gold',
    category: 'Streak',
    requirement: { type: 'streak', value: 14, description: 'Maintain a 14-day streak' },
    xpReward: 300,
    rarity: 'Rare'
  },
  {
    name: 'Monthly Marvel',
    description: 'Maintain a 30-day streak',
    icon: '🔥',
    color: '#E5E4E2',
    tier: 'Platinum',
    category: 'Streak',
    requirement: { type: 'streak', value: 30, description: 'Maintain a 30-day streak' },
    xpReward: 600,
    rarity: 'Epic'
  },
  {
    name: 'Streak Legend',
    description: 'Maintain a 100-day streak',
    icon: '🔥',
    color: '#B9F2FF',
    tier: 'Diamond',
    category: 'Streak',
    requirement: { type: 'streak', value: 100, description: 'Maintain a 100-day streak' },
    xpReward: 2000,
    rarity: 'Legendary'
  },

  // Level Badges
  {
    name: 'Novice',
    description: 'Reach level 5',
    icon: '🌱',
    color: '#CD7F32',
    tier: 'Bronze',
    category: 'Level',
    requirement: { type: 'level', value: 5, description: 'Reach level 5' },
    xpReward: 100,
    rarity: 'Common'
  },
  {
    name: 'Intermediate',
    description: 'Reach level 10',
    icon: '🌿',
    color: '#C0C0C0',
    tier: 'Silver',
    category: 'Level',
    requirement: { type: 'level', value: 10, description: 'Reach level 10' },
    xpReward: 200,
    rarity: 'Rare'
  },
  {
    name: 'Expert',
    description: 'Reach level 20',
    icon: '🌳',
    color: '#FFD700',
    tier: 'Gold',
    category: 'Level',
    requirement: { type: 'level', value: 20, description: 'Reach level 20' },
    xpReward: 500,
    rarity: 'Epic'
  },
  {
    name: 'Master',
    description: 'Reach level 50',
    icon: '🏆',
    color: '#E5E4E2',
    tier: 'Platinum',
    category: 'Level',
    requirement: { type: 'level', value: 50, description: 'Reach level 50' },
    xpReward: 1000,
    rarity: 'Legendary'
  },

  // Achievement Badges
  {
    name: 'Habit Collector',
    description: 'Create 5 different habits',
    icon: '📚',
    color: '#FFD700',
    tier: 'Gold',
    category: 'Achievement',
    requirement: { type: 'habits', value: 5, description: 'Create 5 different habits' },
    xpReward: 200,
    rarity: 'Rare'
  },
  {
    name: 'Habit Hoarder',
    description: 'Create 10 different habits',
    icon: '📖',
    color: '#E5E4E2',
    tier: 'Platinum',
    category: 'Achievement',
    requirement: { type: 'habits', value: 10, description: 'Create 10 different habits' },
    xpReward: 400,
    rarity: 'Epic'
  },

  // Special Badges
  {
    name: 'Early Adopter',
    description: 'Join the HabitFlow community',
    icon: '🎉',
    color: '#FFD700',
    tier: 'Gold',
    category: 'Special',
    requirement: { type: 'custom', value: 1, description: 'Create your account' },
    xpReward: 100,
    rarity: 'Rare'
  },
  {
    name: 'Perfectionist',
    description: 'Complete all habits in a day',
    icon: '✨',
    color: '#E5E4E2',
    tier: 'Platinum',
    category: 'Special',
    requirement: { type: 'custom', value: 1, description: 'Complete all habits in a single day' },
    xpReward: 300,
    rarity: 'Epic'
  }
];

const seedBadges = async () => {
  try {
    // Clear existing badges
    await Badge.deleteMany({});
    console.log('🗑️  Cleared existing badges');

    // Insert new badges
    const createdBadges = await Badge.insertMany(badges);
    console.log(`✅ Created ${createdBadges.length} badges`);

    console.log('\n📊 Badges by Category:');
    const byCategory = createdBadges.reduce((acc, badge) => {
      acc[badge.category] = (acc[badge.category] || 0) + 1;
      return acc;
    }, {});
    console.table(byCategory);

    console.log('\n📊 Badges by Tier:');
    const byTier = createdBadges.reduce((acc, badge) => {
      acc[badge.tier] = (acc[badge.tier] || 0) + 1;
      return acc;
    }, {});
    console.table(byTier);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding badges:', error);
    process.exit(1);
  }
};

seedBadges();

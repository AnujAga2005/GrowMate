const User = require('../models/User');
const Habit = require('../models/Habit');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

/**
 * @desc    Get user stats/dashboard
 * @route   GET /api/users/stats
 * @access  Private
 */
exports.getUserStats = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const habits = await Habit.find({ user: req.user.id, isActive: true });
  
  // Calculate today's completions
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const completedToday = habits.filter(habit => {
    return habit.completedDates.some(date => {
      const completedDate = new Date(date);
      completedDate.setHours(0, 0, 0, 0);
      return completedDate.getTime() === today.getTime();
    });
  }).length;
  
  // Calculate total completions
  const totalCompletions = habits.reduce((sum, habit) => sum + habit.totalCompletions, 0);
  
  // Get badges count
  const badgesCount = await UserBadge.countDocuments({ user: req.user.id });
  
  res.json({
    success: true,
    stats: {
      level: user.level,
      xp: user.xp,
      totalXP: user.totalXP,
      xpForNextLevel: user.getXPForNextLevel(),
      streak: user.streak,
      longestStreak: user.longestStreak,
      totalHabits: habits.length,
      completedToday,
      totalCompletions,
      badgesEarned: badgesCount
    }
  });
});

/**
 * @desc    Get user badges
 * @route   GET /api/users/badges
 * @access  Private
 */
exports.getUserBadges = asyncHandler(async (req, res, next) => {
  const userBadges = await UserBadge.find({ user: req.user.id })
    .populate('badge')
    .sort({ earnedAt: -1 });
  
  res.json({
    success: true,
    count: userBadges.length,
    badges: userBadges
  });
});

/**
 * @desc    Check and award eligible badges
 * @route   POST /api/users/check-badges
 * @access  Private
 */
exports.checkAndAwardBadges = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const habits = await Habit.find({ user: req.user.id });
  const allBadges = await Badge.find({ isActive: true });
  
  const newBadges = [];
  
  for (const badge of allBadges) {
    // Check if user already has this badge
    const hasBadge = await UserBadge.findOne({
      user: req.user.id,
      badge: badge._id
    });
    
    if (hasBadge) continue;
    
    let eligible = false;
    
    // Check eligibility based on requirement type
    switch (badge.requirement.type) {
      case 'streak':
        eligible = user.streak >= badge.requirement.value;
        break;
      
      case 'completions':
        const totalCompletions = habits.reduce((sum, h) => sum + h.totalCompletions, 0);
        eligible = totalCompletions >= badge.requirement.value;
        break;
      
      case 'level':
        eligible = user.level >= badge.requirement.value;
        break;
      
      case 'habits':
        eligible = habits.length >= badge.requirement.value;
        break;
    }
    
    // Award badge if eligible
    if (eligible) {
      const userBadge = await UserBadge.create({
        user: req.user.id,
        badge: badge._id
      });
      
      // Award XP
      if (badge.xpReward > 0) {
        user.addXP(badge.xpReward);
      }
      
      newBadges.push({
        ...userBadge.toObject(),
        badge
      });
    }
  }
  
  if (newBadges.length > 0) {
    await user.save();
  }
  
  res.json({
    success: true,
    newBadgesCount: newBadges.length,
    newBadges
  });
});

/**
 * @desc    Get leaderboard
 * @route   GET /api/users/leaderboard
 * @access  Private
 */
exports.getLeaderboard = asyncHandler(async (req, res, next) => {
  const { type = 'xp', limit = 10 } = req.query;
  
  let sortBy = {};
  
  switch (type) {
    case 'xp':
      sortBy = { totalXP: -1 };
      break;
    case 'level':
      sortBy = { level: -1, totalXP: -1 };
      break;
    case 'streak':
      sortBy = { streak: -1 };
      break;
    default:
      sortBy = { totalXP: -1 };
  }
  
  const users = await User.find()
    .select('name avatar level xp totalXP streak')
    .sort(sortBy)
    .limit(parseInt(limit));
  
  // Find current user's rank
  const allUsers = await User.find().sort(sortBy).select('_id');
  const userRank = allUsers.findIndex(u => u._id.toString() === req.user.id) + 1;
  
  res.json({
    success: true,
    leaderboard: users.map((user, index) => ({
      rank: index + 1,
      id: user._id,
      name: user.name,
      avatar: user.avatar,
      level: user.level,
      xp: user.xp,
      totalXP: user.totalXP,
      streak: user.streak,
      isCurrentUser: user._id.toString() === req.user.id
    })),
    currentUserRank: userRank
  });
});

/**
 * @desc    Toggle badge display
 * @route   PUT /api/users/badges/:badgeId/toggle-display
 * @access  Private
 */
exports.toggleBadgeDisplay = asyncHandler(async (req, res, next) => {
  const userBadge = await UserBadge.findOne({
    user: req.user.id,
    badge: req.params.badgeId
  });
  
  if (!userBadge) {
    return next(new AppError('Badge not found', 404));
  }
  
  userBadge.isDisplayed = !userBadge.isDisplayed;
  await userBadge.save();
  
  res.json({
    success: true,
    userBadge
  });
});

/**
 * @desc    Delete user account
 * @route   DELETE /api/users/account
 * @access  Private
 */
exports.deleteAccount = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const userEmail = req.user.email;
  
  console.log('🗑️ DELETE ACCOUNT REQUEST:', { userId, userEmail });
  
  // Verify user exists
  const user = await User.findById(userId);
  if (!user) {
    console.error('❌ User not found:', userId);
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }
  
  try {
    // Delete all user data in parallel
    console.log('🗑️ Deleting user data...');
    const [habitsResult, achievementsResult, badgesResult, logsResult, notificationsResult] = await Promise.all([
      Habit.deleteMany({ user: userId }),
      require('../models/Achievement').deleteMany({ user: userId }),
      require('../models/UserBadge').deleteMany({ user: userId }),
      require('../models/DailyLog').deleteMany({ user: userId }),
      require('../models/Notification').deleteMany({ user: userId })
    ]);
    
    console.log('✅ Deleted user data:', {
      habits: habitsResult.deletedCount,
      achievements: achievementsResult.deletedCount,
      userBadges: badgesResult.deletedCount,
      dailyLogs: logsResult.deletedCount,
      notifications: notificationsResult.deletedCount
    });
    
    // Delete user account last
    console.log('🗑️ Deleting user account...');
    await User.findByIdAndDelete(userId);
    console.log('✅ User account deleted:', userEmail);
    
    // Send success response
    res.status(200).json({
      success: true,
      message: 'Account and all data deleted successfully'
    });
    
    console.log('✅ DELETE ACCOUNT COMPLETE:', userEmail);
  } catch (error) {
    console.error('❌ Error deleting account:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete account',
      message: error.message
    });
  }
});

/**
 * @desc    Export user data
 * @route   GET /api/users/export
 * @access  Private
 */
exports.exportData = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  
  // Fetch all user data
  const [user, habits, achievements, userBadges, dailyLogs] = await Promise.all([
    User.findById(userId).select('-password'),
    Habit.find({ user: userId }),
    require('../models/Achievement').find({ user: userId }),
    UserBadge.find({ user: userId }).populate('badge'),
    require('../models/DailyLog').find({ user: userId })
  ]);
  
  const exportData = {
    exportDate: new Date().toISOString(),
    user: {
      name: user.name,
      email: user.email,
      level: user.level,
      xp: user.xp,
      totalXP: user.totalXP,
      streak: user.streak,
      longestStreak: user.longestStreak,
      createdAt: user.createdAt
    },
    habits,
    achievements,
    badges: userBadges,
    dailyLogs,
    statistics: {
      totalHabits: habits.length,
      totalCompletions: habits.reduce((sum, h) => sum + h.totalCompletions, 0),
      totalAchievements: achievements.length,
      totalBadges: userBadges.length
    }
  };
  
  res.json({
    success: true,
    data: exportData
  });
});
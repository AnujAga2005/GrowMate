const Habit = require('../models/Habit');
const DailyLog = require('../models/DailyLog');
const Achievement = require('../models/Achievement');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Get user analytics dashboard
 * @route   GET /api/analytics/dashboard
 * @access  Private
 */
exports.getDashboard = asyncHandler(async (req, res, next) => {
  const { days = 30 } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));
  
  // Get daily logs
  const dailyLogs = await DailyLog.find({
    user: req.user.id,
    date: { $gte: startDate }
  }).sort({ date: 1 });
  
  // Get habits
  const habits = await Habit.find({ user: req.user.id, isActive: true });
  
  // Calculate statistics
  const totalCompletions = dailyLogs.reduce((sum, log) => sum + log.habitsCompleted, 0);
  const totalXP = dailyLogs.reduce((sum, log) => sum + log.xpEarned, 0);
  const averageCompletionRate = dailyLogs.length > 0
    ? dailyLogs.reduce((sum, log) => sum + (log.habitsCompleted / log.totalHabits * 100 || 0), 0) / dailyLogs.length
    : 0;
  
  // Find best day
  const bestDay = dailyLogs.reduce((best, log) => {
    const rate = log.totalHabits > 0 ? (log.habitsCompleted / log.totalHabits) : 0;
    const bestRate = best.totalHabits > 0 ? (best.habitsCompleted / best.totalHabits) : 0;
    return rate > bestRate ? log : best;
  }, dailyLogs[0] || {});
  
  // Habits by category
  const habitsByCategory = habits.reduce((acc, habit) => {
    acc[habit.category] = (acc[habit.category] || 0) + 1;
    return acc;
  }, {});
  
  res.json({
    success: true,
    analytics: {
      period: {
        days: parseInt(days),
        startDate,
        endDate: new Date()
      },
      overview: {
        totalCompletions,
        totalXP,
        averageCompletionRate: Math.round(averageCompletionRate),
        activeHabits: habits.length
      },
      bestDay: bestDay ? {
        date: bestDay.date,
        completionRate: bestDay.totalHabits > 0 
          ? Math.round((bestDay.habitsCompleted / bestDay.totalHabits) * 100)
          : 0,
        habitsCompleted: bestDay.habitsCompleted
      } : null,
      dailyData: dailyLogs.map(log => ({
        date: log.date,
        habitsCompleted: log.habitsCompleted,
        totalHabits: log.totalHabits,
        completionRate: log.totalHabits > 0 
          ? Math.round((log.habitsCompleted / log.totalHabits) * 100)
          : 0,
        xpEarned: log.xpEarned
      })),
      habitsByCategory
    }
  });
});

/**
 * @desc    Get habit trends
 * @route   GET /api/analytics/trends
 * @access  Private
 */
exports.getTrends = asyncHandler(async (req, res, next) => {
  const habits = await Habit.find({ user: req.user.id, isActive: true });
  
  const trends = habits.map(habit => {
    const last7Days = habit.completedDates.filter(date => {
      const d = new Date(date);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return d >= sevenDaysAgo;
    }).length;
    
    const previous7Days = habit.completedDates.filter(date => {
      const d = new Date(date);
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return d >= fourteenDaysAgo && d < sevenDaysAgo;
    }).length;
    
    const trend = last7Days - previous7Days;
    const trendPercentage = previous7Days > 0 
      ? Math.round((trend / previous7Days) * 100)
      : (last7Days > 0 ? 100 : 0);
    
    return {
      habitId: habit._id,
      name: habit.name,
      emoji: habit.emoji,
      last7Days,
      previous7Days,
      trend: trendPercentage >= 0 ? 'up' : 'down',
      trendPercentage: Math.abs(trendPercentage),
      currentStreak: habit.streak
    };
  });
  
  // Sort by trend
  trends.sort((a, b) => {
    if (a.trend === 'up' && b.trend !== 'up') return -1;
    if (a.trend !== 'up' && b.trend === 'up') return 1;
    return b.trendPercentage - a.trendPercentage;
  });
  
  res.json({
    success: true,
    trends
  });
});

/**
 * @desc    Get streak calendar
 * @route   GET /api/analytics/streak-calendar
 * @access  Private
 */
exports.getStreakCalendar = asyncHandler(async (req, res, next) => {
  const { habitId, year, month } = req.query;
  
  if (!habitId) {
    return res.status(400).json({
      success: false,
      message: 'habitId is required'
    });
  }
  
  const habit = await Habit.findById(habitId);
  
  if (!habit) {
    return res.status(404).json({
      success: false,
      message: 'Habit not found'
    });
  }
  
  // Check ownership
  if (habit.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  }
  
  // Filter dates by year/month if provided
  let filteredDates = habit.completedDates;
  
  if (year && month) {
    filteredDates = habit.completedDates.filter(date => {
      const d = new Date(date);
      return d.getFullYear() === parseInt(year) && d.getMonth() === parseInt(month) - 1;
    });
  }
  
  // Create calendar map
  const calendar = filteredDates.reduce((acc, date) => {
    const dateStr = new Date(date).toISOString().split('T')[0];
    acc[dateStr] = true;
    return acc;
  }, {});
  
  res.json({
    success: true,
    habit: {
      id: habit._id,
      name: habit.name,
      emoji: habit.emoji,
      streak: habit.streak
    },
    calendar,
    completedDates: filteredDates
  });
});

/**
 * @desc    Get category performance
 * @route   GET /api/analytics/category-performance
 * @access  Private
 */
exports.getCategoryPerformance = asyncHandler(async (req, res, next) => {
  const habits = await Habit.find({ user: req.user.id, isActive: true });
  
  const categories = {};
  
  habits.forEach(habit => {
    if (!categories[habit.category]) {
      categories[habit.category] = {
        category: habit.category,
        habitCount: 0,
        totalCompletions: 0,
        averageStreak: 0,
        totalStreak: 0
      };
    }
    
    categories[habit.category].habitCount += 1;
    categories[habit.category].totalCompletions += habit.totalCompletions;
    categories[habit.category].totalStreak += habit.streak;
  });
  
  // Calculate averages
  const performance = Object.values(categories).map(cat => ({
    ...cat,
    averageStreak: cat.habitCount > 0 
      ? Math.round(cat.totalStreak / cat.habitCount)
      : 0,
    averageCompletions: cat.habitCount > 0
      ? Math.round(cat.totalCompletions / cat.habitCount)
      : 0
  }));
  
  // Sort by total completions
  performance.sort((a, b) => b.totalCompletions - a.totalCompletions);
  
  res.json({
    success: true,
    performance
  });
});

/**
 * @desc    Get XP history
 * @route   GET /api/analytics/xp-history
 * @access  Private
 */
exports.getXPHistory = asyncHandler(async (req, res, next) => {
  const { days = 30 } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));
  
  const dailyLogs = await DailyLog.find({
    user: req.user.id,
    date: { $gte: startDate }
  }).sort({ date: 1 });
  
  let cumulativeXP = 0;
  const xpHistory = dailyLogs.map(log => {
    cumulativeXP += log.xpEarned;
    return {
      date: log.date,
      xpEarned: log.xpEarned,
      cumulativeXP
    };
  });
  
  res.json({
    success: true,
    xpHistory
  });
});

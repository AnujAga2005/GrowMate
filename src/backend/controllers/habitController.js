const Habit = require('../models/Habit');
const User = require('../models/User');
const DailyLog = require('../models/DailyLog');
const Achievement = require('../models/Achievement');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

/**
 * @desc    Get all user habits
 * @route   GET /api/habits
 * @access  Private
 */
exports.getHabits = asyncHandler(async (req, res, next) => {
  const { category, isActive, frequency } = req.query;
  
  const filter = { user: req.user.id };
  
  if (category) filter.category = category;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (frequency) filter.frequency = frequency;
  
  const habits = await Habit.find(filter).sort({ createdAt: -1 });
  
  res.json({
    success: true,
    count: habits.length,
    habits
  });
});

/**
 * @desc    Get single habit
 * @route   GET /api/habits/:id
 * @access  Private
 */
exports.getHabit = asyncHandler(async (req, res, next) => {
  const habit = await Habit.findById(req.params.id);
  
  if (!habit) {
    return next(new AppError('Habit not found', 404));
  }
  
  // Check ownership
  if (habit.user.toString() !== req.user.id) {
    return next(new AppError('Not authorized to access this habit', 403));
  }
  
  res.json({
    success: true,
    habit
  });
});

/**
 * @desc    Create new habit
 * @route   POST /api/habits
 * @access  Private
 */
exports.createHabit = asyncHandler(async (req, res, next) => {
  const habitData = {
    ...req.body,
    user: req.user.id
  };
  
  const habit = await Habit.create(habitData);
  
  res.status(201).json({
    success: true,
    habit
  });
});

/**
 * @desc    Update habit
 * @route   PUT /api/habits/:id
 * @access  Private
 */
exports.updateHabit = asyncHandler(async (req, res, next) => {
  let habit = await Habit.findById(req.params.id);
  
  if (!habit) {
    return next(new AppError('Habit not found', 404));
  }
  
  // Check ownership
  if (habit.user.toString() !== req.user.id) {
    return next(new AppError('Not authorized to update this habit', 403));
  }
  
  habit = await Habit.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  res.json({
    success: true,
    habit
  });
});

/**
 * @desc    Delete habit
 * @route   DELETE /api/habits/:id
 * @access  Private
 */
exports.deleteHabit = asyncHandler(async (req, res, next) => {
  const habit = await Habit.findById(req.params.id);
  
  if (!habit) {
    return next(new AppError('Habit not found', 404));
  }
  
  // Check ownership
  if (habit.user.toString() !== req.user.id) {
    return next(new AppError('Not authorized to delete this habit', 403));
  }
  
  await habit.deleteOne();
  
  res.json({
    success: true,
    message: 'Habit deleted successfully'
  });
});

/**
 * @desc    Mark habit as complete
 * @route   POST /api/habits/:id/complete
 * @access  Private
 */
exports.completeHabit = asyncHandler(async (req, res, next) => {
  const habit = await Habit.findById(req.params.id);
  
  if (!habit) {
    return next(new AppError('Habit not found', 404));
  }
  
  // Check ownership
  if (habit.user.toString() !== req.user.id) {
    return next(new AppError('Not authorized to update this habit', 403));
  }
  
  const { date } = req.body;
  const completionDate = date ? new Date(date) : new Date();
  
  // Mark habit complete
  const result = await habit.markComplete(completionDate);
  
  if (result.xpEarned > 0) {
    // Award XP to user
    const user = await User.findById(req.user.id);
    const levelUpResult = user.addXP(result.xpEarned);
    await user.save();
    
    // Update daily log
    const log = await DailyLog.getOrCreateLog(req.user.id, completionDate);
    log.habitsCompleted += 1;
    log.xpEarned += result.xpEarned;
    log.completedHabits.push(habit._id);
    await log.save();
    
    // Create achievement if leveled up
    if (levelUpResult.leveledUp) {
      await Achievement.create({
        user: req.user.id,
        type: 'level_up',
        title: `Level ${levelUpResult.newLevel} Achieved!`,
        description: `You've reached level ${levelUpResult.newLevel}!`,
        icon: '🎉',
        xpEarned: 0,
        metadata: { level: levelUpResult.newLevel }
      });
    }
    
    // Create streak achievement if milestone reached
    if (result.streakIncreased && [7, 14, 30, 60, 100].includes(habit.streak)) {
      await Achievement.create({
        user: req.user.id,
        type: 'streak',
        title: `${habit.streak} Day Streak!`,
        description: `You've maintained a ${habit.streak} day streak for ${habit.name}!`,
        icon: '🔥',
        xpEarned: habit.streak * 5,
        metadata: { habitId: habit._id, streakCount: habit.streak }
      });
    }
    
    res.json({
      success: true,
      habit,
      xpEarned: result.xpEarned,
      leveledUp: levelUpResult.leveledUp,
      newLevel: levelUpResult.newLevel,
      userXP: user.xp,
      userLevel: user.level
    });
  } else {
    res.json({
      success: true,
      message: 'Habit already completed for this date',
      habit
    });
  }
});

/**
 * @desc    Mark habit as incomplete
 * @route   POST /api/habits/:id/uncomplete
 * @access  Private
 */
exports.uncompleteHabit = asyncHandler(async (req, res, next) => {
  const habit = await Habit.findById(req.params.id);
  
  if (!habit) {
    return next(new AppError('Habit not found', 404));
  }
  
  // Check ownership
  if (habit.user.toString() !== req.user.id) {
    return next(new AppError('Not authorized to update this habit', 403));
  }
  
  const { date } = req.body;
  const completionDate = date ? new Date(date) : new Date();
  
  await habit.markIncomplete(completionDate);
  
  // Update daily log
  const log = await DailyLog.findOne({
    user: req.user.id,
    date: completionDate
  });
  
  if (log) {
    log.habitsCompleted = Math.max(0, log.habitsCompleted - 1);
    log.xpEarned = Math.max(0, log.xpEarned - habit.xpReward);
    log.completedHabits = log.completedHabits.filter(
      id => id.toString() !== habit._id.toString()
    );
    await log.save();
  }
  
  res.json({
    success: true,
    habit
  });
});

/**
 * @desc    Get habit statistics
 * @route   GET /api/habits/:id/stats
 * @access  Private
 */
exports.getHabitStats = asyncHandler(async (req, res, next) => {
  const habit = await Habit.findById(req.params.id);
  
  if (!habit) {
    return next(new AppError('Habit not found', 404));
  }
  
  // Check ownership
  if (habit.user.toString() !== req.user.id) {
    return next(new AppError('Not authorized to access this habit', 403));
  }
  
  // Calculate statistics
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const completionsLast30Days = habit.completedDates.filter(
    date => new Date(date) >= thirtyDaysAgo
  ).length;
  
  const completionsLast7Days = habit.completedDates.filter(
    date => new Date(date) >= sevenDaysAgo
  ).length;
  
  const completionRate30Days = Math.round((completionsLast30Days / 30) * 100);
  const completionRate7Days = Math.round((completionsLast7Days / 7) * 100);
  
  res.json({
    success: true,
    stats: {
      totalCompletions: habit.totalCompletions,
      currentStreak: habit.streak,
      longestStreak: habit.longestStreak,
      completionsLast7Days,
      completionsLast30Days,
      completionRate7Days,
      completionRate30Days,
      completedDates: habit.completedDates.slice(-90) // Last 90 days
    }
  });
});

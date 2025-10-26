const Achievement = require('../models/Achievement');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

/**
 * @desc    Get user achievements
 * @route   GET /api/achievements
 * @access  Private
 */
exports.getAchievements = asyncHandler(async (req, res, next) => {
  const { type, limit = 50 } = req.query;
  
  const filter = { user: req.user.id };
  
  if (type) filter.type = type;
  
  const achievements = await Achievement.find(filter)
    .populate('metadata.habitId', 'name emoji')
    .populate('metadata.badgeId', 'name icon')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));
  
  res.json({
    success: true,
    count: achievements.length,
    achievements
  });
});

/**
 * @desc    Get single achievement
 * @route   GET /api/achievements/:id
 * @access  Private
 */
exports.getAchievement = asyncHandler(async (req, res, next) => {
  const achievement = await Achievement.findById(req.params.id)
    .populate('metadata.habitId', 'name emoji')
    .populate('metadata.badgeId', 'name icon');
  
  if (!achievement) {
    return next(new AppError('Achievement not found', 404));
  }
  
  // Check ownership
  if (achievement.user.toString() !== req.user.id) {
    return next(new AppError('Not authorized to access this achievement', 403));
  }
  
  res.json({
    success: true,
    achievement
  });
});

/**
 * @desc    Delete achievement
 * @route   DELETE /api/achievements/:id
 * @access  Private
 */
exports.deleteAchievement = asyncHandler(async (req, res, next) => {
  const achievement = await Achievement.findById(req.params.id);
  
  if (!achievement) {
    return next(new AppError('Achievement not found', 404));
  }
  
  // Check ownership
  if (achievement.user.toString() !== req.user.id) {
    return next(new AppError('Not authorized to delete this achievement', 403));
  }
  
  await achievement.deleteOne();
  
  res.json({
    success: true,
    message: 'Achievement deleted successfully'
  });
});

/**
 * @desc    Get achievement statistics
 * @route   GET /api/achievements/stats
 * @access  Private
 */
exports.getAchievementStats = asyncHandler(async (req, res, next) => {
  const achievements = await Achievement.find({ user: req.user.id });
  
  // Group by type
  const byType = achievements.reduce((acc, achievement) => {
    acc[achievement.type] = (acc[achievement.type] || 0) + 1;
    return acc;
  }, {});
  
  // Calculate total XP from achievements
  const totalXP = achievements.reduce((sum, a) => sum + a.xpEarned, 0);
  
  // Get recent achievements (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentCount = achievements.filter(a => a.createdAt >= sevenDaysAgo).length;
  
  res.json({
    success: true,
    stats: {
      total: achievements.length,
      byType,
      totalXPEarned: totalXP,
      recentAchievements: recentCount
    }
  });
});

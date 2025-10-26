const Badge = require('../models/Badge');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

/**
 * @desc    Get all badges
 * @route   GET /api/badges
 * @access  Public
 */
exports.getAllBadges = asyncHandler(async (req, res, next) => {
  const { category, tier, rarity } = req.query;
  
  const filter = { isActive: true };
  
  if (category) filter.category = category;
  if (tier) filter.tier = tier;
  if (rarity) filter.rarity = rarity;
  
  const badges = await Badge.find(filter).sort({ tier: 1, 'requirement.value': 1 });
  
  res.json({
    success: true,
    count: badges.length,
    badges
  });
});

/**
 * @desc    Get single badge
 * @route   GET /api/badges/:id
 * @access  Public
 */
exports.getBadge = asyncHandler(async (req, res, next) => {
  const badge = await Badge.findById(req.params.id);
  
  if (!badge) {
    return next(new AppError('Badge not found', 404));
  }
  
  res.json({
    success: true,
    badge
  });
});

/**
 * @desc    Create badge (Admin only - for now public for testing)
 * @route   POST /api/badges
 * @access  Public
 */
exports.createBadge = asyncHandler(async (req, res, next) => {
  const badge = await Badge.create(req.body);
  
  res.status(201).json({
    success: true,
    badge
  });
});

/**
 * @desc    Update badge (Admin only - for now public for testing)
 * @route   PUT /api/badges/:id
 * @access  Public
 */
exports.updateBadge = asyncHandler(async (req, res, next) => {
  const badge = await Badge.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!badge) {
    return next(new AppError('Badge not found', 404));
  }
  
  res.json({
    success: true,
    badge
  });
});

/**
 * @desc    Delete badge (Admin only - for now public for testing)
 * @route   DELETE /api/badges/:id
 * @access  Public
 */
exports.deleteBadge = asyncHandler(async (req, res, next) => {
  const badge = await Badge.findById(req.params.id);
  
  if (!badge) {
    return next(new AppError('Badge not found', 404));
  }
  
  await badge.deleteOne();
  
  res.json({
    success: true,
    message: 'Badge deleted successfully'
  });
});

const User = require('../models/User');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { generateToken } = require('../middleware/auth');
const passport = require('passport');

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User with this email already exists', 400));
  }
  
  // Create user
  const user = await User.create({
    name,
    email,
    password
  });
  
  // Generate token
  const token = generateToken(user._id);
  
  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      level: user.level,
      xp: user.xp,
      streak: user.streak
    }
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return next(new AppError(info.message || 'Invalid credentials', 401));
    }
    
    // Generate token
    const token = generateToken(user._id);
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        level: user.level,
        xp: user.xp,
        totalXP: user.totalXP,
        streak: user.streak,
        longestStreak: user.longestStreak,
        preferences: user.preferences
      }
    });
  })(req, res, next);
});

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate('badges');
  
  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      level: user.level,
      xp: user.xp,
      totalXP: user.totalXP,
      streak: user.streak,
      longestStreak: user.longestStreak,
      badges: user.badges,
      preferences: user.preferences,
      createdAt: user.createdAt
    }
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { name, avatar, preferences } = req.body;
  
  const user = await User.findById(req.user.id);
  
  if (name) user.name = name;
  if (avatar) user.avatar = avatar;
  if (preferences) {
    user.preferences = {
      ...user.preferences,
      ...preferences
    };
  }
  
  await user.save();
  
  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      preferences: user.preferences
    }
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return next(new AppError('Please provide current and new password', 400));
  }
  
  const user = await User.findById(req.user.id).select('+password');
  
  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return next(new AppError('Current password is incorrect', 401));
  }
  
  // Update password
  user.password = newPassword;
  await user.save();
  
  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

/**
 * @desc    Delete account
 * @route   DELETE /api/auth/account
 * @access  Private
 */
exports.deleteAccount = asyncHandler(async (req, res, next) => {
  const { password } = req.body;
  
  if (!password) {
    return next(new AppError('Please provide your password to confirm deletion', 400));
  }
  
  const user = await User.findById(req.user.id).select('+password');
  
  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new AppError('Incorrect password', 401));
  }
  
  // Delete user and all related data
  const Habit = require('../models/Habit');
  const Achievement = require('../models/Achievement');
  const DailyLog = require('../models/DailyLog');
  const Notification = require('../models/Notification');
  
  await Promise.all([
    Habit.deleteMany({ user: user._id }),
    Achievement.deleteMany({ user: user._id }),
    DailyLog.deleteMany({ user: user._id }),
    Notification.deleteMany({ user: user._id }),
    user.deleteOne()
  ]);
  
  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
});

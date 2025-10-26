const Notification = require('../models/Notification');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

/**
 * @desc    Get user notifications
 * @route   GET /api/notifications
 * @access  Private
 */
exports.getNotifications = asyncHandler(async (req, res, next) => {
  const { isRead, type, limit = 50 } = req.query;
  
  const filter = { user: req.user.id };
  
  if (isRead !== undefined) filter.isRead = isRead === 'true';
  if (type) filter.type = type;
  
  const notifications = await Notification.find(filter)
    .populate('metadata.habitId', 'name emoji')
    .populate('metadata.badgeId', 'name icon')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));
  
  res.json({
    success: true,
    count: notifications.length,
    notifications
  });
});

/**
 * @desc    Get unread notifications count
 * @route   GET /api/notifications/unread/count
 * @access  Private
 */
exports.getUnreadCount = asyncHandler(async (req, res, next) => {
  const count = await Notification.countDocuments({
    user: req.user.id,
    isRead: false
  });
  
  res.json({
    success: true,
    count
  });
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }
  
  // Check ownership
  if (notification.user.toString() !== req.user.id) {
    return next(new AppError('Not authorized to access this notification', 403));
  }
  
  await notification.markAsRead();
  
  res.json({
    success: true,
    notification
  });
});

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  const result = await Notification.updateMany(
    { user: req.user.id, isRead: false },
    { isRead: true, readAt: new Date() }
  );
  
  res.json({
    success: true,
    message: `${result.modifiedCount} notifications marked as read`
  });
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }
  
  // Check ownership
  if (notification.user.toString() !== req.user.id) {
    return next(new AppError('Not authorized to delete this notification', 403));
  }
  
  await notification.deleteOne();
  
  res.json({
    success: true,
    message: 'Notification deleted successfully'
  });
});

/**
 * @desc    Delete all read notifications
 * @route   DELETE /api/notifications/clear-read
 * @access  Private
 */
exports.clearReadNotifications = asyncHandler(async (req, res, next) => {
  const result = await Notification.deleteMany({
    user: req.user.id,
    isRead: true
  });
  
  res.json({
    success: true,
    message: `${result.deletedCount} notifications cleared`
  });
});

/**
 * @desc    Create notification (internal use)
 * @route   POST /api/notifications
 * @access  Private
 */
exports.createNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.create({
    user: req.user.id,
    ...req.body
  });
  
  res.status(201).json({
    success: true,
    notification
  });
});

const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
  createNotification
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');
const { mongoIdValidation } = require('../middleware/validator');

// All routes are protected
router.use(protect);

router.get('/', getNotifications);
router.post('/', createNotification);
router.get('/unread/count', getUnreadCount);
router.put('/read-all', markAllAsRead);
router.delete('/clear-read', clearReadNotifications);

router.put('/:id/read', mongoIdValidation, markAsRead);
router.delete('/:id', mongoIdValidation, deleteNotification);

module.exports = router;

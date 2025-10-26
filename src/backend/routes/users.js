const express = require('express');
const router = express.Router();
const {
  getUserStats,
  getUserBadges,
  checkAndAwardBadges,
  getLeaderboard,
  toggleBadgeDisplay,
  deleteAccount,
  exportData
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/stats', getUserStats);
router.get('/badges', getUserBadges);
router.post('/check-badges', checkAndAwardBadges);
router.get('/leaderboard', getLeaderboard);
router.put('/badges/:badgeId/toggle-display', toggleBadgeDisplay);
router.delete('/account', deleteAccount);
router.get('/export', exportData);

module.exports = router;
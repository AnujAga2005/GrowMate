const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount
} = require('../controllers/authController');
const { protect, generateToken } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validator');

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`
  }),
  (req, res) => {
    // Generate JWT token
    const token = generateToken(req.user._id);
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.delete('/account', protect, deleteAccount);

module.exports = router;
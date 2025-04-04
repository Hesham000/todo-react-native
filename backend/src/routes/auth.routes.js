const express = require('express');
const { check } = require('express-validator');
const {
  registerUser,
  loginUser,
  getUserProfile,
  updatePushToken,
  enableOTP,
  verifyOTP,
  disableOTP,
  validateOTP,
  verifyEmail,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  ],
  registerUser
);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  loginUser
);

// @route   GET /api/auth/me
// @desc    Get user profile
// @access  Private
router.get('/me', protect, getUserProfile);

// @route   PUT /api/auth/pushtoken
// @desc    Update push notification token
// @access  Private
router.put('/pushtoken', protect, updatePushToken);

// OTP Routes

// @route   POST /api/auth/otp/enable
// @desc    Enable OTP for a user
// @access  Private
router.post('/otp/enable', protect, enableOTP);

// @route   POST /api/auth/otp/verify
// @desc    Verify OTP and complete setup
// @access  Private
router.post('/otp/verify', protect, verifyOTP);

// @route   POST /api/auth/otp/disable
// @desc    Disable OTP for a user
// @access  Private
router.post('/otp/disable', protect, disableOTP);

// @route   POST /api/auth/otp/validate
// @desc    Authenticate with OTP after password login
// @access  Public
router.post(
  '/otp/validate',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('token', 'OTP token is required').not().isEmpty(),
  ],
  validateOTP
);

// @route   POST /api/auth/verify-email
// @desc    Verify email address after registration
// @access  Public
router.post(
  '/verify-email',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('token', 'Verification code is required').not().isEmpty(),
  ],
  verifyEmail
);

// Debug route for development mode only
if (process.env.NODE_ENV === 'development') {
  // @route   GET /api/auth/debug/otp/:email
  // @desc    Debug OTP settings for a user (DEVELOPMENT ONLY)
  // @access  Public (but only in development)
  router.get('/debug/otp/:email', async (req, res) => {
    try {
      const { email } = req.params;
      const User = require('../models/user.model');
      const user = await User.findOne({ email }).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        otpEnabled: user.otpEnabled || false,
        otpVerified: user.otpVerified || false,
        hasOtpSecret: !!user.otpSecret,
      });
    } catch (error) {
      console.error('Debug route error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  });
}

module.exports = router; 
const { validationResult } = require('express-validator');
const User = require('../models/user.model');
const generateToken = require('../utils/generateToken');
const otpUtil = require('../utils/otp.util');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  try {
    console.log('Registration attempt:', req.body.email);
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Create user with email unverified
    const user = await User.create({
      name,
      email,
      password,
      emailVerified: false
    });

    if (user) {
      // Generate OTP secret for email verification
      const secret = otpUtil.generateOTPSecret();
      
      // Save secret to user
      user.otpSecret = secret.base32;
      await user.save();
      
      // Generate an OTP
      const otp = otpUtil.generateOTP(secret.base32);
      
      // Send OTP via email
      await otpUtil.sendOTPEmail(user.email, otp);
      
      // Return response requiring email verification
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        requireEmailVerification: true,
        message: 'Registration successful. Please verify your email with the code sent to your email address.'
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    console.log('Login attempt:', req.body.email);
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('Login failed: User not found');
      res.status(401);
      throw new Error('Invalid email or password');
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      console.log('Login failed: Invalid password');
      res.status(401);
      throw new Error('Invalid email or password');
    }
    
    // Check if email is verified
    if (!user.emailVerified) {
      console.log('Login failed: Email not verified');
      
      // If user has an OTP secret, generate a new verification code
      if (user.otpSecret) {
        const otp = otpUtil.generateOTP(user.otpSecret);
        await otpUtil.sendOTPEmail(user.email, otp);
      } else {
        // Generate new OTP secret if not present
        const secret = otpUtil.generateOTPSecret();
        user.otpSecret = secret.base32;
        await user.save();
        
        const otp = otpUtil.generateOTP(user.otpSecret);
        await otpUtil.sendOTPEmail(user.email, otp);
      }
      
      return res.status(403).json({
        requireEmailVerification: true,
        email: user.email,
        message: 'Email verification required. A new verification code has been sent to your email.'
      });
    }

    // Check if OTP is enabled for this user
    console.log('User OTP status:', { 
      otpEnabled: user.otpEnabled, 
      otpVerified: user.otpVerified,
      hasOtpSecret: !!user.otpSecret 
    });
    
    if (user.otpEnabled && user.otpVerified) {
      console.log('OTP is enabled, generating new OTP');
      // If OTP is enabled, generate a new OTP and send it
      const otp = otpUtil.generateOTP(user.otpSecret);
      const emailResult = await otpUtil.sendOTPEmail(user.email, otp);
      console.log('Email send result:', emailResult);
      
      // Return a response indicating OTP is required
      console.log('Returning requireOTP response');
      return res.status(200).json({
        requireOTP: true,
        email: user.email,
        message: 'OTP sent to your email address',
      });
    }
    
    // If OTP is not enabled, proceed with normal login
    console.log('Login successful, no OTP required');
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (user) {
      res.json(user);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update push notification token
 * @route   PUT /api/auth/pushtoken
 * @access  Private
 */
const updatePushToken = async (req, res, next) => {
  try {
    const { pushToken } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (user) {
      user.pushToken = pushToken;
      await user.save();
      
      res.json({ message: 'Push token updated successfully' });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Enable OTP for a user
 * @route   POST /api/auth/otp/enable
 * @access  Private
 */
const enableOTP = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Generate OTP secret
    const secret = otpUtil.generateOTPSecret();
    
    // Save secret to user
    user.otpSecret = secret.base32;
    await user.save();
    
    // Generate an OTP
    const otp = otpUtil.generateOTP(secret.base32);
    
    // Send OTP via email
    await otpUtil.sendOTPEmail(user.email, otp);
    
    res.json({ 
      message: 'OTP setup initiated. Please verify with the code sent to your email.',
      otpSecret: secret.base32 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify OTP and complete setup
 * @route   POST /api/auth/otp/verify
 * @access  Private
 */
const verifyOTP = async (req, res, next) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      res.status(400);
      throw new Error('OTP token is required');
    }
    
    const user = await User.findById(req.user._id);
    
    if (!user || !user.otpSecret) {
      res.status(404);
      throw new Error('User not found or OTP not set up');
    }
    
    // Verify the OTP
    const isValid = otpUtil.verifyOTP(token, user.otpSecret);
    
    if (isValid) {
      user.otpVerified = true;
      user.otpEnabled = true;
      await user.save();
      
      res.json({ 
        message: 'OTP verified and enabled successfully',
        otpEnabled: true 
      });
    } else {
      res.status(401);
      throw new Error('Invalid or expired OTP');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Disable OTP for a user
 * @route   POST /api/auth/otp/disable
 * @access  Private
 */
const disableOTP = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    
    user.otpSecret = null;
    user.otpEnabled = false;
    user.otpVerified = false;
    await user.save();
    
    res.json({ 
      message: 'OTP disabled successfully',
      otpEnabled: false 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate with OTP after password login
 * @route   POST /api/auth/otp/validate
 * @access  Public
 */
const validateOTP = async (req, res, next) => {
  try {
    console.log('OTP validation attempt:', req.body);
    
    const { email, token } = req.body;
    
    if (!email || !token) {
      console.log('Missing required fields:', { email: !!email, token: !!token });
      res.status(400);
      throw new Error('Email and OTP token are required');
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('OTP validation failed: User not found');
      res.status(401);
      throw new Error('User not found or OTP not enabled');
    }
    
    if (!user.otpEnabled || !user.otpSecret) {
      console.log('OTP validation failed: OTP not enabled for user', { 
        otpEnabled: user.otpEnabled,
        hasOtpSecret: !!user.otpSecret
      });
      res.status(401);
      throw new Error('User not found or OTP not enabled');
    }
    
    console.log('Found user with OTP enabled:', { 
      userId: user._id,
      otpEnabled: user.otpEnabled,
      otpVerified: user.otpVerified 
    });
    
    // Verify the OTP
    const isValid = otpUtil.verifyOTP(token, user.otpSecret);
    console.log('OTP verification result:', isValid);
    
    if (isValid) {
      console.log('OTP validation successful, generating new token');
      const authToken = generateToken(user._id);
      
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: authToken,
        otpEnabled: user.otpEnabled,
        otpVerified: user.otpVerified
      });
    } else {
      console.log('OTP validation failed: Invalid or expired OTP');
      res.status(401);
      throw new Error('Invalid or expired OTP');
    }
  } catch (error) {
    console.error('OTP validation error:', error);
    next(error);
  }
};

/**
 * @desc    Verify email address after registration
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
const verifyEmail = async (req, res, next) => {
  try {
    console.log('Email verification attempt:', req.body);
    
    const { email, token } = req.body;
    
    if (!email || !token) {
      console.log('Missing required fields:', { email: !!email, token: !!token });
      res.status(400);
      throw new Error('Email and verification token are required');
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('Email verification failed: User not found');
      res.status(404);
      throw new Error('User not found');
    }
    
    if (!user.otpSecret) {
      console.log('Email verification failed: No OTP secret found');
      res.status(400);
      throw new Error('Verification not set up for this user');
    }
    
    if (user.emailVerified) {
      console.log('Email already verified for user:', user.email);
      return res.json({
        message: 'Email already verified',
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    }
    
    // Verify the OTP
    const isValid = otpUtil.verifyOTP(token, user.otpSecret);
    console.log('OTP verification result:', isValid);
    
    if (isValid) {
      // Mark email as verified
      user.emailVerified = true;
      await user.save();
      
      console.log('Email verification successful for user:', user.email);
      
      // Generate authentication token
      const authToken = generateToken(user._id);
      
      res.json({
        message: 'Email verified successfully',
        _id: user._id,
        name: user.name,
        email: user.email,
        token: authToken
      });
    } else {
      console.log('Email verification failed: Invalid or expired token');
      res.status(401);
      throw new Error('Invalid or expired verification code');
    }
  } catch (error) {
    console.error('Email verification error:', error);
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updatePushToken,
  enableOTP,
  verifyOTP,
  disableOTP,
  validateOTP,
  verifyEmail,
}; 
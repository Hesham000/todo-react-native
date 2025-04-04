const speakeasy = require('speakeasy');
const nodemailer = require('nodemailer');

/**
 * Generate a secret key for OTP
 * @returns {Object} OTP secret
 */
const generateOTPSecret = () => {
  console.log('Generating OTP secret');
  const secret = speakeasy.generateSecret({ length: 20 });
  console.log('OTP secret generated:', secret.base32);
  return secret;
};

/**
 * Generate an OTP token
 * @param {string} secret The OTP secret
 * @returns {string} OTP token
 */
const generateOTP = (secret) => {
  console.log('Generating OTP token with secret:', secret);
  const token = speakeasy.totp({
    secret: secret,
    encoding: 'base32',
    step: 300, // 5 minutes validity
  });
  console.log('OTP token generated:', token);
  return token;
};

/**
 * Verify an OTP token
 * @param {string} token The OTP token to verify
 * @param {string} secret The OTP secret
 * @returns {boolean} Is valid
 */
const verifyOTP = (token, secret) => {
  console.log('Verifying OTP token:', token, 'with secret:', secret);
  try {
    const isValid = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      step: 300, // 5 minutes validity
      window: 1, // Allow one step before/after for time drift
    });
    console.log('OTP verification result:', isValid);
    return isValid;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return false;
  }
};

/**
 * Send OTP via email
 * @param {string} email Recipient's email
 * @param {string} otp OTP token
 * @returns {Promise} Email sent result
 */
const sendOTPEmail = async (email, otp) => {
  console.log('Sending OTP email to:', email, 'with code:', otp);
  
  // Log the email configuration
  console.log('Email configuration:', { 
    user: process.env.EMAIL_USER || 'Not configured',
    passLength: process.env.EMAIL_PASS ? '****' + process.env.EMAIL_PASS.slice(-4) : 'Not configured'
  });
  
  // Create a transporter (configure for your email provider)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'youremail@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password',
    },
  });

  // Email options
  const mailOptions = {
    from: process.env.EMAIL_USER || 'youremail@gmail.com',
    to: email,
    subject: 'Your Todo App Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Todo App Verification</h2>
        <p>Your verification code is:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; background-color: #f4f4f4; padding: 15px; text-align: center; font-family: monospace;">${otp}</h1>
        <p>This code will expire in 5 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    
    // For development, simulate successful email sending and show OTP in console
    if (process.env.NODE_ENV === 'development') {
      console.log('DEVELOPMENT MODE: Simulating email sent with OTP:', otp);
      return { 
        success: true, 
        messageId: 'simulated-email',
        developmentOTP: otp 
      };
    }
    
    return { success: false, error };
  }
};

module.exports = {
  generateOTPSecret,
  generateOTP,
  verifyOTP,
  sendOTPEmail,
}; 
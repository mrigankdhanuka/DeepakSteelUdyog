const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register new user (Step 1: Send OTP)
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      if (userExists.isVerified) {
        return res.status(400).json({ message: 'User already exists' });
      } else {
        // User exists but not verified: Update info and resend OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationToken = crypto.createHash('sha256').update(otp).digest('hex');
        
        userExists.name = name;
        userExists.password = password; // Will be hashed by pre-save
        userExists.role = role || 'CUSTOMER';
        userExists.verificationToken = verificationToken;
        userExists.verificationTokenExpire = Date.now() + 10 * 60 * 1000; // 10 mins
        
        await userExists.save();

        try {
          await sendEmail({
            email,
            subject: 'Verify your email - Deepak Steel Udyog',
            message: `Your verification code is: ${otp}\n\nThis code expires in 10 minutes.`,
          });
          return res.status(200).json({ success: true, message: 'Verification code sent to email' });
        } catch (err) {
          return res.status(500).json({ message: 'Could not send verification email' });
        }
      }
    }

    // New User
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationToken = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'CUSTOMER',
      avatar: `https://ui-avatars.com/api/?name=${name}&background=0D9488&color=fff`,
      isVerified: false,
      verificationToken,
      verificationTokenExpire: Date.now() + 10 * 60 * 1000
    });

    try {
      await sendEmail({
        email,
        subject: 'Verify your email - Deepak Steel Udyog',
        message: `Your verification code is: ${otp}\n\nThis code expires in 10 minutes.`,
      });
      
      res.status(201).json({ success: true, message: 'Verification code sent to email' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'User created but failed to send verification email' });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Verify Email (Step 2: Check OTP)
// @route   POST /api/auth/verify-email
// @access  Public
router.post('/verify-email', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const verificationToken = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.findOne({
      email,
      verificationToken,
      verificationTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      addresses: user.addresses,
      wishlist: user.wishlist,
      token: generateToken(user._id)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
router.post('/resend-otp', async (req, res) => {
  const { email, type } = req.body; // type: 'REGISTER' or 'RESET'

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (type === 'REGISTER' && user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    const expire = Date.now() + 10 * 60 * 1000;

    if (type === 'RESET') {
      user.resetPasswordToken = hashedOtp;
      user.resetPasswordExpire = expire;
    } else {
      user.verificationToken = hashedOtp;
      user.verificationTokenExpire = expire;
    }

    await user.save({ validateBeforeSave: false });

    const subject = type === 'RESET' ? 'Password Reset OTP' : 'Verify your email';
    const message = `Your new code is: ${otp}\n\nThis code expires in 10 minutes.`;

    try {
      await sendEmail({ email, subject: `${subject} - Deepak Steel Udyog`, message });
      res.json({ success: true, message: 'Code resent' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to send email' });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (!user.isVerified) {
        return res.status(401).json({ message: 'Please verify your email address', isUnverified: true });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        addresses: user.addresses,
        wishlist: user.wishlist,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      addresses: user.addresses,
      wishlist: user.wishlist,
      avatar: user.avatar
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    if (req.body.email) user.email = req.body.email;
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      phoneNumber: updatedUser.phoneNumber,
      addresses: updatedUser.addresses,
      wishlist: updatedUser.wishlist,
      token: generateToken(updatedUser._id)
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @desc    Forgot Password (Generate OTP)
// @route   POST /api/auth/forgotpassword
// @access  Public
router.post('/forgotpassword', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'There is no user with that email' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before saving
    const resetToken = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    // Save hashed OTP to DB
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 Minutes

    await user.save({ validateBeforeSave: false });

    const message = `You requested a password reset. Your OTP is: \n\n${otp}\n\nThis code expires in 10 minutes.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset OTP - Deepak Steel Udyog',
        message,
      });

      res.status(200).json({ success: true, data: 'OTP sent to email' });
    } catch (err) {
      console.error(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Reset Password with OTP
// @route   POST /api/auth/reset-password-otp
// @access  Public
router.post('/reset-password-otp', async (req, res) => {
  const { email, otp, password } = req.body;

  try {
    // Hash the entered OTP to compare with DB
    const resetPasswordToken = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.findOne({
      email,
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid OTP or Email' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      message: "Password reset successful"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

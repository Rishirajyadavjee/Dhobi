import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Register User
export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }

    const { name, email, password, phone, role = 'user', service_area, experience_years, services_offered, rate_per_item } = req.body;

    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPhone = (phone || '').toString().replace(/\D/g, '');

    // 1. Strict validation: Phone number must be exactly 10 digits and not start with 0
    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be exactly 10 digits.'
      });
    }

    if (cleanPhone.startsWith('0')) {
      return res.status(400).json({
        success: false,
        message: 'Phone number cannot start with 0.'
      });
    }

    // 2. Check if phone number already exists in database
    const existingPhoneUser = await User.findOne({ phone: cleanPhone });
    if (existingPhoneUser) {
      return res.status(400).json({
        success: false,
        message: 'This phone number is already registered with an account. Please use another number or log in.'
      });
    }

    // 3. Check if email already exists in database
    const existingEmailUser = await User.findOne({ email: cleanEmail });
    if (existingEmailUser) {
      return res.status(400).json({
        success: false,
        message: 'This email address is already registered. Please sign in or use another email.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Build user object
    const userData = {
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      phone: cleanPhone,
      role
    };

    // If dhobi, initialise embedded profile with provided data
    if (role === 'dhobi') {
      userData.dhobiProfile = {
        service_area: (service_area || '').trim(),
        experience_years: Number(experience_years) || 0,
        services_offered: services_offered || '',
        rate_per_item: Number(rate_per_item) || 0,
        is_verified: false,
        availability_status: 'offline'
      };
    }

    const user = await User.create(userData);

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        dhobiProfile: user.dhobiProfile
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === 11000) {
      if (error.keyPattern?.phone || error.message?.includes('phone')) {
        return res.status(400).json({
          success: false,
          message: 'This phone number is already registered in the system. Please use a different phone number.'
        });
      }
      if (error.keyPattern?.email || error.message?.includes('email')) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists. Please log in.'
        });
      }
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed. Please try again.',
      error: error.message
    });
  }
};

// Login User (Supports Email OR 10-digit Phone)
export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    const identifier = (email || '').trim();

    // Check if input is a 10-digit phone number or an email
    const cleanPhoneCandidate = identifier.replace(/\D/g, '');
    const isPhoneNumber = !identifier.includes('@') && cleanPhoneCandidate.length === 10;

    let user;
    if (isPhoneNumber) {
      user = await User.findOne({ phone: cleanPhoneCandidate }).select('+password');
    } else {
      user = await User.findOne({ email: identifier.toLowerCase() }).select('+password');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. No account found with these details.'
      });
    }

    // Check account status
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is suspended or inactive. Please contact customer care.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.'
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        dhobiProfile: user.dhobiProfile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Get Current User Profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

// Change Password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

// Validation rules
export const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 60 }).withMessage('Full name must be between 2 and 60 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('phone')
    .notEmpty().withMessage('10-digit mobile number is required')
    .custom((val) => {
      const digits = (val || '').toString().replace(/\D/g, '');
      if (digits.length !== 10) {
        throw new Error('Phone number must be exactly 10 digits');
      }
      if (digits.startsWith('0')) {
        throw new Error('Phone number cannot begin with 0');
      }
      return true;
    }),
  body('role')
    .optional()
    .isIn(['user', 'dhobi']).withMessage('Role must be user or dhobi')
];

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email address or phone number is required'),
  body('password')
    .notEmpty().withMessage('Password is required')
];

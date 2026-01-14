import express from 'express';
import jwt from 'jsonwebtoken';
import User, { comparePassword } from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT Token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Validation helper functions
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Email is required' };
  }
  const trimmedEmail = email.trim().toLowerCase();
  if (trimmedEmail.length === 0) {
    return { valid: false, message: 'Email cannot be empty' };
  }
  if (!/^[A-Za-z0-9_]+@(gmail\.com|yahoo\.com|hotmail\.com)$/.test(trimmedEmail)) {
    return { valid: false, message: 'Email must be a valid email ending with gmail.com, yahoo.com, or hotmail.com' };
  }
  return { valid: true, email: trimmedEmail };
};

const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  if (password.length < 8 || password.length > 15) {
    return { valid: false, message: 'Password must be between 8 and 15 characters' };
  }
  if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,15}$/.test(password)) {
    return { valid: false, message: 'Password must include at least one uppercase letter, one number, and one special character' };
  }
  return { valid: true };
};

const validateUsername = (username) => {
  if (!username || typeof username !== 'string') {
    return { valid: false, message: 'Username is required' };
  }
  const trimmedUsername = username.trim();
  if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
    return { valid: false, message: 'Username must be between 3 and 30 characters' };
  }
  if (!/^[A-Za-z0-9 ]+$/.test(trimmedUsername)) {
    return { valid: false, message: 'Username can only contain letters, numbers, and spaces' };
  }
  return { valid: true, username: trimmedUsername };
};

const validateContactNo = (contactNo) => {
  if (!contactNo || typeof contactNo !== 'string') {
    return { valid: false, message: 'Contact number is required' };
  }
  if (!/^09\d{9}$/.test(contactNo)) {
    return { valid: false, message: 'Contact number must start with 09 and be 11 digits' };
  }
  return { valid: true };
};

// User Registration
router.post('/register', async (req, res) => {
  try {
    const { username, email, contactNo, password, confirmPassword } = req.body;

    // Validate all fields
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return res.status(400).json({
        success: false,
        message: usernameValidation.message
      });
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({
        success: false,
        message: emailValidation.message
      });
    }

    const contactValidation = validateContactNo(contactNo);
    if (!contactValidation.valid) {
      return res.status(400).json({
        success: false,
        message: contactValidation.message
      });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message
      });
    }

    if (!confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please confirm your password'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmailOrUsername(emailValidation.email, usernameValidation.username);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Create new user
    const user = await User.create({
      username: usernameValidation.username,
      email: emailValidation.email,
      contactNo,
      password,
      role: 'user'
    });

    // Generate token
    const token = generateToken(user.id, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Email or username is required'
      });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    if (password.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Password cannot be empty'
      });
    }

    // Find user by email or username
    const user = await User.findForLogin(email.trim());

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password'
      });
    }

    // Check if user has a password (should always have one, but safety check)
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password'
      });
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password'
      });
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Email or username is required'
      });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    if (password.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Password cannot be empty'
      });
    }

    // Find admin by email or username
    const admin = await User.findAdminForLogin(email.trim());

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Check if admin has a password
    if (!admin.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Check password
    const isPasswordValid = await comparePassword(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Generate token
    const token = generateToken(admin.id, admin.role);

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Admin login failed'
    });
  }
});

// Verify Token (for checking if user is still authenticated)
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
});

// Update User Profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { username, email } = req.body;
    const userId = req.user.id;

    // Validate username if provided
    if (username !== undefined) {
      const usernameValidation = validateUsername(username);
      if (!usernameValidation.valid) {
        return res.status(400).json({
          success: false,
          message: usernameValidation.message
        });
      }
    }

    // Validate email if provided
    if (email !== undefined) {
      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        return res.status(400).json({
          success: false,
          message: emailValidation.message
        });
      }
    }

    // Check if username or email is already taken by another user
    if (username || email) {
      const existingUser = await User.findByEmailOrUsername(
        email || req.user.email,
        username || req.user.username
      );

      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          success: false,
          message: 'Username or email already taken by another user'
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (username !== undefined) {
      updateData.username = username.trim();
    }
    if (email !== undefined) {
      updateData.email = email.toLowerCase().trim();
    }

    // Update user
    const updatedUser = await User.update(userId, updateData);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile'
    });
  }
});

export default router;

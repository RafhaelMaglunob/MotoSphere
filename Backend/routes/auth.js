import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import multer from 'multer';
import User, { comparePassword } from '../models/User.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';
import admin from 'firebase-admin';
import { OAuth2Client } from 'google-auth-library';
import { sendPasswordResetEmail } from '../services/emailService.js';
import { 
  generateVerificationCode, 
  sendEmailVerificationCode,
  generateOTP,
  sendSMSOTP
} from '../services/verificationService.js';
import {
  generate2FASecret,
  generateQRCode,
  verify2FAToken,
  generateBackupCodes
} from '../services/twoFactorService.js';
import { storage } from '../config/firebase.js';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// Configure Cloudinary (optional - for free profile picture storage)
// Prefer CLOUDINARY_URL; if present, parse and trim to avoid hidden whitespace
if (process.env.CLOUDINARY_URL) {
  try {
    // Parse: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
    const urlStr = process.env.CLOUDINARY_URL.trim().replace('cloudinary://', '');
    const [credentials, cloud_name] = urlStr.split('@');
    const [api_key, api_secret] = credentials.split(':');

    cloudinary.config({ 
      cloud_name: cloud_name.trim(), 
      api_key: api_key.trim(), 
      api_secret: api_secret.trim() 
    });
    console.log('✅ Cloudinary configured via CLOUDINARY_URL (free profile picture storage)');
    console.log('   Cloud Name:', cloud_name.trim());
    console.log('   API Key:', api_key.trim());
    console.log('   API Secret:', api_secret.trim().substring(0, 5) + '...' + api_secret.trim().substring(api_secret.trim().length - 5));
    console.log('   API Secret length:', api_secret.trim().length);
  } catch (err) {
    console.error('❌ Failed to parse CLOUDINARY_URL:', err.message);
  }
} else if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  // Fallback to individual credentials
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
    api_key: process.env.CLOUDINARY_API_KEY.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET.trim()
  });
  console.log('✅ Cloudinary configured (free profile picture storage)');
  console.log('   Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME.trim());
  console.log('   API Key:', process.env.CLOUDINARY_API_KEY.trim());
  console.log('   API Secret length:', process.env.CLOUDINARY_API_SECRET.trim().length);
} else {
  console.warn('⚠️  Cloudinary credentials not found in .env');
}

// Configure multer for file uploads (in-memory storage for Firebase)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Issue Firebase Custom Token for current admin (SSO -> Firebase link)
// Requires backend admin JWT (verifyAdmin)
router.post('/admin/firebase-custom-token', verifyAdmin, async (req, res) => {
  try {
    const adminUser = req.user;
    if (!adminUser || (adminUser.role || '').toString().toLowerCase() !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin privileges required' });
    }
    const uid = adminUser.id;
    const email = adminUser.email || undefined;

    // Ensure a Firebase Auth user exists for this UID (idempotent)
    try {
      await admin.auth().getUser(uid);
    } catch (e) {
      // Create user if not found (safe on unique uid)
      try {
        await admin.auth().createUser({ uid, email });
      } catch (createErr) {
        // Ignore if already exists or email conflicts; we'll still issue token for UID
        if (!String(createErr?.message || '').includes('already exists')) {
          console.warn('createUser warning:', createErr?.message || createErr);
        }
      }
    }

    // Optionally set custom claim (admin)
    try {
      await admin.auth().setCustomUserClaims(uid, { admin: true });
    } catch (claimErr) {
      // Non-blocking
      console.warn('setCustomUserClaims warning:', claimErr?.message || claimErr);
    }

    const customToken = await admin.auth().createCustomToken(uid, { admin: true });
    return res.json({ success: true, customToken });
  } catch (error) {
    console.error('Failed to issue Firebase custom token:', error);
    return res.status(500).json({ success: false, message: 'Unable to create Firebase custom token' });
  }
});

// Exchange Firebase ID token for backend admin JWT
router.post('/admin/exchange-firebase', async (req, res) => {
  try {
    const { idToken } = req.body || {};
    if (!idToken || typeof idToken !== 'string') {
      return res.status(400).json({ success: false, message: 'idToken is required' });
    }
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch (e) {
      return res.status(401).json({ success: false, message: 'Invalid Firebase token' });
    }
    const uid = decoded.uid;
    const snap = await admin.firestore().collection('users').doc(uid).get();
    if (!snap.exists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const data = snap.data() || {};
    const role = (data.role || '').toString().toLowerCase();
    if (role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin privileges required' });
    }
    // Ensure a backend user record exists
    let user = await User.findById(uid);
    if (!user) {
      user = await User.create({
        id: uid,
        username: data.username || data.name || 'Admin',
        email: data.email || '',
        role: 'admin',
        password: null
      });
    }
    const token = jwt.sign(
      { userId: uid, role: 'admin' },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    res.json({ success: true, token, user: { id: uid, email: data.email || '', role: 'admin' } });
  } catch (error) {
    console.error('Admin exchange error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to exchange token' });
  }
});

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
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  // Strong password: uppercase, lowercase, number, special character, 8+ characters
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password)) {
    return { valid: false, message: 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character' };
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
  // Accept +63 format (Philippines): +63XXXXXXXXXX (12 digits total: +63 + 9 digits)
  // Examples: +639123456789, +639876543210
  if (!/^\+63\d{9,10}$/.test(contactNo.trim())) {
    return { valid: false, message: 'Contact number must start with +63 followed by 9-10 digits (Philippines format)' };
  }
  return { valid: true };
};

// User Registration
router.post('/register', async (req, res) => {
  try {
    const { username, email, contactNo, address, password, confirmPassword, termsAccepted } = req.body;

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

    // Validate address
    if (!address || typeof address !== 'string' || address.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }

    if (address.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Address must be at least 10 characters'
      });
    }

    // Check Terms & Conditions acceptance
    if (!termsAccepted) {
      return res.status(400).json({
        success: false,
        message: 'You must accept the Terms & Conditions and Privacy Policy to register'
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
      address: address.trim(),
      password,
      role: 'user',
      termsAccepted: true,
      emailVerified: false, // Email verification required
      phoneVerified: false, // Phone verification required
      profilePicture: null,
      twoFactorEnabled: false,
      suspiciousActivity: false,
      loginAttempts: 0,
      lastLoginAt: null
    });

    // Send email verification code
    try {
      const code = generateVerificationCode();
      const expiry = new Date(Date.now() + 15 * 60 * 1000);
      await admin.firestore().collection('users').doc(user.id).update({
        emailVerificationCode: code,
        emailVerificationExpiry: admin.firestore.Timestamp.fromDate(expiry)
      });
      await sendEmailVerificationCode(emailValidation.email, code);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        emailVerified: false,
        phoneVerified: false
      },
      requiresEmailVerification: true
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Provide user-friendly error messages
    let errorMessage = error.message || 'Registration failed';
    
    // Check if it's a Firebase/database error
    if (error.message && error.message.includes('Database not initialized')) {
      errorMessage = 'Server configuration error. Please contact the administrator.';
      console.error('Firebase not configured - registration cannot proceed');
    } else if (error.message && error.message.includes('default credentials')) {
      errorMessage = 'Server configuration error. Please contact the administrator.';
      console.error('Firebase credentials error - registration cannot proceed');
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage
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
      // Track failed login attempt
      const loginAttempts = (user.loginAttempts || 0) + 1;
      const suspiciousActivity = loginAttempts >= 5;
      
      await admin.firestore().collection('users').doc(user.id).update({
        loginAttempts: loginAttempts,
        suspiciousActivity: suspiciousActivity,
        updatedAt: admin.firestore.Timestamp.now()
      });

      if (suspiciousActivity) {
        return res.status(401).json({
          success: false,
          message: 'Too many failed login attempts. Account flagged for suspicious activity. Please contact support.',
          suspiciousActivity: true
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password'
      });
    }

    // Check for suspicious activity
    if (user.suspiciousActivity) {
      return res.status(403).json({
        success: false,
        message: 'Account flagged for suspicious activity. Please contact support.',
        suspiciousActivity: true
      });
    }

    // Reset login attempts on successful login
    await admin.firestore().collection('users').doc(user.id).update({
      loginAttempts: 0,
      lastLoginAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Return a token that requires 2FA verification
      const tempToken = jwt.sign(
        { userId: user.id, role: user.role, requires2FA: true },
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        { expiresIn: '5m' } // Short expiry for 2FA step
      );

      return res.json({
        success: true,
        message: '2FA verification required',
        tempToken,
        requires2FA: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture || null
        }
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
        role: user.role,
        profilePicture: user.profilePicture || null,
        emailVerified: user.emailVerified || false,
        phoneVerified: user.phoneVerified || false,
        twoFactorEnabled: user.twoFactorEnabled || false
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
    let admin;
    try {
      admin = await User.findAdminForLogin(email.trim());
    } catch (error) {
      console.error('Error finding admin:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking admin credentials'
      });
    }

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials. Make sure your account has the "admin" role in Firebase.'
      });
    }

    // Double-check role (case-insensitive)
    const adminRole = admin.role ? admin.role.toString().trim().toLowerCase() : '';
    if (adminRole !== 'admin') {
      console.warn(`User ${admin.email} attempted admin login but role is "${admin.role}"`);
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials. Your account does not have admin privileges.'
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
        role: user.role,
        profilePicture: user.profilePicture || null
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
});

// Get All Users (Admin only)
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const users = await User.findAll(false); // Get all users except admins
    
    // Format users for the frontend table
    const formattedUsers = users.map(user => {
      // Calculate lastActive from updatedAt or createdAt
      let lastActive = 'Never';
      if (user.updatedAt) {
        const updatedTime = user.updatedAt.toDate ? user.updatedAt.toDate() : new Date(user.updatedAt);
        const now = new Date();
        const secondsAgo = Math.floor((now - updatedTime) / 1000);
        
        if (secondsAgo < 60) {
          lastActive = `${secondsAgo} sec${secondsAgo !== 1 ? "s" : ""} ago`;
        } else if (secondsAgo < 3600) {
          const mins = Math.floor(secondsAgo / 60);
          lastActive = `${mins} min${mins !== 1 ? "s" : ""} ago`;
        } else if (secondsAgo < 86400) {
          const hours = Math.floor(secondsAgo / 3600);
          lastActive = `${hours} hour${hours !== 1 ? "s" : ""} ago`;
        } else {
          const days = Math.floor(secondsAgo / 86400);
          lastActive = `${days} day${days !== 1 ? "s" : ""} ago`;
        }
      } else if (user.createdAt) {
        const createdTime = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
        const now = new Date();
        const secondsAgo = Math.floor((now - createdTime) / 1000);
        
        if (secondsAgo < 60) {
          lastActive = `${secondsAgo} sec${secondsAgo !== 1 ? "s" : ""} ago`;
        } else if (secondsAgo < 3600) {
          const mins = Math.floor(secondsAgo / 60);
          lastActive = `${mins} min${mins !== 1 ? "s" : ""} ago`;
        } else if (secondsAgo < 86400) {
          const hours = Math.floor(secondsAgo / 3600);
          lastActive = `${hours} hour${hours !== 1 ? "s" : ""} ago`;
        } else {
          const days = Math.floor(secondsAgo / 86400);
          lastActive = `${days} day${days !== 1 ? "s" : ""} ago`;
        }
      }
      
      return {
        id: user.id,
        name: user.username || 'Unknown',
        email: user.email || '',
        status: 'Active', // Default status, can be enhanced later
        lastActive: lastActive
      };
    });
    
    res.json({
      success: true,
      users: formattedUsers
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch users'
    });
  }
});

// Get User Profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
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
        contactNo: user.contactNo || '',
        role: user.role,
        profilePicture: user.profilePicture || null,
        emailVerified: user.emailVerified || false,
        phoneVerified: user.phoneVerified || false,
        twoFactorEnabled: user.twoFactorEnabled || false,
        deviceId: user.deviceId || user.deviceID || null
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch profile'
    });
  }
});

// Update User Profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { username, email, contactNo } = req.body;
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
    if (req.body.deviceId !== undefined || req.body.deviceID !== undefined) {
      // Support both deviceId and deviceID for consistency
      updateData.deviceId = (req.body.deviceId || req.body.deviceID || '').trim();
      updateData.deviceID = updateData.deviceId; // Store both formats for compatibility
    }

    if (contactNo !== undefined) {
      const normalized = String(contactNo || '').trim();
      if (!/^\+639\d{9}$/.test(normalized)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number. Use +639XXXXXXXXX format'
        });
      }
      const changed = (req.user.contactNo || '') !== normalized;
      updateData.contactNo = normalized;
      if (changed) {
        updateData.phoneVerified = false;
        updateData.phoneOTPCode = admin.firestore.FieldValue.delete();
        updateData.phoneOTPExpiry = admin.firestore.FieldValue.delete();
      }
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
        contactNo: updatedUser.contactNo || '',
        role: updatedUser.role,
        profilePicture: updatedUser.profilePicture || null,
        emailVerified: updatedUser.emailVerified || false,
        phoneVerified: updatedUser.phoneVerified || false,
        twoFactorEnabled: updatedUser.twoFactorEnabled || false,
        deviceId: updatedUser.deviceId || updatedUser.deviceID || null
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

// Delete User (Admin only)
router.delete('/users/:userId', verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    // Delete user
    await User.delete(userId);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete user'
    });
  }
});

// Update User (Admin only)
router.put('/users/:userId', verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, status } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prepare update data
    const updateData = {};
    if (name !== undefined) {
      const usernameValidation = validateUsername(name);
      if (!usernameValidation.valid) {
        return res.status(400).json({
          success: false,
          message: usernameValidation.message
        });
      }
      updateData.username = usernameValidation.username;
    }

    if (email !== undefined) {
      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        return res.status(400).json({
          success: false,
          message: emailValidation.message
        });
      }
      updateData.email = emailValidation.email;
    }

    // Check if username or email is already taken by another user
    if (updateData.username || updateData.email) {
      const existingUser = await User.findByEmailOrUsername(
        updateData.email || user.email,
        updateData.username || user.username
      );

      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          success: false,
          message: 'Username or email already taken by another user'
        });
      }
    }

    // Update user
    const updatedUser = await User.update(userId, updateData);

    // Format response similar to getAllUsers
    let lastActive = 'Never';
    if (updatedUser.updatedAt) {
      const updatedTime = updatedUser.updatedAt.toDate ? updatedUser.updatedAt.toDate() : new Date(updatedUser.updatedAt);
      const now = new Date();
      const secondsAgo = Math.floor((now - updatedTime) / 1000);
      
      if (secondsAgo < 60) {
        lastActive = `${secondsAgo} sec${secondsAgo !== 1 ? "s" : ""} ago`;
      } else if (secondsAgo < 3600) {
        const mins = Math.floor(secondsAgo / 60);
        lastActive = `${mins} min${mins !== 1 ? "s" : ""} ago`;
      } else if (secondsAgo < 86400) {
        const hours = Math.floor(secondsAgo / 3600);
        lastActive = `${hours} hour${hours !== 1 ? "s" : ""} ago`;
      } else {
        const days = Math.floor(secondsAgo / 86400);
        lastActive = `${days} day${days !== 1 ? "s" : ""} ago`;
      }
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.username || 'Unknown',
        email: updatedUser.email || '',
        status: status || 'Active',
        lastActive: lastActive
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update user'
    });
  }
});

// Get User Contacts
router.get('/contacts', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const contacts = user.contacts || [];
    
    res.json({
      success: true,
      contacts: contacts
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch contacts'
    });
  }
});

// Add Contact
router.post('/contacts', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, relation, contactNo, email } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Contact name is required'
      });
    }

    if (!relation || !relation.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Contact relation is required'
      });
    }

    if (!contactNo || !contactNo.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Contact number is required'
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Contact email is required'
      });
    }

    // Get current user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check contact limit (max 5)
    const currentContacts = user.contacts || [];
    if (currentContacts.length >= 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum of 5 contacts allowed. Please delete a contact before adding a new one.'
      });
    }

    // Create new contact
    const newContact = {
      id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      relation: relation.trim(),
      contactNo: contactNo.trim(),
      email: email.trim().toLowerCase(),
      createdAt: admin.firestore.Timestamp.now()
    };

    // Add contact to user's contacts array
    const updatedContacts = [...currentContacts, newContact];
    await User.update(userId, { contacts: updatedContacts });

    res.json({
      success: true,
      message: 'Contact added successfully',
      contact: newContact
    });
  } catch (error) {
    console.error('Add contact error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add contact'
    });
  }
});

// Update Contact
router.put('/contacts/:contactId', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { contactId } = req.params;
    const { name, relation, contactNo, email } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Contact name is required'
      });
    }

    if (!relation || !relation.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Contact relation is required'
      });
    }

    if (!contactNo || !contactNo.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Contact number is required'
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Contact email is required'
      });
    }

    // Get current user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const contacts = user.contacts || [];
    const contactIndex = contacts.findIndex(c => c.id === contactId);

    if (contactIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Update contact
    const updatedContacts = [...contacts];
    updatedContacts[contactIndex] = {
      ...updatedContacts[contactIndex],
      name: name.trim(),
      relation: relation.trim(),
      contactNo: contactNo.trim(),
      email: email.trim().toLowerCase(),
      updatedAt: admin.firestore.Timestamp.now()
    };

    await User.update(userId, { contacts: updatedContacts });

    res.json({
      success: true,
      message: 'Contact updated successfully',
      contact: updatedContacts[contactIndex]
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update contact'
    });
  }
});

// Delete Contact
router.delete('/contacts/:contactId', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { contactId } = req.params;

    // Get current user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const contacts = user.contacts || [];
    const contactIndex = contacts.findIndex(c => c.id === contactId);

    if (contactIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Remove contact
    const updatedContacts = contacts.filter(c => c.id !== contactId);
    await User.update(userId, { contacts: updatedContacts });

    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete contact'
    });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({
        success: false,
        message: emailValidation.message
      });
    }

    // Find user by email
    const user = await User.findByEmailOrUsername(emailValidation.email, null);

    // For security, always return success message even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, password reset instructions have been sent.'
      });
    }

    // Check if user has a password (OAuth users might not have one)
    if (!user.password) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, password reset instructions have been sent.'
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Save reset token to database
    await User.saveResetToken(user.id, resetToken);

    // Create reset URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    // Send password reset email
    let emailSent = true;
    let devHint = undefined;
    try {
      await sendPasswordResetEmail(emailValidation.email, resetToken, resetUrl);
      console.log(`Password reset email sent to: ${emailValidation.email}`);
    } catch (emailError) {
      emailSent = false;
      console.error('Failed to send password reset email:', emailError);
      // Provide a developer hint in non-production to ease local testing
      if ((process.env.NODE_ENV || 'development') !== 'production') {
        devHint = resetUrl;
      }
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, password reset instructions have been sent.',
      // Expose a dev-only reset link when email fails to send
      devResetUrl: devHint
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: 'If an account with that email exists, password reset instructions have been sent.'
    });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    // Validation
    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Reset token is required'
      });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    if (!confirmPassword || typeof confirmPassword !== 'string') {
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

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message
      });
    }

    // Find user by reset token
    const user = await User.findByResetToken(token);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token. Please request a new password reset.'
      });
    }

    // Update password
    await User.update(user.id, { password });

    // Clear reset token
    await User.clearResetToken(user.id);

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reset password'
    });
  }
});

// Google OAuth Login
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken || typeof idToken !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Google ID token is required'
      });
    }

    // Verify Google ID token
    // Create OAuth2Client without using default credentials
    const client = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID
    });
    
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });
    } catch (error) {
      console.error('Google token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid Google token'
      });
    }

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email not provided by Google'
      });
    }

    // Validate email format (must match your email validation rules)
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Email from Google does not meet requirements. Must be gmail.com, yahoo.com, or hotmail.com'
      });
    }

    // Create or find user
    const user = await User.createOrFindOAuthUser({
      email: emailValidation.email,
      name: name || email.split('@')[0],
      googleId,
      picture
    });

    // Generate JWT token
    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      message: 'Google login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture || user.picture || null,
        emailVerified: user.emailVerified || false,
        phoneVerified: user.phoneVerified || false,
        twoFactorEnabled: user.twoFactorEnabled || false
      }
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Google authentication failed'
    });
  }
});

// ===================== EMAIL VERIFICATION =====================

// Send email verification code
router.post('/send-email-verification', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate verification code
    const code = generateVerificationCode();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save code to user
    await admin.firestore().collection('users').doc(userId).update({
      emailVerificationCode: code,
      emailVerificationExpiry: admin.firestore.Timestamp.fromDate(expiry),
      updatedAt: admin.firestore.Timestamp.now()
    });

    // Send email
    try {
      await sendEmailVerificationCode(user.email, code);
      res.json({
        success: true,
        message: 'Verification code sent to your email'
      });
    } catch (error) {
      console.error('Failed to send verification email:', error);
      console.error('Error details:', error.message);
      
      // Return the actual error message to help with debugging
      const errorMessage = error.message || 'Failed to send verification email';
      res.status(500).json({
        success: false,
        message: errorMessage + '. Code saved: ' + code + ' (for development)',
        devCode: code // Include code in response for development
      });
    }
  } catch (error) {
    console.error('Send email verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send verification code'
    });
  }
});

// Verify email code
router.post('/verify-email', verifyToken, async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Verification code is required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Check code
    if (!user.emailVerificationCode || user.emailVerificationCode !== code) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Check expiry
    if (user.emailVerificationExpiry) {
      const expiryDate = user.emailVerificationExpiry.toDate ? 
        user.emailVerificationExpiry.toDate() : 
        new Date(user.emailVerificationExpiry);
      
      if (expiryDate < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Verification code has expired'
        });
      }
    }

    // Verify email
    await admin.firestore().collection('users').doc(userId).update({
      emailVerified: true,
      emailVerificationCode: admin.firestore.FieldValue.delete(),
      emailVerificationExpiry: admin.firestore.FieldValue.delete(),
      updatedAt: admin.firestore.Timestamp.now()
    });

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify email'
    });
  }
});

// ===================== PHONE VERIFICATION =====================

// Send phone OTP
router.post('/send-phone-otp', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.contactNo) {
      return res.status(400).json({
        success: false,
        message: 'Phone number not found'
      });
    }

    if (user.phoneVerified) {
      return res.status(400).json({
        success: false,
        message: 'Phone is already verified'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to user
    await admin.firestore().collection('users').doc(userId).update({
      phoneOTPCode: otp,
      phoneOTPExpiry: admin.firestore.Timestamp.fromDate(expiry),
      updatedAt: admin.firestore.Timestamp.now()
    });

    // Send SMS (or return OTP in dev mode)
    // Ensure phone number has +63 format
    let phoneNumber = user.contactNo.trim();
    if (!phoneNumber.startsWith('+63')) {
      // If starts with 09, convert to +63
      if (phoneNumber.startsWith('09')) {
        phoneNumber = `+63${phoneNumber.substring(1)}`;
      } else {
        // If doesn't start with +63 or 09, add +63
        phoneNumber = `+63${phoneNumber.replace(/^\+63/, '')}`;
      }
    }
    const result = await sendSMSOTP(phoneNumber, otp);

    res.json({
      success: true,
      message: 'OTP sent to your phone',
      devOtp: result.devOtp || undefined // Only in dev mode
    });
  } catch (error) {
    console.error('Send phone OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send OTP'
    });
  }
});

// Verify phone OTP
router.post('/verify-phone', verifyToken, async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user.id;

    if (!otp || typeof otp !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'OTP is required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.phoneVerified) {
      return res.status(400).json({
        success: false,
        message: 'Phone is already verified'
      });
    }

    // Check OTP
    if (!user.phoneOTPCode || user.phoneOTPCode !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Check expiry
    if (user.phoneOTPExpiry) {
      const expiryDate = user.phoneOTPExpiry.toDate ? 
        user.phoneOTPExpiry.toDate() : 
        new Date(user.phoneOTPExpiry);
      
      if (expiryDate < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'OTP has expired'
        });
      }
    }

    // Verify phone
    await admin.firestore().collection('users').doc(userId).update({
      phoneVerified: true,
      phoneOTPCode: admin.firestore.FieldValue.delete(),
      phoneOTPExpiry: admin.firestore.FieldValue.delete(),
      updatedAt: admin.firestore.Timestamp.now()
    });

    res.json({
      success: true,
      message: 'Phone verified successfully'
    });
  } catch (error) {
    console.error('Verify phone error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify phone'
    });
  }
});

// ===================== PROFILE PICTURE =====================

// Upload profile picture
router.post('/upload-profile-picture', verifyToken, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const userId = req.user.id;
    const file = req.file;
    let publicUrl;

    // Get current user to check for existing profile picture
    const user = await User.findById(userId);
    const oldProfilePicture = user?.profilePicture;

    // Try Cloudinary first (free, no credit card needed)
    if (process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)) {
      try {
        console.log('Uploading to Cloudinary...');

        // Delete old profile picture from Cloudinary if exists
        if (oldProfilePicture && oldProfilePicture.includes('cloudinary.com')) {
          try {
            // Extract public_id from Cloudinary URL
            // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/motosphere/profile-pictures/userId-timestamp.jpg
            const urlParts = oldProfilePicture.split('/');
            const uploadIndex = urlParts.findIndex(part => part === 'upload');
            if (uploadIndex >= 0 && urlParts[uploadIndex + 2]) {
              const publicIdWithVersion = urlParts.slice(uploadIndex + 2).join('/');
              const publicId = publicIdWithVersion.replace(/^v\d+\//, '').replace(/\.[^/.]+$/, '');
              await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
              console.log('✅ Deleted old profile picture from Cloudinary:', publicId);
            }
          } catch (deleteError) {
            console.warn('⚠️ Could not delete old profile picture:', deleteError.message);
          }
        }

        // Convert buffer to base64 data URI for Cloudinary
        const base64Image = file.buffer.toString('base64');
        const dataUri = `data:${file.mimetype};base64,${base64Image}`;

        // Upload to Cloudinary - try without signature first (use unsigned if possible)
        // Note: For unsigned uploads, you need to create an upload preset in Cloudinary dashboard
        // Settings > Upload > Upload presets > Add upload preset (name: motosphere_profile_pictures, signing mode: Unsigned)
        let uploadResult;
        try {
          // Try unsigned upload (no signature required - needs upload preset)
          uploadResult = await cloudinary.uploader.upload(dataUri, {
            public_id: `motosphere/profile-pictures/${userId}-${Date.now()}`,
            unsigned: true,
            upload_preset: 'motosphere_profile_pictures'
          });
          console.log('✅ Uploaded using unsigned preset');
        } catch (unsignedError) {
          // Fallback to signed upload (current method)
          console.log('⚠️  Unsigned upload failed, trying signed upload...');
          uploadResult = await cloudinary.uploader.upload(dataUri, {
            public_id: `motosphere/profile-pictures/${userId}-${Date.now()}`,
            resource_type: 'image'
          });
        }

        // Apply transformations via URL (does not affect signature)
        publicUrl = cloudinary.url(uploadResult.public_id, {
          transformation: [
            { width: 500, height: 500, crop: 'fill', gravity: 'face' },
            { quality: 'auto:good' }
          ],
          secure: true
        });
        console.log('✅ Image uploaded to Cloudinary:', publicUrl);

        // Update user profile picture
        await admin.firestore().collection('users').doc(userId).update({
          profilePicture: publicUrl,
          updatedAt: admin.firestore.Timestamp.now()
        });

        return res.json({
          success: true,
          message: 'Profile picture uploaded successfully',
          profilePicture: publicUrl
        });
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({
          success: false,
          message: `Failed to upload profile picture (Cloudinary): ${error.message || 'Unknown error'}`
        });
      }
    }

    // Fallback to Firebase Storage (if Cloudinary not configured)
    uploadToFirebaseStorage();

    async function uploadToFirebaseStorage() {
      try {
        // Get bucket name - try environment variable first, then default based on project
        const bucketName = process.env.FIREBASE_STORAGE_BUCKET || 'motospherebsit3b.firebasestorage.app';
        
        if (!storage) {
          console.error('Firebase Storage not initialized and Cloudinary not configured');
          return res.status(500).json({
            success: false,
            message: 'No storage configured. Please set up Cloudinary (free, no credit card) or Firebase Storage. See FREE_STORAGE_ALTERNATIVE.md for instructions.'
          });
        }
        
        let bucket;
        try {
          bucket = storage.bucket(bucketName);
          await bucket.getMetadata();
        } catch (metaError) {
          console.log(`Trying alternative bucket format...`);
          const altBucketName = bucketName.includes('.firebasestorage.app') 
            ? bucketName.replace('.firebasestorage.app', '.appspot.com')
            : bucketName.replace('.appspot.com', '.firebasestorage.app');
          bucket = storage.bucket(altBucketName);
          await bucket.getMetadata();
          console.log(`Using bucket: ${altBucketName}`);
        }
        
        const fileName = `profile-pictures/${userId}-${Date.now()}-${file.originalname}`;
        const fileUpload = bucket.file(fileName);

        let responseSent = false;

        const stream = fileUpload.createWriteStream({
          metadata: {
            contentType: file.mimetype,
            metadata: {
              userId: userId
            }
          }
        });

        stream.on('error', (error) => {
          console.error('Error uploading file to Firebase Storage:', error);
          if (!responseSent) {
            responseSent = true;
            res.status(500).json({
              success: false,
              message: `Failed to upload profile picture: ${error.message || 'Unknown error'}`
            });
          }
        });

        stream.on('finish', async () => {
          try {
            await fileUpload.makePublic();
            publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

            await admin.firestore().collection('users').doc(userId).update({
              profilePicture: publicUrl,
              updatedAt: admin.firestore.Timestamp.now()
            });

            if (!responseSent) {
              responseSent = true;
              res.json({
                success: true,
                message: 'Profile picture uploaded successfully',
                profilePicture: publicUrl
              });
            }
          } catch (error) {
            console.error('Error updating user profile after upload:', error);
            if (!responseSent) {
              responseSent = true;
              res.status(500).json({
                success: false,
                message: `Failed to update profile picture: ${error.message || 'Unknown error'}`
              });
            }
          }
        });

        stream.end(file.buffer);
      } catch (error) {
        console.error('Firebase Storage upload error:', error);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: `Failed to upload profile picture: ${error.message || 'Unknown error. Please check console for details.'}`
          });
        }
      }
    }
  } catch (error) {
    console.error('Upload profile picture error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: `Failed to upload profile picture: ${error.message || 'Unknown error. Please check console for details.'}`
      });
    }
  }
});

// Delete profile picture
router.delete('/profile-picture', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current user to find profile picture URL
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const profilePictureUrl = user.profilePicture;

    if (!profilePictureUrl) {
      return res.status(400).json({
        success: false,
        message: 'No profile picture to delete'
      });
    }

    // Delete from Cloudinary if it's a Cloudinary URL
    if (profilePictureUrl.includes('cloudinary.com') && 
        process.env.CLOUDINARY_CLOUD_NAME && 
        process.env.CLOUDINARY_API_KEY && 
        process.env.CLOUDINARY_API_SECRET) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = profilePictureUrl.split('/');
        const uploadIndex = urlParts.findIndex(part => part === 'upload');
        if (uploadIndex >= 0 && urlParts[uploadIndex + 2]) {
          // Get everything after 'upload/v1234567890/'
          const publicIdWithVersion = urlParts.slice(uploadIndex + 2).join('/');
          // Remove version prefix and file extension
          const publicId = publicIdWithVersion.replace(/^v\d+\//, '').replace(/\.[^/.]+$/, '');
          
          await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
          console.log('✅ Deleted profile picture from Cloudinary:', publicId);
        }
      } catch (deleteError) {
        console.warn('⚠️ Could not delete profile picture from Cloudinary:', deleteError.message);
        // Continue with database update even if Cloudinary deletion fails
      }
    }

    // Remove profile picture from user document
    await admin.firestore().collection('users').doc(userId).update({
      profilePicture: null,
      updatedAt: admin.firestore.Timestamp.now()
    });

    res.json({
      success: true,
      message: 'Profile picture deleted successfully'
    });
  } catch (error) {
    console.error('Delete profile picture error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete profile picture'
    });
  }
});

// ===================== TWO-FACTOR AUTHENTICATION =====================

// Generate 2FA secret and QR code
router.post('/2fa/generate', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is already enabled'
      });
    }

    // Generate secret
    const secretData = generate2FASecret(user.username || user.email, user.email);
    const qrCode = await generateQRCode(secretData.otpauth_url);
    const backupCodes = generateBackupCodes();

    // Save secret and backup codes (but don't enable yet)
    await admin.firestore().collection('users').doc(userId).update({
      twoFactorSecret: secretData.secret,
      twoFactorBackupCodes: backupCodes,
      updatedAt: admin.firestore.Timestamp.now()
    });

    res.json({
      success: true,
      secret: secretData.secret,
      qrCode: qrCode,
      backupCodes: backupCodes,
      message: 'Scan the QR code with your authenticator app, then verify to enable 2FA'
    });
  } catch (error) {
    console.error('Generate 2FA error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate 2FA secret'
    });
  }
});

// Verify and enable 2FA
router.post('/2fa/verify-enable', verifyToken, async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        message: '2FA token is required'
      });
    }

    const user = await User.findById(userId);
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: '2FA secret not found. Please generate a new secret first'
      });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is already enabled'
      });
    }

    // Verify token
    const isValid = verify2FAToken(token, user.twoFactorSecret);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid 2FA token'
      });
    }

    // Enable 2FA
    await admin.firestore().collection('users').doc(userId).update({
      twoFactorEnabled: true,
      updatedAt: admin.firestore.Timestamp.now()
    });

    res.json({
      success: true,
      message: '2FA enabled successfully',
      backupCodes: user.twoFactorBackupCodes || []
    });
  } catch (error) {
    console.error('Verify enable 2FA error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to enable 2FA'
    });
  }
});

// Disable 2FA
router.post('/2fa/disable', verifyToken, async (req, res) => {
  try {
    const { token, password } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is not enabled'
      });
    }

    // Verify password or 2FA token
    let verified = false;
    if (password && user.password) {
      verified = await comparePassword(password, user.password);
    }
    
    if (!verified && token && user.twoFactorSecret) {
      verified = verify2FAToken(token, user.twoFactorSecret);
    }

    if (!verified) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password or 2FA token'
      });
    }

    // Disable 2FA
    await admin.firestore().collection('users').doc(userId).update({
      twoFactorEnabled: false,
      twoFactorSecret: admin.firestore.FieldValue.delete(),
      twoFactorBackupCodes: admin.firestore.FieldValue.delete(),
      updatedAt: admin.firestore.Timestamp.now()
    });

    res.json({
      success: true,
      message: '2FA disabled successfully'
    });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to disable 2FA'
    });
  }
});

// Verify 2FA token during login
router.post('/2fa/verify-login', async (req, res) => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      return res.status(400).json({
        success: false,
        message: 'User ID and 2FA token are required'
      });
    }

    const user = await User.findById(userId);
    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is not enabled for this user'
      });
    }

    if (!user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: '2FA secret not found'
      });
    }

    // Check backup codes first
    if (user.twoFactorBackupCodes && user.twoFactorBackupCodes.includes(token)) {
      // Remove used backup code
      const updatedBackupCodes = user.twoFactorBackupCodes.filter(code => code !== token);
      await admin.firestore().collection('users').doc(userId).update({
        twoFactorBackupCodes: updatedBackupCodes,
        updatedAt: admin.firestore.Timestamp.now()
      });

      res.json({
        success: true,
        message: '2FA verified successfully (backup code used)'
      });
      return;
    }

    // Verify TOTP token
    const isValid = verify2FAToken(token, user.twoFactorSecret);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid 2FA token'
      });
    }

    res.json({
      success: true,
      message: '2FA verified successfully'
    });
  } catch (error) {
    console.error('Verify login 2FA error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify 2FA token'
    });
  }
});

export default router;

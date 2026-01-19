import express from 'express';
import jwt from 'jsonwebtoken';
import User, { comparePassword } from '../models/User.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';
import admin from 'firebase-admin';
import { OAuth2Client } from 'google-auth-library';

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

    // In a production environment, you would:
    // 1. Generate a secure reset token
    // 2. Store it in the database with an expiration time
    // 3. Send an email with a reset link containing the token
    // 4. Create a reset password endpoint that validates the token

    // For now, we'll just return a success message
    // TODO: Implement email sending and token generation
    console.log(`Password reset requested for email: ${emailValidation.email}`);

    res.json({
      success: true,
      message: 'If an account with that email exists, password reset instructions have been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process password reset request'
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
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
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
        picture: user.picture || null
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

export default router;

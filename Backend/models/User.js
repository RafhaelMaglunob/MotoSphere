import bcryptjs from 'bcryptjs';
import { db } from '../config/firebase.js';

const USERS_COLLECTION = 'users';

// User validation functions
export const validateUser = (userData) => {
  const errors = [];

  if (!userData.username || userData.username.trim().length < 3 || userData.username.trim().length > 30) {
    errors.push('Username must be between 3 and 30 characters');
  }

  if (!userData.email || !/^[A-Za-z0-9_]+@(gmail\.com|yahoo\.com|hotmail\.com)$/.test(userData.email)) {
    errors.push('Invalid email format');
  }

  if (!userData.contactNo || !/^09\d{9}$/.test(userData.contactNo)) {
    errors.push('Contact number must start with 09 and be 11 digits');
  }

  if (!userData.password || userData.password.length < 8 || userData.password.length > 15) {
    errors.push('Password must be between 8 and 15 characters');
  }

  if (userData.password && !/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,15}$/.test(userData.password)) {
    errors.push('Password must include uppercase, number, and symbol');
  }

  return errors;
};

// Hash password
export const hashPassword = async (password) => {
  const salt = await bcryptjs.genSalt(10);
  return await bcryptjs.hash(password, salt);
};

// Compare password
export const comparePassword = async (candidatePassword, hashedPassword) => {
  return await bcryptjs.compare(candidatePassword, hashedPassword);
};

// User model functions
export const User = {
  // Create a new user
  async create(userData) {
    const validationErrors = validateUser(userData);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join(', '));
    }

    // Check if user already exists
    const existingUser = await this.findByEmailOrUsername(userData.email, userData.username);
    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create user document
    const userDoc = {
      username: userData.username.trim(),
      email: userData.email.toLowerCase().trim(),
      contactNo: userData.contactNo,
      password: hashedPassword,
      role: userData.role || 'user',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    };

    const docRef = await db.collection(USERS_COLLECTION).add(userDoc);
    
    return {
      id: docRef.id,
      ...userDoc,
      password: undefined // Don't return password
    };
  },

  // Find user by ID
  async findById(userId) {
    const doc = await db.collection(USERS_COLLECTION).doc(userId).get();
    
    if (!doc.exists) {
      return null;
    }

    const userData = doc.data();
    return {
      id: doc.id,
      ...userData,
      password: undefined // Don't return password
    };
  },

  // Find user by email or username
  async findByEmailOrUsername(email, username) {
    const emailQuery = await db.collection(USERS_COLLECTION)
      .where('email', '==', email.toLowerCase().trim())
      .limit(1)
      .get();

    if (!emailQuery.empty) {
      const doc = emailQuery.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    }

    const usernameQuery = await db.collection(USERS_COLLECTION)
      .where('username', '==', username.trim())
      .limit(1)
      .get();

    if (!usernameQuery.empty) {
      const doc = usernameQuery.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    }

    return null;
  },

  // Find user by email or username (for login)
  async findForLogin(emailOrUsername) {
    const email = emailOrUsername.toLowerCase().trim();
    const username = emailOrUsername.trim();

    // Try email first
    const emailQuery = await db.collection(USERS_COLLECTION)
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!emailQuery.empty) {
      const doc = emailQuery.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    }

    // Try username
    const usernameQuery = await db.collection(USERS_COLLECTION)
      .where('username', '==', username)
      .limit(1)
      .get();

    if (!usernameQuery.empty) {
      const doc = usernameQuery.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    }

    return null;
  },

  // Find admin by email or username
  async findAdminForLogin(emailOrUsername) {
    const email = emailOrUsername.toLowerCase().trim();
    const username = emailOrUsername.trim();

    // Try email first
    const emailQuery = await db.collection(USERS_COLLECTION)
      .where('email', '==', email)
      .where('role', '==', 'admin')
      .limit(1)
      .get();

    if (!emailQuery.empty) {
      const doc = emailQuery.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    }

    // Try username
    const usernameQuery = await db.collection(USERS_COLLECTION)
      .where('username', '==', username)
      .where('role', '==', 'admin')
      .limit(1)
      .get();

    if (!usernameQuery.empty) {
      const doc = usernameQuery.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    }

    return null;
  },

  // Update user
  async update(userId, updateData) {
    const updateDoc = {
      ...updateData,
      updatedAt: admin.firestore.Timestamp.now()
    };

    // If password is being updated, hash it
    if (updateDoc.password) {
      updateDoc.password = await hashPassword(updateDoc.password);
    }

    await db.collection(USERS_COLLECTION).doc(userId).update(updateDoc);
    return await this.findById(userId);
  },

  // Delete user
  async delete(userId) {
    await db.collection(USERS_COLLECTION).doc(userId).delete();
  }
};

import admin from 'firebase-admin';

export default User;

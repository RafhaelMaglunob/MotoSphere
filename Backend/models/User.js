import bcryptjs from 'bcryptjs';
import { db } from '../config/firebase.js';
import admin from 'firebase-admin';

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
    if (!db) {
      throw new Error('Database not initialized. Please configure Firebase credentials in your .env file.');
    }

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
    if (!db) {
      throw new Error('Database not initialized. Please configure Firebase credentials in your .env file.');
    }

    try {
      if (email) {
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
      }

      if (username) {
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
      }

      return null;
    } catch (error) {
      console.error('Error in findByEmailOrUsername:', error);
      // Check if it's a credentials error
      if (error.message && error.message.includes('default credentials')) {
        throw new Error('Database authentication error. Please check Firebase credentials in your .env file.');
      }
      throw error;
    }
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
    if (!db) {
      throw new Error('Database not initialized. Please configure Firebase credentials in your .env file.');
    }

    const email = emailOrUsername.toLowerCase().trim();
    const username = emailOrUsername.trim();

    try {
      // Try email first
      const emailQuery = await db.collection(USERS_COLLECTION)
        .where('email', '==', email)
        .limit(1)
        .get();

      if (!emailQuery.empty) {
        const doc = emailQuery.docs[0];
        const userData = doc.data();
        
        // Check if role is admin (case-insensitive and trimmed)
        const userRole = userData.role ? userData.role.toString().trim().toLowerCase() : '';
        if (userRole === 'admin') {
          return {
            id: doc.id,
            ...userData
          };
        }
      }

      // Try username
      const usernameQuery = await db.collection(USERS_COLLECTION)
        .where('username', '==', username)
        .limit(1)
        .get();

      if (!usernameQuery.empty) {
        const doc = usernameQuery.docs[0];
        const userData = doc.data();
        
        // Check if role is admin (case-insensitive and trimmed)
        const userRole = userData.role ? userData.role.toString().trim().toLowerCase() : '';
        if (userRole === 'admin') {
          return {
            id: doc.id,
            ...userData
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error in findAdminForLogin:', error);
      throw error;
    }
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
  },

  // Get all users (excluding admins by default, or all if includeAdmins is true)
  async findAll(includeAdmins = false) {
    const snapshot = await db.collection(USERS_COLLECTION).get();
    
    return snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          password: undefined // Don't return password
        };
      })
      .filter(user => includeAdmins || user.role !== 'admin');
  },

  // Create or find OAuth user (for Google SSO)
  async createOrFindOAuthUser(oauthData) {
    if (!db) {
      throw new Error('Database not initialized. Please configure Firebase credentials in your .env file.');
    }

    const { email, name, googleId, picture } = oauthData;
    
    // Check if user exists by email
    let existingUser;
    try {
      existingUser = await this.findByEmailOrUsername(email, null);
    } catch (error) {
      console.error('Error finding existing user for OAuth:', error);
      throw error;
    }
    
    if (existingUser) {
      // Update user with Google ID if not already set
      if (!existingUser.googleId && googleId) {
        await db.collection(USERS_COLLECTION).doc(existingUser.id).update({
          googleId,
          updatedAt: admin.firestore.Timestamp.now()
        });
      }
      return {
        id: existingUser.id,
        ...existingUser,
        password: undefined
      };
    }

    // Create new OAuth user
    // Generate username from name or email
    const username = name 
      ? name.trim().substring(0, 30).replace(/[^A-Za-z0-9 ]/g, '') || email.split('@')[0].substring(0, 30)
      : email.split('@')[0].substring(0, 30);
    
    // Ensure username is unique
    let finalUsername = username;
    let counter = 1;
    while (await this.findByEmailOrUsername(null, finalUsername)) {
      finalUsername = `${username}${counter}`.substring(0, 30);
      counter++;
    }

    const userDoc = {
      username: finalUsername,
      email: email.toLowerCase().trim(),
      googleId,
      picture: picture || null,
      role: 'user',
      authProvider: 'google', // Track auth provider
      // Note: password is optional for OAuth users
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    };

    const docRef = await db.collection(USERS_COLLECTION).add(userDoc);

    return {
      id: docRef.id,
      ...userDoc,
      password: undefined
    };
  },

  // Save password reset token
  async saveResetToken(userId, resetToken) {
    if (!db) {
      throw new Error('Database not initialized');
    }

    // Token expires in 1 hour
    const expiresAt = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
    );

    await db.collection(USERS_COLLECTION).doc(userId).update({
      resetToken,
      resetTokenExpires: expiresAt,
      updatedAt: admin.firestore.Timestamp.now()
    });
  },

  // Find user by reset token
  async findByResetToken(token) {
    if (!db) {
      throw new Error('Database not initialized');
    }

    const query = await db.collection(USERS_COLLECTION)
      .where('resetToken', '==', token)
      .limit(1)
      .get();

    if (query.empty) {
      return null;
    }

    const doc = query.docs[0];
    const userData = doc.data();

    // Check if token has expired
    if (userData.resetTokenExpires) {
      const expiresAt = userData.resetTokenExpires.toDate ? 
        userData.resetTokenExpires.toDate() : 
        new Date(userData.resetTokenExpires);
      
      if (expiresAt < new Date()) {
        // Token expired, remove it
        const deleteData = {
          resetToken: admin.firestore.FieldValue.delete(),
          resetTokenExpires: admin.firestore.FieldValue.delete()
        };
        await db.collection(USERS_COLLECTION).doc(doc.id).update(deleteData);
        return null;
      }
    }

    return {
      id: doc.id,
      ...userData,
      password: undefined
    };
  },

  // Clear reset token after successful password reset
  async clearResetToken(userId) {
    if (!db) {
      throw new Error('Database not initialized');
    }

    await db.collection(USERS_COLLECTION).doc(userId).update({
      resetToken: admin.firestore.FieldValue.delete(),
      resetTokenExpires: admin.firestore.FieldValue.delete(),
      updatedAt: admin.firestore.Timestamp.now()
    });
  }
};

export default User;

// Utility function to create an admin user in Firebase Authentication
// Run this once in the browser console or create a temporary page to use it

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

/**
 * Creates an admin user in Firebase Authentication and Firestore
 * @param {string} email - Admin email address
 * @param {string} password - Admin password (min 6 characters)
 * @param {object} additionalData - Additional user data (name, etc.)
 * @returns {Promise<object>} User creation result
 */
export const createAdminUser = async (email, password, additionalData = {}) => {
  try {
    console.log('Creating admin user:', email);
    
    // Step 1: Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('✅ User created in Firebase Auth. UID:', user.uid);

    // Step 2: Create/Update user document in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      email: email,
      role: 'admin',
      createdAt: new Date(),
      ...additionalData
    }, { merge: true });
    
    console.log('✅ User document created in Firestore');
    console.log('✅ Admin user created successfully!');
    
    return {
      success: true,
      uid: user.uid,
      email: user.email
    };
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered. User might already exist in Firebase Auth.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Use at least 6 characters.');
    } else {
      throw new Error(`Failed to create admin user: ${error.message}`);
    }
  }
};

// Example usage (uncomment and run in browser console):
// import { createAdminUser } from './createAdminUser';
// createAdminUser('admin@motosphere.com', 'yourPassword123', { name: 'Admin User' })
//   .then(result => console.log('Success:', result))
//   .catch(error => console.error('Error:', error));

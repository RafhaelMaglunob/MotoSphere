import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin SDK
let firebaseApp;
let initialized = false;

const initializeFirebase = () => {
  if (initialized) {
    return admin.app();
  }

  try {
    // Check if Firebase is already initialized
    if (admin.apps.length === 0) {
      // Option 1: Use service account key file (base64 encoded)
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        const serviceAccount = JSON.parse(
          Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString('utf-8')
        );
        
        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: process.env.FIREBASE_DATABASE_URL
        });
      }
      // Option 2: Use service account file path
      else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH.startsWith('/')
          ? process.env.FIREBASE_SERVICE_ACCOUNT_PATH
          : join(__dirname, '..', process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
        
        const serviceAccount = JSON.parse(
          readFileSync(serviceAccountPath, 'utf8')
        );
        
        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: process.env.FIREBASE_DATABASE_URL
        });
      }
      // Option 3: Use environment variables directly
      else if (process.env.FIREBASE_PROJECT_ID) {
        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
          databaseURL: process.env.FIREBASE_DATABASE_URL
        });
      }
      // Option 4: Use default credentials (for Firebase emulator or GCP)
      else {
        console.warn('⚠️  No Firebase credentials found. Attempting to use default credentials...');
        try {
          firebaseApp = admin.initializeApp({
            projectId: process.env.FIREBASE_PROJECT_ID || 'motosphere'
          });
        } catch (defaultError) {
          console.error('❌ Could not initialize Firebase with default credentials.');
          console.error('Please configure Firebase credentials in your .env file.');
          console.error('See Backend/README.md for setup instructions.');
          // Don't throw - allow the app to continue, but Firebase operations will fail
          // This prevents the entire server from crashing
          initialized = false;
          return null;
        }
      }
      
      if (firebaseApp) {
        console.log('✅ Firebase Admin initialized');
        initialized = true;
      }
    } else {
      firebaseApp = admin.app();
      initialized = true;
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    console.error('⚠️  Firebase operations will not work until credentials are configured.');
    // Don't throw - allow the app to continue
    initialized = false;
    return null;
  }

  return firebaseApp;
};

// Initialize Firebase immediately
firebaseApp = initializeFirebase();

// Get Firestore instance (with error handling)
let db;
let auth;
try {
  if (firebaseApp) {
    // Get Firestore and Auth - they automatically use the initialized app's credentials
    db = admin.firestore();
    auth = admin.auth();
    
    // Verify credentials are working by checking the app
    if (!firebaseApp.options.credential) {
      console.warn('⚠️  Firebase app initialized without explicit credentials');
    }
  } else {
    console.warn('⚠️  Firestore and Auth instances not available - Firebase not initialized');
  }
} catch (error) {
  console.error('❌ Error creating Firestore/Auth instances:', error.message);
}

export { db, auth };

export default firebaseApp;

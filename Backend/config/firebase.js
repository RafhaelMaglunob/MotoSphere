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
        firebaseApp = admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID || 'motosphere'
        });
      }
      
      console.log('✅ Firebase Admin initialized');
      initialized = true;
    } else {
      firebaseApp = admin.app();
      initialized = true;
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    throw error;
  }

  return firebaseApp;
};

// Initialize Firebase immediately
firebaseApp = initializeFirebase();

// Get Firestore instance
export const db = admin.firestore();

// Get Auth instance (if needed for Firebase Auth)
export const auth = admin.auth();

export default firebaseApp;

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// ============================================
// FIREBASE CONFIGURATION
// ============================================
// Replace the placeholder values below with your actual Firebase project config
// 
// HOW TO GET YOUR FIREBASE CONFIG:
// 1. Go to: https://console.firebase.google.com/
// 2. Select your project (or create a new one)
// 3. Click the gear icon ⚙️ (top left) > Project Settings
// 4. Scroll down to "Your apps" section
// 5. If you don't have a web app yet, click "Add app" > Web icon (</>)
// 6. Register your app (give it a nickname like "MotoSphere Web")
// 7. Copy the firebaseConfig object values below
//
// EXAMPLE of what it should look like:
// const firebaseConfig = {
//   apiKey: "AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz",
//   authDomain: "motosphere-12345.firebaseapp.com",
//   projectId: "motosphere-12345",
//   storageBucket: "motosphere-12345.appspot.com",
//   messagingSenderId: "123456789012",
//   appId: "1:123456789012:web:abcdef1234567890"
// };
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyDllJ3djkebxHZxHlcp6w54goiDMsXiaS8",
  authDomain: "motospherebsit3b.firebaseapp.com",
  projectId: "motospherebsit3b",
  storageBucket: "motospherebsit3b.firebasestorage.app",
  messagingSenderId: "242798297710",
  appId: "1:242798297710:web:d3fc87b62527d1deb95c7f",
  measurementId: "G-C0E2L3VX3V"
};

// Validate Firebase configuration
const isConfigValid = () => {
  const hasPlaceholders = 
    firebaseConfig.apiKey === "YOUR_API_KEY" ||
    firebaseConfig.authDomain === "YOUR_AUTH_DOMAIN" ||
    firebaseConfig.projectId === "YOUR_PROJECT_ID" ||
    firebaseConfig.storageBucket === "YOUR_STORAGE_BUCKET" ||
    firebaseConfig.messagingSenderId === "YOUR_MESSAGING_SENDER_ID" ||
    firebaseConfig.appId === "YOUR_APP_ID";
  
  return !hasPlaceholders && 
    firebaseConfig.apiKey && 
    firebaseConfig.authDomain && 
    firebaseConfig.projectId;
};

// Show helpful error if config is not set up
if (!isConfigValid()) {
  const errorMsg = `
    ⚠️ FIREBASE CONFIGURATION REQUIRED ⚠️
    
    Please add your Firebase credentials to:
    📁 Frontend/src/admin/firebase.js
    
    📋 Quick Steps:
    1. Open https://console.firebase.google.com/
    2. Select your project
    3. Click ⚙️ > Project Settings
    4. Scroll to "Your apps" > Click Web icon (</>)
    5. Copy the config values
    6. Replace placeholders in firebase.js
    
    The config should look like:
    {
      apiKey: "AIzaSyC...",
      authDomain: "your-project.firebaseapp.com",
      projectId: "your-project-id",
      ...
    }
  `;
  console.error(errorMsg);
}

// Initialize Firebase
let app;
let db;
let auth;

// Check if Firebase app already exists (prevents re-initialization)
try {
  if (!isConfigValid()) {
    console.error('⚠️ Firebase configuration contains placeholders. Please update firebase.js with your actual Firebase config.');
  }
  
  // Try to get existing app first
  try {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      app = existingApps[0];
      console.log('✅ Using existing Firebase app');
    } else {
      app = initializeApp(firebaseConfig);
      console.log('✅ Firebase app initialized');
    }
  } catch (initError) {
    // If app doesn't exist, initialize it
    if (initError.code === 'app/no-app') {
      app = initializeApp(firebaseConfig);
      console.log('✅ Firebase app initialized');
    } else {
      throw initError;
    }
  }
  
  // Initialize Firestore and Auth
  db = getFirestore(app);
  auth = getAuth(app);
  
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  console.error('Error details:', {
    code: error.code,
    message: error.message
  });
  
  if (error.message?.includes('api-key-not-valid') || 
      error.message?.includes('YOUR_API_KEY') ||
      error.message?.includes('configuration not set')) {
    console.error(`
      🔴 FIREBASE SETUP REQUIRED 🔴
      
      Your Firebase configuration is missing or invalid.
      
      📍 File location: Frontend/src/admin/firebase.js
      
      🔗 Get your config from:
      https://console.firebase.google.com/
      → Your Project → ⚙️ Settings → Project Settings
      → Scroll to "Your apps" → Web app config
      
      Copy all 6 values and replace the placeholders!
    `);
  }
  
  // Set to null so we can check in components
  app = null;
  db = null;
  auth = null;
}

// Ensure exports are never undefined (will be null if initialization failed)
export { db, auth };
export default app;

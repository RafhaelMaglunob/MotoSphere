# Complete Step-by-Step Setup Guide - MotoSphere

This is a comprehensive guide to set up all features in MotoSphere from scratch. Everything is **FREE** to set up!

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Firebase Setup](#firebase-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Email Verification Setup](#email-verification-setup)
6. [Phone OTP Setup (Optional)](#phone-otp-setup-optional)
7. [Testing All Features](#testing-all-features)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

1. **Node.js** (v16 or higher)
   - Download: https://nodejs.org/
   - Verify: Open terminal and run `node --version`

2. **npm** (comes with Node.js)
   - Verify: Run `npm --version`

3. **Git** (optional, for version control)
   - Download: https://git-scm.com/

### Required Accounts (All FREE)

1. **Firebase Account** (Google account)
   - Go to: https://firebase.google.com/
   - Sign in with Google account

2. **Gmail Account** (for email verification)
   - Any Gmail account works

3. **Twilio Account** (optional, for SMS)
   - Sign up: https://www.twilio.com/
   - Free trial with $15.50 credit

---

## Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `motospherebsit3b` (or your preferred name)
4. Click **Continue**
5. **Disable Google Analytics** (optional, to keep it simpler) or enable it
6. Click **Create project**
7. Wait for project creation (30 seconds)
8. Click **Continue**

### Step 2: Enable Firestore Database

1. In Firebase Console, click **Firestore Database** in the left sidebar
2. Click **Create database**
3. Select **Start in test mode** (for development)
   - Or **Production mode** if you want stricter rules
4. Choose a location closest to you (e.g., `asia-southeast1` for Philippines)
5. Click **Enable**
6. Wait for database creation

### Step 3: Enable Firebase Storage

1. In Firebase Console, click **Storage** in the left sidebar
2. Click **Get started**
3. Choose **Start in test mode** (for development)
4. Select the same location as Firestore
5. Click **Done**

### Step 4: Get Firebase Service Account Key

1. In Firebase Console, click the **gear icon** ⚙️ (top left)
2. Click **Project settings**
3. Go to **Service accounts** tab
4. Click **Generate new private key**
5. Click **Generate key** in the confirmation dialog
6. A JSON file will download (e.g., `motospherebsit3b-firebase-adminsdk-fbsvc-xxxxx.json`)
7. **Save this file** in your `Backend` folder
8. Remember the filename (you'll need it later)

### Step 5: Get Storage Bucket Name

1. Still in Firebase Console
2. Click **Storage** in the left sidebar
3. At the top, you'll see a URL like:
   - `gs://motospherebsit3b.firebasestorage.app`
   - OR `gs://motospherebsit3b.appspot.com`
4. **Copy the bucket name** (the part after `gs://`)
   - Example: `motospherebsit3b.firebasestorage.app`
   - You'll need this for your `.env` file

### Step 6: Set Up Storage Rules

1. In Firebase Console, go to **Storage** → **Rules**
2. Replace the rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload profile pictures
    match /profile-pictures/{userId}-{timestamp}-{fileName} {
      allow read: if true; // Public read access
      allow write: if request.auth != null; // Authenticated users can write
    }
    
    // Allow authenticated users to read/write their own files
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

3. Click **Publish**

---

## Backend Setup

### Step 1: Navigate to Backend Folder

```bash
cd Backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- `express` - Web server
- `firebase-admin` - Firebase Admin SDK
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT tokens
- `nodemailer` - Email sending
- `speakeasy` - 2FA/TOTP
- `qrcode` - QR code generation
- `twilio` - SMS OTP (optional)
- `multer` - File uploads
- `google-auth-library` - Google OAuth

### Step 3: Create .env File

1. In the `Backend` folder, create a file named `.env`
2. Add the following content:

```env
# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_PATH=./motospherebsit3b-firebase-adminsdk-fbsvc-03a94f1aa2.json
FIREBASE_DATABASE_URL=https://motospherebsit3b-default-rtdb.firebaseio.com
FIREBASE_STORAGE_BUCKET=motospherebsit3b.firebasestorage.app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Gmail Configuration (for email verification)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password

# Google OAuth (optional - for SSO)
GOOGLE_CLIENT_ID=your-google-client-id-here

# Twilio Configuration (optional - for SMS OTP)
# Leave these empty to use dev mode (free, OTP shown in console)
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
# TWILIO_PHONE_NUMBER=
```

### Step 4: Update .env File with Your Values

**A. Firebase Service Account Path:**
- Replace with the actual filename of your downloaded JSON file
- Example: `./motospherebsit3b-firebase-adminsdk-fbsvc-03a94f1aa2.json`

**B. Firebase Database URL:**
- Get this from Firebase Console → Project Settings → General
- Look for "Realtime Database URL" or use: `https://your-project-id-default-rtdb.firebaseio.com`

**C. Firebase Storage Bucket:**
- Use the bucket name from Step 5 of Firebase Setup
- Example: `motospherebsit3b.firebasestorage.app`

**D. JWT Secret:**
- Generate a random string (keep it secret!)
- You can use: `openssl rand -base64 32` (if you have OpenSSL)
- Or just use a long random string like: `my-super-secret-jwt-key-2024`

**E. Gmail Configuration:**
- Will configure in next section

**F. Google OAuth (Optional):**
- Will configure later if needed

**G. Twilio (Optional):**
- Leave empty for dev mode (free, OTP in console)

### Step 5: Test Backend Server

```bash
npm start
```

You should see:
```
✅ Firebase Admin initialized
🚀 Server is running on port 5000
```

If you see errors, check:
- Firebase service account JSON file exists in Backend folder
- `.env` file has correct paths
- All dependencies installed (`npm install`)

Press `Ctrl+C` to stop the server.

---

## Frontend Setup

### Step 1: Navigate to Frontend Folder

```bash
cd ../Frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including React, React Router, Tailwind CSS, etc.

### Step 3: Create .env File (Optional)

If you need to customize the API URL:

1. Create a file named `.env` in the `Frontend` folder
2. Add:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

**Note:** If you don't create this file, it will use default values:
- API URL: `http://localhost:5000/api`
- Google Client ID: Not set (Google Sign-In won't work)

### Step 4: Test Frontend

```bash
npm run dev
```

You should see:
```
VITE vX.X.X  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

Open http://localhost:5173/ in your browser to see the app.

Press `Ctrl+C` to stop the dev server.

---

## Email Verification Setup

### Step 1: Enable 2-Step Verification on Gmail

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Scroll down to "How you sign in to Google"
3. Click **2-Step Verification**
4. If not enabled, click **Get started** and follow the prompts
5. Complete the setup (you'll need your phone)

### Step 2: Generate App Password

1. Still on [Google Account Security](https://myaccount.google.com/security)
2. Scroll down to "2-Step Verification" section
3. Click **App passwords** (below 2-Step Verification)
4. If you don't see it, make sure 2-Step Verification is enabled first
5. Select app: **Mail**
6. Select device: **Other (Custom name)**
7. Type: **MotoSphere**
8. Click **Generate**
9. **Copy the 16-character password** that appears
   - Example: `abcd efgh ijkl mnop`
   - **Important:** Copy it now - you can't see it again!

### Step 3: Add to Backend/.env

1. Open `Backend/.env` file
2. Update these lines:

```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

**Important:**
- Use your **full Gmail address** for `GMAIL_USER`
- Remove **spaces** from the app password
- Example: `GMAIL_APP_PASSWORD=abcdefghijklmnop` (no spaces)

### Step 4: Test Email Sending

1. Start your backend server:
   ```bash
   cd Backend
   npm start
   ```

2. Test by registering a new account - you should receive an email with verification code

**Note:** If email doesn't send, check:
- App password is correct (no spaces)
- Gmail address is correct
- 2-Step Verification is enabled
- Check backend console for errors

---

## Phone OTP Setup (Optional)

You have two options:

### Option A: Dev Mode (FREE - Recommended for Testing)

**No setup needed!** The system automatically uses dev mode if Twilio is not configured.

**How it works:**
- OTP codes appear in backend console
- OTP codes also returned in API response
- Perfect for development and testing

**To use:**
- Just leave Twilio fields empty in `.env` file

### Option B: Twilio SMS (FREE Trial - For Production)

1. **Sign up for Twilio:**
   - Go to: https://www.twilio.com/try-twilio
   - Create a free account
   - Verify your email and phone

2. **Get Account SID and Auth Token:**
   - After signing up, you'll see your Account SID
   - Click to reveal your Auth Token
   - Copy both

3. **Get a Phone Number:**
   - In Twilio Console, go to **Phone Numbers** → **Manage** → **Buy a number**
   - Choose a country (Philippines: +63)
   - Click **Search** and choose a number
   - Click **Buy**

4. **Add to Backend/.env:**

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+639123456789
```

5. **Restart Backend:**

```bash
cd Backend
npm start
```

**Note:** Twilio free trial includes $15.50 credit - enough for ~1,500 SMS messages!

---

## Complete Setup Checklist

### ✅ Firebase Setup
- [ ] Firebase project created
- [ ] Firestore Database enabled
- [ ] Storage enabled
- [ ] Service account key downloaded
- [ ] Storage bucket name noted
- [ ] Storage rules configured

### ✅ Backend Setup
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created
- [ ] Firebase service account path set
- [ ] Storage bucket name set
- [ ] JWT secret set
- [ ] Server starts without errors

### ✅ Email Setup
- [ ] Gmail account ready
- [ ] 2-Step Verification enabled
- [ ] App Password generated
- [ ] Gmail credentials added to `.env`

### ✅ Frontend Setup
- [ ] Dependencies installed (`npm install`)
- [ ] Frontend runs (`npm run dev`)

### ✅ Optional Setup
- [ ] Twilio configured (optional)
- [ ] Google OAuth configured (optional)

---

## Testing All Features

### Step 1: Start Backend Server

```bash
cd Backend
npm start
```

You should see:
```
✅ Firebase Admin initialized
🚀 Server is running on port 5000
```

### Step 2: Start Frontend Server

Open a **new terminal window**:

```bash
cd Frontend
npm run dev
```

You should see:
```
VITE vX.X.X  ready in XXX ms
➜  Local:   http://localhost:5173/
```

### Step 3: Test Registration

1. Open http://localhost:5173/register in browser
2. Fill in the registration form:
   - Username
   - Email (must be gmail.com, yahoo.com, or hotmail.com)
   - Contact No. (format: 09XXXXXXXXX - 11 digits)
   - Address
   - Password (8-15 chars, uppercase, number, special char)
   - Confirm Password
   - ✅ Check "I accept Terms & Conditions"
3. Click **Register**
4. Check your email for verification code (or check backend console if Gmail not configured)

### Step 4: Test Email Verification

1. After registration, you should be redirected to `/verify-email`
2. Check your email inbox for the 6-digit code
3. Enter the code
4. Click **Verify Email**
5. You should see success message

**If email not received:**
- Check backend console for the code (if Gmail not configured)
- Check spam folder
- Verify Gmail credentials in `.env`

### Step 5: Test Phone Verification

1. Go to Settings → Verify Phone
2. Or go to `/verify-phone`
3. OTP should be sent automatically
4. **Check backend console** for OTP code (if Twilio not configured)
5. Enter the 6-digit OTP
6. Click **Verify Phone**

### Step 6: Test Profile Picture Upload

1. Go to Settings
2. Click **Choose Image** under Profile Picture
3. Select an image file (JPG, PNG, GIF - max 5MB)
4. Image preview should appear
5. Click **Upload**
6. You should see success message
7. Profile picture should appear

**If upload fails:**
- Check backend console for errors
- Verify Firebase Storage is enabled
- Check `FIREBASE_STORAGE_BUCKET` in `.env`
- Check Storage rules in Firebase Console

### Step 7: Test Two-Factor Authentication (2FA)

1. Go to Settings → Security Settings
2. Click **Enable 2FA**
3. Wait for QR code to generate
4. Open an authenticator app on your phone:
   - Google Authenticator
   - Authy
   - Microsoft Authenticator
5. Scan the QR code with the app
6. Enter the 6-digit code from your app
7. Click **Verify & Enable 2FA**
8. You should see success message with backup codes
9. **Save the backup codes** in a safe place!

**To test 2FA login:**
1. Log out
2. Log back in with your credentials
3. After password, you'll be prompted for 2FA code
4. Enter code from authenticator app
5. You should be logged in

### Step 8: Test Terms & Conditions and Privacy Policy

1. Go to http://localhost:5173/terms
2. You should see the full Terms and Conditions page
3. Go to http://localhost:5173/privacy
4. You should see the full Privacy Policy page

---

## Troubleshooting

### Backend Won't Start

**Error: "Firebase not initialized"**
- ✅ Check Firebase service account JSON file exists
- ✅ Verify path in `.env` is correct
- ✅ Make sure JSON file is in Backend folder

**Error: "Cannot find module"**
- ✅ Run `npm install` in Backend folder
- ✅ Make sure all dependencies are installed

**Error: "Port 5000 already in use"**
- ✅ Close other programs using port 5000
- ✅ Or change port in `server.js`

### Frontend Won't Start

**Error: "Cannot find module"**
- ✅ Run `npm install` in Frontend folder
- ✅ Make sure all dependencies are installed

**Error: "Port 5173 already in use"**
- ✅ Close other programs using port 5173
- ✅ Vite will automatically use next available port

### Email Not Sending

**Check:**
- ✅ Gmail App Password is correct (no spaces)
- ✅ Gmail address is correct
- ✅ 2-Step Verification is enabled
- ✅ Check backend console for errors

**Solution:**
- Check backend console - code will be logged if email fails
- Verify Gmail credentials in `.env`

### Phone OTP Not Working

**If using Dev Mode:**
- ✅ Check backend console for OTP code
- ✅ OTP also appears in API response

**If using Twilio:**
- ✅ Verify Twilio credentials in `.env`
- ✅ Check Twilio dashboard for delivery status
- ✅ Verify phone number format (+63 for Philippines)

### Profile Picture Upload Fails

**Check:**
- ✅ Firebase Storage is enabled
- ✅ `FIREBASE_STORAGE_BUCKET` is set in `.env`
- ✅ Storage rules allow authenticated writes
- ✅ Check backend console for specific error

**Common Errors:**
- "Bucket not found" → Check bucket name in `.env`
- "Permission denied" → Update Storage rules in Firebase Console
- "File too large" → Use image under 5MB

### 2FA Not Working

**Check:**
- ✅ Speakeasy package is installed (`npm install speakeasy`)
- ✅ QR code is generated correctly
- ✅ Authenticator app clock is synced
- ✅ Code is entered within time window (30-60 seconds)

**Solution:**
- Use backup codes if app codes don't work
- Make sure to save backup codes when enabling 2FA

---

## Quick Start Commands

### Start Everything

**Terminal 1 (Backend):**
```bash
cd Backend
npm start
```

**Terminal 2 (Frontend):**
```bash
cd Frontend
npm run dev
```

### Access URLs

- **Frontend:** http://localhost:5173/
- **Backend API:** http://localhost:5000/api
- **Terms & Conditions:** http://localhost:5173/terms
- **Privacy Policy:** http://localhost:5173/privacy

---

## Summary

### What's FREE:
✅ Firebase Storage (5 GB free)  
✅ Firebase Firestore (1 GB free)  
✅ Gmail (unlimited emails)  
✅ Phone OTP Dev Mode (free)  
✅ 2FA (completely free)  

### What You Need to Set Up:
1. ✅ Enable Firebase Storage (one-time)
2. ✅ Add bucket name to `.env`
3. ✅ Configure Gmail (optional - for email verification)
4. ✅ Restart backend server

### Time Required:
- Firebase Setup: **10 minutes**
- Backend Setup: **5 minutes**
- Frontend Setup: **5 minutes**
- Email Setup: **5 minutes**
- **Total: ~25 minutes**

Everything is free and ready to use! 🎉

---

## Need Help?

Check these guides:
- `GMAIL_SETUP.md` - Detailed Gmail setup
- `STORAGE_TROUBLESHOOTING.md` - Storage issues
- `FREE_SETUP_GUIDE.md` - Free tier information
- `SETUP_GUIDE.md` - General setup guide

---

**You're all set! Start both servers and test all the features!** 🚀

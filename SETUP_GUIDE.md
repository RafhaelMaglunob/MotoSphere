# MotoSphere Complete Setup Guide

This guide will help you set up all the security features and verification systems in MotoSphere.

## 📋 Prerequisites

- Node.js and npm installed
- Firebase project set up
- Gmail account (for email verification)
- Twilio account (optional, for SMS OTP - has dev mode fallback)

## 🔧 Backend Setup

### 1. Install Dependencies

Make sure all packages are installed:

```bash
cd Backend
npm install
```

The following packages should be installed:
- `speakeasy` - For 2FA/TOTP
- `qrcode` - For QR code generation
- `twilio` - For SMS OTP (optional)
- `multer` - For file uploads

### 2. Configure Environment Variables

Create or update `Backend/.env` file with the following:

```env
# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_PATH=./path/to/serviceAccountKey.json
# OR use base64 encoded key:
# FIREBASE_SERVICE_ACCOUNT_KEY=base64_encoded_key_here
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com

# JWT Configuration
JWT_SECRET=your-secure-random-secret-key-here
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Gmail Configuration (for email verification)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password

# Google OAuth (optional - for SSO)
GOOGLE_CLIENT_ID=your-google-client-id

# Twilio Configuration (optional - for SMS OTP)
# If not configured, the system will use dev mode (OTP shown in console)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### 3. Gmail Setup (Email Verification)

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled
3. Go to **App passwords** section
4. Create a new app password:
   - Select **Mail** as the app
   - Select **Other (Custom name)** as the device
   - Enter "MotoSphere" as the name
   - Copy the 16-character password
5. Add to `.env`:
   ```env
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
   ```
   (Remove spaces from the app password)

📖 **Detailed Guide:** See `GMAIL_SETUP.md` for more details.

### 4. Twilio Setup (Phone OTP - Optional)

If you want SMS OTP verification:

1. Sign up at [Twilio](https://www.twilio.com/)
2. Get your Account SID and Auth Token from the dashboard
3. Get a phone number from Twilio
4. Add to `.env`:
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   ```

**Note:** If Twilio is not configured, the system will work in **dev mode** - OTP codes will be logged to the console and returned in the API response.

### 5. Firebase Storage Setup (Profile Pictures)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Storage** in the left sidebar
4. Click **Get Started** if Storage is not enabled
5. Set up security rules:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /profile-pictures/{userId}-{timestamp}-{filename} {
         allow read: if true; // Public read access
         allow write: if request.auth != null; // Only authenticated users can write
       }
     }
   }
   ```
6. Your Firebase service account should already have Storage access if configured correctly.

### 6. Start Backend Server

```bash
cd Backend
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## 🎨 Frontend Setup

### 1. Install Dependencies

```bash
cd Frontend
npm install
```

### 2. Configure Environment Variables

Create or update `Frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

### 3. Start Frontend

```bash
cd Frontend
npm run dev
```

## ✅ Feature Checklist

### ✅ Ready to Use (No Additional Setup)

- ✅ **Email Verification** - Works if Gmail is configured
- ✅ **Password Strength** - Already implemented (8-15 chars, uppercase, number, special char)
- ✅ **Terms & Conditions** - Checkbox in registration
- ✅ **Address Field** - Added to registration
- ✅ **Fraud Detection** - Login attempt tracking (automatic)

### ⚙️ Needs Configuration

- ⚙️ **Phone OTP Verification** - Configure Twilio (or use dev mode)
- ⚙️ **Profile Picture Upload** - Requires Firebase Storage setup
- ⚙️ **2FA (Two-Factor Authentication)** - Ready to use once backend is running

### 🔒 How Features Work

#### Email Verification
1. User registers → Verification email sent automatically
2. User enters 6-digit code from email
3. Email is verified

#### Phone Verification
1. User goes to Settings or `/verify-phone`
2. OTP sent to phone (via SMS if Twilio configured, or shown in console in dev mode)
3. User enters 6-digit OTP
4. Phone is verified

#### Profile Picture Upload
1. User goes to Settings
2. Clicks "Choose Image"
3. Selects image (max 5MB)
4. Clicks "Upload"
5. Image uploaded to Firebase Storage
6. Profile picture URL saved

#### Two-Factor Authentication (2FA)
1. User goes to Settings → Security Settings
2. Clicks "Enable 2FA"
3. Scans QR code with authenticator app (Google Authenticator, Authy, etc.)
4. Enters verification code from app
5. 2FA is enabled
6. Backup codes are shown (save these!)
7. On login, user will need to enter 2FA code after password

#### Fraud Detection
- Automatically tracks failed login attempts
- After 5 failed attempts, account is flagged
- Flagged accounts cannot login (contact support message shown)
- Reset on successful login

## 🧪 Testing

### Test Email Verification
1. Register a new account
2. Check email for verification code
3. Go to `/verify-email` or Settings → Verify Email
4. Enter code and verify

### Test Phone Verification
1. Go to `/verify-phone` or Settings → Verify Phone
2. Enter phone number (if not set)
3. Check SMS or console for OTP (dev mode)
4. Enter OTP and verify

### Test Profile Picture Upload
1. Go to Settings
2. Click "Choose Image" under Profile Picture
3. Select an image file
4. Click "Upload"
5. Verify image appears

### Test 2FA
1. Go to Settings → Security Settings
2. Click "Enable 2FA"
3. Scan QR code with authenticator app
4. Enter verification code
5. Verify 2FA is enabled
6. Log out and log back in
7. After entering password, you'll be prompted for 2FA code

## 🐛 Troubleshooting

### Email Verification Not Working
- Check Gmail credentials in `.env`
- Verify 2-Step Verification is enabled
- Use App Password, not regular password
- Check backend console for errors

### Phone OTP Not Received
- If Twilio not configured, check console/API response for OTP (dev mode)
- If Twilio configured, check Twilio dashboard for delivery status
- Verify phone number format (+63 for Philippines)

### Profile Picture Upload Fails
- Check Firebase Storage is enabled
- Verify Firebase Storage rules allow writes
- Check file size (max 5MB)
- Verify image format (JPG, PNG, GIF)

### 2FA Not Working
- Verify speakeasy package is installed
- Check QR code is generated correctly
- Ensure authenticator app clock is synced
- Try backup codes if app codes don't work

### Fraud Detection Issues
- Login attempts are tracked automatically
- Failed attempts reset on successful login
- Flagged accounts show "suspicious activity" message
- To unflag: Update `suspiciousActivity` field in Firestore manually

## 📝 Notes

- **Dev Mode**: If Twilio is not configured, phone OTP will work in dev mode (codes shown in console)
- **Email Verification**: Required after registration but can be done later
- **Phone Verification**: Optional but recommended for security
- **2FA**: Highly recommended for admin accounts
- **Profile Pictures**: Stored in Firebase Storage, publicly accessible
- **Terms & Conditions**: Users must accept during registration

## 🚀 Production Deployment

Before deploying to production:

1. Update `FRONTEND_URL` in backend `.env` to production URL
2. Use secure `JWT_SECRET` (generate with `openssl rand -base64 32`)
3. Configure production Firebase credentials
4. Set up production Twilio account (if using SMS)
5. Update Firebase Storage security rules for production
6. Enable HTTPS for all communications
7. Set up proper CORS configuration
8. Configure rate limiting for API endpoints

## 📚 Additional Resources

- [Gmail Setup Guide](./GMAIL_SETUP.md)
- [Google OAuth Setup](./GOOGLE_OAUTH_SETUP.md)
- [Backend README](./Backend/README.md)

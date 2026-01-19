# Google OAuth Single Sign-On Setup Guide

This guide will help you set up Google OAuth for Single Sign-On (SSO) in MotoSphere.

## Prerequisites

- A Google account
- Access to Google Cloud Console
- Your application running locally or deployed

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "MotoSphere")
5. Click "Create"

### 2. Enable Google+ API

1. In the Google Cloud Console, navigate to **APIs & Services** > **Library**
2. Search for "Google+ API" or "Google Identity Services"
3. Click on it and click **Enable**

### 3. Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - Choose "External" (unless you have a Google Workspace)
   - Fill in the required information:
     - App name: MotoSphere
     - User support email: Your email
     - Developer contact: Your email
   - Click "Save and Continue"
   - Add scopes: `email`, `profile`, `openid`
   - Add test users (for development)
   - Click "Save and Continue"
4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: MotoSphere Web Client
   - Authorized JavaScript origins:
     - `http://localhost:5173` (Vite default port)
     - `http://localhost:3000` (if using different port)
     - Your production URL (e.g., `https://yourdomain.com`)
   - Authorized redirect URIs:
     - `http://localhost:5173`
     - `http://localhost:3000`
     - Your production URL
   - Click **Create**
5. **Copy the Client ID** - you'll need this for both frontend and backend

### 4. Configure Environment Variables

#### Backend Configuration

Add to `Backend/.env`:
```env
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

#### Frontend Configuration

Create or update `Frontend/.env` or `Frontend/.env.local`:
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

**Important**: The Client ID should be the same for both frontend and backend.

### 5. Restart Your Servers

After adding the environment variables:

1. Restart the backend server:
   ```bash
   cd Backend
   npm start
   # or for development
   npm run dev
   ```

2. Restart the frontend server:
   ```bash
   cd Frontend
   npm run dev
   ```

### 6. Test Google Sign-In

1. Navigate to your login page
2. You should see a "Sign in with Google" button
3. Click it and complete the Google authentication flow
4. You should be redirected to the appropriate dashboard after successful authentication

## Troubleshooting

### Google Sign-In Button Not Appearing

- Check that `VITE_GOOGLE_CLIENT_ID` is set in your frontend `.env` file
- Verify the Google Identity Services script is loading (check browser console)
- Make sure you've restarted the frontend server after adding the environment variable

### "Invalid Google token" Error

- Verify `GOOGLE_CLIENT_ID` is set correctly in backend `.env`
- Ensure the Client ID matches between frontend and backend
- Check that the OAuth consent screen is properly configured

### Email Validation Error

- Google OAuth users must have emails ending with `gmail.com`, `yahoo.com`, or `hotmail.com`
- This matches your application's email validation rules

### CORS Errors

- Make sure your frontend URL is added to "Authorized JavaScript origins" in Google Cloud Console
- Verify `FRONTEND_URL` in backend `.env` matches your frontend URL

## Production Deployment

When deploying to production:

1. Update the OAuth consent screen to "Published" status
2. Add your production URLs to:
   - Authorized JavaScript origins
   - Authorized redirect URIs
3. Update environment variables in your production environment
4. Ensure HTTPS is used in production (required by Google OAuth)

## Security Notes

- Never commit `.env` files to version control
- Keep your Client ID secure (though it's safe to expose in frontend code)
- Regularly review OAuth credentials in Google Cloud Console
- Monitor for any suspicious activity

## Additional Resources

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

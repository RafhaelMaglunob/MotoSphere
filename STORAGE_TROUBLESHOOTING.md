# Firebase Storage Troubleshooting Guide

## Issue: "Failed to upload profile picture"

### Common Causes and Solutions

#### 1. Firebase Storage Not Enabled

**Symptom:** Error message about bucket not found or not accessible

**Solution:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `motospherebsit3b`
3. Click **Storage** in the left sidebar
4. Click **Get Started** if you see "Storage isn't set up"
5. Choose a location for your storage bucket
6. Select **Start in test mode** or **Start in production mode**
7. Click **Done**

#### 2. Incorrect Bucket Name

**Symptom:** "Bucket name not specified or invalid"

**Solution:**
1. Check your Firebase Console → Storage → Files
2. Look at the bucket URL at the top (e.g., `gs://motospherebsit3b.firebasestorage.app`)
3. The bucket name is the part after `gs://` (e.g., `motospherebsit3b.firebasestorage.app`)

4. Add to `Backend/.env`:
   ```env
   FIREBASE_STORAGE_BUCKET=motospherebsit3b.firebasestorage.app
   ```

5. Restart your backend server:
   ```bash
   npm start
   ```

#### 3. Storage Rules Not Configured

**Symptom:** "Permission denied" errors

**Solution:**
1. Go to Firebase Console → Storage → Rules
2. Update the rules to:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       // Allow authenticated users to write profile pictures
       match /profile-pictures/{userId}-{timestamp}-{fileName} {
         allow read: if true; // Public read access
         allow write: if request.auth != null; // Authenticated users can write
       }
       
       // Allow authenticated users to read their own profile pictures
       match /{allPaths=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```
3. Click **Publish**

#### 4. Service Account Permissions

**Symptom:** "Permission denied" or "Unauthorized" errors

**Solution:**
1. Ensure your Firebase service account has Storage Admin permissions
2. Go to [Google Cloud Console](https://console.cloud.google.com/)
3. Select your project
4. Go to **IAM & Admin** → **IAM**
5. Find your service account (e.g., `firebase-adminsdk-fbsvc@motospherebsit3b.iam.gserviceaccount.com`)
6. Ensure it has **Storage Admin** or **Storage Object Admin** role
7. If not, click **Edit** and add the role

#### 5. Check Backend Console for Errors

When uploading, check the backend console for specific error messages:

```bash
cd Backend
npm start
```

Look for errors like:
- `Bucket name not specified` → Add `FIREBASE_STORAGE_BUCKET` to `.env`
- `Permission denied` → Check Storage rules and service account permissions
- `Bucket not found` → Ensure Storage is enabled in Firebase Console

### Quick Fix Steps

1. **Enable Firebase Storage:**
   - Firebase Console → Storage → Get Started

2. **Get Bucket Name:**
   - Firebase Console → Storage → Files
   - Look at the bucket URL (format: `gs://project-id.firebasestorage.app` or `gs://project-id.appspot.com`)

3. **Add to .env:**
   ```env
   FIREBASE_STORAGE_BUCKET=motospherebsit3b.firebasestorage.app
   ```

4. **Update Storage Rules:**
   - Firebase Console → Storage → Rules
   - Use the rules provided above

5. **Restart Backend:**
   ```bash
   cd Backend
   npm start
   ```

6. **Test Upload:**
   - Go to Settings in your app
   - Try uploading a profile picture
   - Check backend console for any errors

### Verification

After setup, verify:
1. ✅ Firebase Storage is enabled in Firebase Console
2. ✅ Bucket name is correct in `.env` file
3. ✅ Storage rules allow authenticated writes
4. ✅ Service account has Storage permissions
5. ✅ Backend server is running
6. ✅ User is logged in (authenticated)

### Common Bucket Names

- **New Firebase projects:** `project-id.firebasestorage.app`
- **Older Firebase projects:** `project-id.appspot.com`

Your project likely uses: `motospherebsit3b.firebasestorage.app`

### Still Having Issues?

Check the backend console logs for the specific error message. The improved error handling will now show:
- Exact bucket name being used
- Specific error messages from Firebase
- Whether the bucket exists and is accessible

If you see specific errors, share them and I can help troubleshoot further.

# How to Enable Firebase Storage (Free Tier)

## Important Note
Firebase Storage **IS FREE** on the Spark plan, but you may need to enable billing (Blaze plan) to activate it. **Don't worry - you won't be charged** as long as you stay within the free limits (5GB storage, 1GB/day downloads).

## Step-by-Step Instructions

### Option 1: Enable Through Firebase Console (Recommended)

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: **MOTOSPHERE**

2. **Click "Upgrade project" button**
   - You'll see this button in the Storage page
   - Don't worry - you're upgrading to Blaze plan which has a free tier

3. **Enable Billing (Required for Storage)**
   - You'll be redirected to Google Cloud Console
   - Click **"Enable billing"**
   - Add a payment method (credit card)
   - **Important:** You won't be charged unless you exceed free limits:
     - 5 GB storage (free)
     - 1 GB/day downloads (free)
     - 20,000 uploads/day (free)
     - 50,000 downloads/day (free)

4. **Return to Firebase Console**
   - Go back to Firebase Console → Storage
   - Now you should see **"Get started"** button

5. **Click "Get started"**
   - Choose **"Start in test mode"** (for development)
   - Select the same location as your Firestore database
   - Click **Done**

6. **Get Your Bucket Name**
   - After enabling, you'll see your Storage bucket URL
   - Format: `gs://motospherebsit3b.firebasestorage.app`
   - Copy this bucket name

7. **Add to Backend/.env**
   ```env
   FIREBASE_STORAGE_BUCKET=motospherebsit3b.firebasestorage.app
   ```

8. **Configure Storage Rules**
   - Go to Storage → Rules tab
   - Replace with:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       // Allow authenticated users to upload profile pictures
       match /profile-pictures/{userId}-{timestamp}-{fileName} {
         allow read: if true; // Public read access
         allow write: if request.auth != null; // Authenticated users can write
       }
       
       // Allow authenticated users to read their own files
       match /{allPaths=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```
   - Click **Publish**

### Option 2: Enable Through Google Cloud Console

If Option 1 doesn't work, try this:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project: **motospherebsit3b**

2. **Enable Cloud Storage API**
   - Go to **APIs & Services** → **Library**
   - Search for "Cloud Storage API"
   - Click **Enable**

3. **Create Storage Bucket**
   - Go to **Cloud Storage** → **Buckets**
   - Click **Create Bucket**
   - Name: `motospherebsit3b.firebasestorage.app` (or use default)
   - Location: Same as Firestore
   - Click **Create**

4. **Return to Firebase Console**
   - Go back to Firebase Console → Storage
   - Storage should now be enabled

### Option 3: Use Firebase CLI (Advanced)

If you have Firebase CLI installed:

```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase Storage
firebase init storage

# Follow the prompts:
# - Select your project
# - Choose location
# - Select "test mode" for rules
```

## Why Do I Need to Enable Billing?

Firebase Storage requires the **Blaze plan** (pay-as-you-go) to be enabled. However:

✅ **You get FREE tier:**
- 5 GB storage
- 1 GB/day downloads
- 20,000 uploads/day
- 50,000 downloads/day

✅ **You only pay if you exceed these limits**

✅ **For a small app, you'll likely never exceed free limits**

## Verify Storage is Enabled

After enabling, you should see:

1. ✅ Storage page shows "Files" tab (not upgrade message)
2. ✅ Bucket URL visible at the top
3. ✅ Rules tab is accessible
4. ✅ No "Upgrade project" message

## Troubleshooting

### Still Seeing "Upgrade project"?
- Make sure billing is enabled in Google Cloud Console
- Wait a few minutes for changes to propagate
- Refresh the Firebase Console page

### Can't Find "Get started" Button?
- Try refreshing the page
- Check if Storage is already enabled (look for "Files" tab)
- Go to Google Cloud Console → Cloud Storage → Buckets

### Storage Enabled But Not Working?
- Check `FIREBASE_STORAGE_BUCKET` in `Backend/.env`
- Verify Storage rules are published
- Restart backend server: `cd Backend && npm start`

## Free Tier Limits (You Won't Be Charged)

| Feature | Free Tier | Your Usage |
|---------|-----------|------------|
| Storage | 5 GB | ~0 GB |
| Downloads | 1 GB/day | ~0 GB/day |
| Uploads | 20,000/day | ~0/day |
| Downloads | 50,000/day | ~0/day |

**You're safe!** These limits are very generous for a small app.

## Next Steps

After enabling Storage:

1. ✅ Add bucket name to `Backend/.env`
2. ✅ Configure Storage rules
3. ✅ Restart backend server
4. ✅ Test profile picture upload

See `STORAGE_TROUBLESHOOTING.md` for more help.

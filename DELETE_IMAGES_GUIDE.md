# How to Delete Images from Cloudinary

There are **3 ways** to delete images from Cloudinary:

## Method 1: Automatic Deletion (Recommended) ✅

**When you upload a new profile picture, the old one is automatically deleted!**

This happens automatically:
- ✅ Old profile picture is deleted from Cloudinary
- ✅ New profile picture is uploaded
- ✅ Database is updated with new URL

**No action needed** - this happens every time you upload a new profile picture!

---

## Method 2: Delete Profile Picture from App (Automatic)

Delete your profile picture directly from your app:

### Backend API Endpoint:
```javascript
DELETE /api/auth/profile-picture
Headers: Authorization: Bearer <token>
```

### Frontend Usage:
```javascript
import { authAPI } from '../services/api';

// Delete profile picture
const response = await authAPI.deleteProfilePicture();
if (response.success) {
  console.log('Profile picture deleted!');
}
```

**What it does:**
- ✅ Deletes image from Cloudinary
- ✅ Removes profile picture URL from database
- ✅ Frees up storage space

---

## Method 3: Manual Deletion from Cloudinary Dashboard

If you want to manually delete images from Cloudinary:

### Step 1: Go to Cloudinary Dashboard
1. Visit: https://console.cloudinary.com/
2. Log in to your account

### Step 2: Go to Media Library
1. Click **"Media Library"** in the left sidebar
2. Click **"Assets"** tab

### Step 3: Find Your Images
1. Navigate to: `motosphere/profile-pictures/`
2. You'll see all uploaded profile pictures
3. Images are named: `userId-timestamp` (e.g., `user123-1234567890`)

### Step 4: Delete Images
1. **Delete Single Image:**
   - Click on the image
   - Click **"Delete"** button
   - Confirm deletion

2. **Delete Multiple Images:**
   - Select multiple images (checkboxes)
   - Click **"Delete Selected"** button
   - Confirm deletion

3. **Delete All Images:**
   - Select folder: `motosphere/profile-pictures/`
   - Click **"Delete"** button
   - Confirm deletion

---

## Understanding Cloudinary Storage

### Free Tier Limits:
- ✅ **25 GB storage** (free forever)
- ✅ **25 GB bandwidth/month** (free)
- ✅ **Automatic image optimization**

### Average Profile Picture Size:
- Uploaded: ~500 KB - 2 MB
- After optimization: ~50-100 KB
- **25 GB = 250,000+ profile pictures!**

**You'll likely never exceed free limits!** But it's good to manage storage anyway.

---

## Check Your Cloudinary Storage Usage

### View Storage Usage:
1. Go to Cloudinary Dashboard
2. Click **"Home"** in left sidebar
3. Look for **"Usage"** section
4. You'll see:
   - Storage used: X GB / 25 GB
   - Bandwidth used: X GB / 25 GB/month
   - Number of assets

### View Images in Media Library:
1. Go to **"Media Library"** → **"Assets"**
2. Click **"motosphere"** folder
3. Click **"profile-pictures"** folder
4. See all uploaded profile pictures

---

## Automatic Cleanup (Recommended)

**The best practice is to let the app handle deletion automatically:**

✅ **When user uploads new profile picture:**
- Old image is automatically deleted from Cloudinary
- New image is uploaded
- Database is updated

✅ **When user deletes profile picture:**
- Image is deleted from Cloudinary
- Database is updated

**This keeps your storage clean automatically!**

---

## Tips for Managing Storage

### 1. Let Users Delete Old Pictures
- When users upload new profile pictures, old ones are auto-deleted
- Users can manually delete their profile picture if needed

### 2. Regular Cleanup (Optional)
- If you need to free up space, go to Cloudinary Dashboard
- Navigate to `motosphere/profile-pictures/`
- Delete old unused images

### 3. Monitor Usage
- Check Cloudinary Dashboard periodically
- See how much storage you're using
- Free tier (25 GB) is very generous!

---

## Summary

| Method | When to Use | Difficulty |
|--------|-------------|------------|
| **Automatic (Upload New)** | Every time user uploads new picture | ✅ Automatic |
| **Delete from App** | User wants to remove profile picture | ✅ Easy |
| **Manual Dashboard** | Bulk cleanup or specific images | ⚠️ Manual |

**Recommendation:** Let automatic deletion handle it! Only use manual deletion if you need bulk cleanup.

---

## Need Help?

- **Cloudinary Dashboard:** https://console.cloudinary.com/
- **Cloudinary Docs:** https://cloudinary.com/documentation
- **Check Storage:** Dashboard → Home → Usage

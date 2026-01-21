# Cloudinary Setup Guide (FREE - No Credit Card Required!)

Cloudinary is a **free image hosting service** that doesn't require a credit card. Perfect for profile pictures!

## Step 1: Sign Up for Cloudinary (FREE)

1. Go to: https://cloudinary.com/users/register/free
2. Fill in your details:
   - **Email** (required)
   - **Password** (required)
   - **Full Name** (required)
3. Click **"Create Account"**
4. **No credit card needed!** ✅

## Step 2: Get Your Cloudinary Credentials

After signing up:

1. You'll be taken to your dashboard
2. Look for **"Account Details"** or go to: https://console.cloudinary.com/console
3. You'll see three important values:
   - **Cloud Name** (e.g., `dabc123ef`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `AbCdEfGhIjKlMnOpQrStUvWxYz`)

## Step 3: Add Credentials to Backend/.env

1. Open `Backend/.env` file
2. Add these three lines:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
```

**Example:**
```env
CLOUDINARY_CLOUD_NAME=dabc123ef
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz
```

## Step 4: Install Cloudinary Package

Open terminal in the `Backend` folder:

```bash
cd Backend
npm install cloudinary
```

## Step 5: Restart Backend Server

```bash
npm start
```

You should see:
```
✅ Cloudinary configured (free profile picture storage)
🚀 Server is running on port 5000
```

## Step 6: Test Profile Picture Upload

1. Go to your app
2. Navigate to Settings
3. Try uploading a profile picture
4. It should work! 🎉

## Free Tier Limits (You Won't Be Charged!)

**Free Tier Includes:**
- ✅ **25 GB storage** (free forever)
- ✅ **25 GB bandwidth/month** (free)
- ✅ **Image optimization** (automatic)
- ✅ **CDN delivery** (fast worldwide)

**For Profile Pictures:**
- Average profile picture: ~100 KB
- 25 GB = **250,000+ profile pictures**
- You'll likely never exceed free limits!

## Troubleshooting

### "Cloudinary not configured" Error?

**Check:**
1. ✅ Did you add all three credentials to `Backend/.env`?
2. ✅ Did you restart the backend server?
3. ✅ Are the credentials correct? (no extra spaces)

### Still Having Issues?

**Verify your credentials:**
1. Go to: https://console.cloudinary.com/console
2. Check that Cloud Name, API Key, and API Secret match your `.env` file
3. Make sure there are no spaces before/after the values

### Want to See Upload Logs?

Check your backend console when uploading:
- You should see: `Uploading to Cloudinary...`
- Then: `✅ Image uploaded to Cloudinary: https://...`

## That's It! 🎉

Now you can upload profile pictures **completely free** without any credit card!

The app will automatically:
- ✅ Upload images to Cloudinary
- ✅ Optimize images (compress, resize)
- ✅ Deliver images via CDN (fast loading)
- ✅ Store image URL in your Firestore database

---

**Need Help?** Check `FREE_STORAGE_ALTERNATIVE.md` for other options.

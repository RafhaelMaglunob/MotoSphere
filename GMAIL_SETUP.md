# Gmail Setup for Password Reset

This guide will help you configure Gmail to send password reset emails for MotoSphere.

## Prerequisites

- A Gmail account
- Access to your Gmail account settings

## Step 1: Enable 2-Step Verification

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click **2-Step Verification**
3. Follow the prompts to enable 2-Step Verification (if not already enabled)

## Step 2: Generate an App Password

1. Go back to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click **App passwords**
   - If you don't see "App passwords", make sure 2-Step Verification is enabled
3. Select **Mail** as the app
4. Select **Other (Custom name)** as the device
5. Enter "MotoSphere" as the custom name
6. Click **Generate**
7. **Copy the 16-character password** (you'll need this for your `.env` file)
   - It will look like: `abcd efgh ijkl mnop`

## Step 3: Configure Environment Variables

Add these to your `Backend/.env` file:

```env
# Gmail Configuration for Password Reset
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
FRONTEND_URL=http://localhost:5173
```

**Important Notes:**
- `GMAIL_USER`: Your full Gmail address (e.g., `yourname@gmail.com`)
- `GMAIL_APP_PASSWORD`: The 16-character app password you generated (remove spaces)
- `FRONTEND_URL`: Your frontend URL (use your production URL in production)

## Step 4: Restart Your Backend Server

After adding the environment variables:

```bash
cd Backend
npm start
# or for development
npm run dev
```

## Testing

1. Go to the Forgot Password page
2. Enter a registered email address
3. Check the email inbox for the password reset link
4. Click the link to reset your password

## Troubleshooting

### "Invalid login" or "Authentication failed"

- Make sure you're using the **App Password**, not your regular Gmail password
- Verify the App Password is correct (no spaces, all 16 characters)
- Ensure 2-Step Verification is enabled

### "Connection timeout" or "Cannot send email"

- Check your internet connection
- Verify Gmail SMTP is not blocked by firewall
- Try using a different network

### Email not received

- Check spam/junk folder
- Verify the email address is correct
- Check that the user exists in the database
- Look at backend console logs for errors

## Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use different Gmail accounts** for development and production
3. **Rotate App Passwords** periodically
4. **Monitor email sending** for suspicious activity

## Production Deployment

When deploying to production:

1. Create a dedicated Gmail account for your application
2. Generate a new App Password for production
3. Update `FRONTEND_URL` to your production domain
4. Update environment variables in your hosting platform
5. Test the password reset flow in production

## Additional Resources

- [Google App Passwords](https://support.google.com/accounts/answer/185833)
- [Nodemailer Gmail Setup](https://nodemailer.com/usage/using-gmail/)

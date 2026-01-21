import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter object using Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, // Your Gmail address
      pass: process.env.GMAIL_APP_PASSWORD // Gmail App Password (not regular password)
    }
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"MotoSphere" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - MotoSphere',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f4f4f4;
              padding: 30px;
              border-radius: 10px;
            }
            .header {
              background: linear-gradient(135deg, #0F2A52 0%, #2EA8FF 100%);
              color: white;
              padding: 20px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #2EA8FF;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .button:hover {
              background-color: #22D3EE;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>We received a request to reset your password for your MotoSphere account.</p>
              <p>Click the button below to reset your password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #2EA8FF;">${resetUrl}</p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul>
                  <li>This link will expire in 1 hour</li>
                  <li>If you didn't request this, please ignore this email</li>
                  <li>Never share this link with anyone</li>
                </ul>
              </div>
              <p>If you didn't request a password reset, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} MotoSphere. All rights reserved.</p>
              <p>This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request - MotoSphere
        
        Hello,
        
        We received a request to reset your password for your MotoSphere account.
        
        Click the link below to reset your password:
        ${resetUrl}
        
        This link will expire in 1 hour.
        
        If you didn't request this, please ignore this email.
        
        © ${new Date().getFullYear()} MotoSphere. All rights reserved.
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Send alert notification email to admin
export const sendAlertNotificationEmail = async (adminEmail, alertData) => {
  try {
    const transporter = createTransporter();

    const { deviceId, deviceID, deviceNo, type, alertType, time_of_occurrence, time_of_occurence } = alertData;
    const deviceIdDisplay = deviceId || deviceID || deviceNo || 'Unknown';
    const alertTypeDisplay = type || alertType || 'Crash Detected';
    const timeStr = time_of_occurrence || time_of_occurence 
      ? new Date((time_of_occurrence || time_of_occurence).toDate ? (time_of_occurrence || time_of_occurence).toDate() : (time_of_occurrence || time_of_occurence)).toLocaleString()
      : new Date().toLocaleString();

    const mailOptions = {
      from: `"MotoSphere Alert System" <${process.env.GMAIL_USER}>`,
      to: adminEmail,
      subject: `🚨 Alert: ${alertTypeDisplay} - Device #${deviceIdDisplay}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f4f4f4;
              padding: 30px;
              border-radius: 10px;
            }
            .header {
              background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
              color: white;
              padding: 20px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .alert-box {
              background-color: #FEE2E2;
              border-left: 4px solid #EF4444;
              padding: 20px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #E5E7EB;
            }
            .info-label {
              font-weight: bold;
              color: #6B7280;
            }
            .info-value {
              color: #111827;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 Alert Notification</h1>
            </div>
            <div class="content">
              <p>Hello Admin,</p>
              <p>A new alert has been detected in the MotoSphere system:</p>
              
              <div class="alert-box">
                <h2 style="margin-top: 0; color: #DC2626;">${alertTypeDisplay}</h2>
                <div class="info-row">
                  <span class="info-label">Device ID:</span>
                  <span class="info-value">#${deviceIdDisplay}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Time:</span>
                  <span class="info-value">${timeStr}</span>
                </div>
              </div>

              <p>Please check the admin dashboard for more details and take appropriate action if necessary.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/dashboard" 
                   style="display: inline-block; padding: 12px 30px; background-color: #2EA8FF; color: white; text-decoration: none; border-radius: 5px;">
                  View Dashboard
                </a>
              </div>

              <p style="color: #6B7280; font-size: 14px;">
                This is an automated notification from the MotoSphere Alert System.
                You can manage your email notification preferences in the Admin Settings.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} MotoSphere. All rights reserved.</p>
              <p>This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Alert Notification - MotoSphere
        
        Hello Admin,
        
        A new alert has been detected in the MotoSphere system:
        
        Alert Type: ${alertTypeDisplay}
        Device ID: #${deviceIdDisplay}
        Time: ${timeStr}
        
        Please check the admin dashboard for more details and take appropriate action if necessary.
        
        ${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/dashboard
        
        © ${new Date().getFullYear()} MotoSphere. All rights reserved.
        This is an automated email, please do not reply.
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Alert notification email sent to:', adminEmail, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending alert notification email:', error);
    throw new Error('Failed to send alert notification email');
  }
};

// Send notification emails to all admins with notifications enabled
export const notifyAdminsAboutAlert = async (alertData) => {
  try {
    const admin = require('firebase-admin');
    const db = admin.firestore();
    
    // Get all admin users with notifications enabled
    const adminsSnapshot = await db.collection('users')
      .where('role', '==', 'admin')
      .get();
    
    const adminEmails = [];
    adminsSnapshot.forEach(doc => {
      const userData = doc.data();
      // Check if notifications are enabled (default to true if not set)
      if (userData.notifications !== false && userData.email) {
        adminEmails.push(userData.email);
      }
    });
    
    // Send email to each admin
    const results = [];
    for (const email of adminEmails) {
      try {
        const result = await sendAlertNotificationEmail(email, alertData);
        results.push({ email, success: true, ...result });
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        results.push({ email, success: false, error: error.message });
      }
    }
    
    return { success: true, sent: results.filter(r => r.success).length, total: adminEmails.length, results };
  } catch (error) {
    console.error('Error notifying admins about alert:', error);
    throw error;
  }
};

export default {
  sendPasswordResetEmail,
  sendAlertNotificationEmail,
  notifyAdminsAboutAlert
};

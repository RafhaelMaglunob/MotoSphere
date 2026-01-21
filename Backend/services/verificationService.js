import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import twilio from 'twilio';
import crypto from 'crypto';

dotenv.config();

// Email verification service
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });
};

// Generate 6-digit verification code
export const generateVerificationCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send email verification code
export const sendEmailVerificationCode = async (email, code) => {
  try {
    const transporter = createEmailTransporter();

    const mailOptions = {
      from: `"MotoSphere" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Email Verification Code - MotoSphere',
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
            .code-box {
              background-color: #f0f0f0;
              border: 2px dashed #2EA8FF;
              padding: 20px;
              text-align: center;
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              color: #0F2A52;
              margin: 20px 0;
              border-radius: 5px;
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
              <h1>✉️ Email Verification</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Thank you for registering with MotoSphere. Please use the verification code below to verify your email address:</p>
              
              <div class="code-box">${code}</div>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul>
                  <li>This code will expire in 15 minutes</li>
                  <li>Never share this code with anyone</li>
                  <li>If you didn't request this, please ignore this email</li>
                </ul>
              </div>
              
              <p>If you didn't create a MotoSphere account, you can safely ignore this email.</p>
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
        Email Verification Code - MotoSphere
        
        Hello,
        
        Thank you for registering with MotoSphere. Please use the verification code below to verify your email address:
        
        Verification Code: ${code}
        
        This code will expire in 15 minutes.
        
        If you didn't create a MotoSphere account, you can safely ignore this email.
        
        © ${new Date().getFullYear()} MotoSphere. All rights reserved.
        This is an automated email, please do not reply.
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email verification code sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email verification code:', error);
    throw new Error('Failed to send email verification code');
  }
};

// Phone OTP Service
let twilioClient = null;

const getTwilioClient = () => {
  if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
};

// Generate 6-digit OTP
export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send SMS OTP
export const sendSMSOTP = async (phoneNumber, otp) => {
  try {
    const client = getTwilioClient();
    
    if (!client) {
      console.warn('Twilio not configured. OTP sending disabled.');
      // For development, just log the OTP
      console.log(`[DEV MODE] Phone OTP for ${phoneNumber}: ${otp}`);
      return { success: true, messageId: 'dev-mode', devOtp: otp };
    }

    const message = await client.messages.create({
      body: `Your MotoSphere verification code is: ${otp}. This code will expire in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    console.log('SMS OTP sent:', message.sid);
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error('Error sending SMS OTP:', error);
    // For development, still return success with dev OTP
    if (!process.env.TWILIO_ACCOUNT_SID) {
      console.log(`[DEV MODE] Phone OTP for ${phoneNumber}: ${otp}`);
      return { success: true, messageId: 'dev-mode', devOtp: otp };
    }
    throw new Error('Failed to send SMS OTP');
  }
};

export default {
  generateVerificationCode,
  sendEmailVerificationCode,
  generateOTP,
  sendSMSOTP
};

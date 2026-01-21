import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import dotenv from 'dotenv';

dotenv.config();

// Generate 2FA secret for a user
export const generate2FASecret = (username, email) => {
  const secret = speakeasy.generateSecret({
    name: `MotoSphere (${username || email})`,
    issuer: 'MotoSphere',
    length: 32
  });

  return {
    secret: secret.base32,
    otpauth_url: secret.otpauth_url
  };
};

// Generate QR code for 2FA setup
export const generateQRCode = async (otpauthUrl) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(otpauthUrl);
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

// Verify 2FA token
export const verify2FAToken = (token, secret) => {
  try {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2 time steps (60 seconds) tolerance
    });
  } catch (error) {
    console.error('Error verifying 2FA token:', error);
    return false;
  }
};

// Generate backup codes (for 2FA recovery)
export const generateBackupCodes = () => {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    // Generate 8-digit backup code
    const code = Math.floor(10000000 + Math.random() * 90000000).toString();
    codes.push(code);
  }
  return codes;
};

export default {
  generate2FASecret,
  generateQRCode,
  verify2FAToken,
  generateBackupCodes
};

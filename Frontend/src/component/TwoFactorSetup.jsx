import React, { useState } from 'react';
import { authAPI } from '../services/api';

function TwoFactorSetup({ isLight, isEnabled, onToggle }) {
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [_secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationToken, setVerificationToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState('idle'); // idle, generating, verifying, enabled, disabling

  const generate2FA = async () => {
    setLoading(true);
    setError('');
    setStep('generating');

    try {
      const response = await authAPI.generate2FA();
      if (response.success) {
        setQrCode(response.qrCode);
        setSecret(response.secret);
        setBackupCodes(response.backupCodes || []);
        setStep('verifying');
      } else {
        setError(response.message || 'Failed to generate 2FA secret');
        setStep('idle');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate 2FA secret. Please try again.');
      setStep('idle');
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable2FA = async () => {
    if (!verificationToken || verificationToken.length !== 6) {
      setError('Please enter a 6-digit verification code');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.verifyEnable2FA(verificationToken);
      if (response.success) {
        setSuccess('2FA enabled successfully!');
        setStep('enabled');
        if (onToggle) {
          onToggle(true, response.backupCodes || backupCodes);
        }
        setTimeout(() => {
          setStep('idle');
          setQrCode('');
          setSecret('');
          setVerificationToken('');
        }, 3000);
      } else {
        setError(response.message || 'Invalid verification code');
      }
    } catch (err) {
      setError(err.message || 'Failed to enable 2FA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    const password = prompt('Enter your password to disable 2FA:');
    if (!password) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.disable2FA('', password);
      if (response.success) {
        setSuccess('2FA disabled successfully!');
        if (onToggle) {
          onToggle(false, []);
        }
        setStep('idle');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Failed to disable 2FA');
      }
    } catch (err) {
      setError(err.message || 'Failed to disable 2FA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isEnabled) {
    return (
      <div className="flex flex-col gap-4">
        <div className={`${isLight ? "bg-green-50 border-green-200" : "bg-green-500/10 border-green-500/30"} border p-4 rounded-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className={`${isLight ? "text-black" : "text-white"} font-semibold`}>Two-Factor Authentication Enabled</h3>
                <p className={`${isLight ? "text-gray-600" : "text-[#9BB3D6]"} text-sm`}>Your account is protected with 2FA</p>
              </div>
            </div>
            <button
              onClick={disable2FA}
              disabled={loading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {loading ? 'Disabling...' : 'Disable 2FA'}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}
      </div>
    );
  }

  if (step === 'verifying') {
    return (
      <div className="flex flex-col gap-4">
        <div className={`${isLight ? "bg-white" : "bg-[#0A1A3A]"} p-6 rounded-lg border ${isLight ? "border-gray-200" : "border-gray-700"}`}>
          <h3 className={`${isLight ? "text-black" : "text-white"} font-semibold mb-4`}>Scan QR Code</h3>
          <div className="flex flex-col items-center gap-4">
            <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 border-2 border-gray-300 rounded-lg" />
            <p className={`${isLight ? "text-gray-600" : "text-[#9BB3D6]"} text-sm text-center`}>
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className={`${isLight ? "text-black" : "text-white"} text-sm font-semibold`}>
            Enter Verification Code
          </label>
          <input
            type="text"
            value={verificationToken}
            onChange={(e) => setVerificationToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className={`${isLight ? "bg-white text-black border-gray-300" : "bg-[#0A1A3A] text-white border-gray-700"} border px-4 py-2 rounded-lg text-center text-2xl font-mono tracking-widest outline-none focus:ring-2 focus:ring-[#2EA8FF]`}
            maxLength={6}
            disabled={loading}
          />
          <button
            onClick={verifyAndEnable2FA}
            disabled={loading || verificationToken.length !== 6}
            className="px-4 py-2 bg-[#2EA8FF] hover:bg-[#2EA8FF]/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Verifying...' : 'Verify & Enable 2FA'}
          </button>
        </div>

        {backupCodes.length > 0 && (
          <div className={`${isLight ? "bg-yellow-50 border-yellow-200" : "bg-yellow-500/10 border-yellow-500/30"} border p-4 rounded-lg`}>
            <h4 className={`${isLight ? "text-black" : "text-white"} font-semibold mb-2`}>⚠️ Save Your Backup Codes</h4>
            <p className={`${isLight ? "text-gray-600" : "text-[#9BB3D6]"} text-sm mb-3`}>
              Store these codes in a safe place. You can use them if you lose access to your authenticator app.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <code key={index} className={`${isLight ? "bg-white text-black" : "bg-[#0A1A3A] text-white"} p-2 rounded text-center font-mono text-sm`}>
                  {code}
                </code>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={() => {
            setStep('idle');
            setQrCode('');
            setSecret('');
            setVerificationToken('');
            setError('');
          }}
          className="text-[#9BB3D6] hover:text-[#2EA8FF] text-sm"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`${isLight ? "text-black" : "text-white"} font-semibold`}>Two-Factor Authentication</h3>
          <p className={`${isLight ? "text-gray-600" : "text-[#9BB3D6]"} text-sm`}>
            Add an extra layer of security to your account
          </p>
        </div>
        <button
          onClick={generate2FA}
          disabled={loading}
          className="px-4 py-2 bg-[#2EA8FF] hover:bg-[#2EA8FF]/80 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
        >
          {loading ? 'Generating...' : 'Enable 2FA'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

export default TwoFactorSetup;

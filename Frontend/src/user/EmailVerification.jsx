import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

function EmailVerification() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Auto-send verification email on mount
    sendVerificationCode();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendVerificationCode = async () => {
    setSending(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.sendEmailVerification();
      if (response.success) {
        setSuccess('Verification code sent to your email!');
        setCountdown(60); // 60 second cooldown
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Failed to send verification code');
      }
    } catch (err) {
      setError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!code || code.length !== 6) {
      setError('Please enter a 6-digit verification code');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.verifyEmail(code);
      if (response.success) {
        setSuccess('Email verified successfully!');
        
        // Update localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        userData.emailVerified = true;
        localStorage.setItem('user', JSON.stringify(userData));

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/user/home');
        }, 2000);
      } else {
        setError(response.message || 'Invalid verification code');
      }
    } catch (err) {
      setError(err.message || 'Failed to verify email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center p-6">
      <div className="bg-[#0F1729]/90 p-10 rounded-2xl shadow-[0_0_40px_rgba(0,212,255,0.15)] max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📧</div>
          <h1 className="text-2xl font-bold text-white mb-2">Verify Your Email</h1>
          <p className="text-[#94A3B8] text-sm">
            We've sent a verification code to your email address. Please enter it below.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
            <p className="text-green-400 text-sm text-center">{success}</p>
          </div>
        )}

        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[#9BB3D6]">Verification Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              className="bg-[#0A0E27]/50 text-[#CCCCCC] text-center text-2xl font-mono tracking-widest px-4 py-3 rounded-lg outline-none border border-transparent focus:border-[#22D3EE]"
              maxLength={6}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="bg-[#06B6D4] hover:bg-[#06B6D4]/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg w-full transition-colors"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[#94A3B8] text-sm mb-2">
            Didn't receive the code?
          </p>
          <button
            onClick={sendVerificationCode}
            disabled={sending || countdown > 0}
            className="text-[#22D3EE] hover:underline disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {sending 
              ? 'Sending...' 
              : countdown > 0 
                ? `Resend in ${countdown}s` 
                : 'Resend Code'
            }
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/user/home')}
            className="text-[#94A3B8] hover:text-[#22D3EE] text-sm"
          >
            Verify Later
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmailVerification;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

function PhoneVerification() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [devOtp, setDevOtp] = useState('');

  useEffect(() => {
    // Auto-send OTP on mount
    sendOTP();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendOTP = async () => {
    setSending(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.sendPhoneOTP();
      if (response.success) {
        setSuccess('OTP sent to your phone!');
        if (response.devOtp) {
          setDevOtp(response.devOtp);
          setSuccess('OTP sent! (Dev Mode: ' + response.devOtp + ')');
        }
        setCountdown(60); // 60 second cooldown
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(response.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!otp || otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.verifyPhone(otp);
      if (response.success) {
        setSuccess('Phone verified successfully!');
        
        // Update localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        userData.phoneVerified = true;
        localStorage.setItem('user', JSON.stringify(userData));

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/user/home');
        }, 2000);
      } else {
        setError(response.message || 'Invalid OTP');
      }
    } catch (err) {
      setError(err.message || 'Failed to verify phone. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center p-6">
      <div className="bg-[#0F1729]/90 p-10 rounded-2xl shadow-[0_0_40px_rgba(0,212,255,0.15)] max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📱</div>
          <h1 className="text-2xl font-bold text-white mb-2">Verify Your Phone</h1>
          <p className="text-[#94A3B8] text-sm">
            We've sent an OTP to your phone number. Please enter it below.
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

        {devOtp && (
          <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
            <p className="text-yellow-400 text-xs text-center">
              Dev Mode: Use OTP: <strong>{devOtp}</strong>
            </p>
          </div>
        )}

        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[#9BB3D6]">OTP Code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              className="bg-[#0A0E27]/50 text-[#CCCCCC] text-center text-2xl font-mono tracking-widest px-4 py-3 rounded-lg outline-none border border-transparent focus:border-[#22D3EE]"
              maxLength={6}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="bg-[#06B6D4] hover:bg-[#06B6D4]/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg w-full transition-colors"
          >
            {loading ? 'Verifying...' : 'Verify Phone'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[#94A3B8] text-sm mb-2">
            Didn't receive the OTP?
          </p>
          <button
            onClick={sendOTP}
            disabled={sending || countdown > 0}
            className="text-[#22D3EE] hover:underline disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {sending 
              ? 'Sending...' 
              : countdown > 0 
                ? `Resend in ${countdown}s` 
                : 'Resend OTP'
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

export default PhoneVerification;

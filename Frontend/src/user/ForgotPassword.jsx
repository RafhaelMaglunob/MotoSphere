import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { authAPI } from '../services/api';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Frontend validation
        if (!email || email.trim().length === 0) {
            setError('Email is required');
            return;
        }

        // Validate email format
        if (!/^[A-Za-z0-9_]+@(gmail\.com|yahoo\.com|hotmail\.com)$/.test(email.trim())) {
            setError('Email must be a valid email ending with gmail.com, yahoo.com, or hotmail.com');
            return;
        }

        setLoading(true);

        try {
            const response = await authAPI.forgotPassword(email.trim());

            if (response.success) {
                setSuccess(response.message || 'Password reset instructions have been sent to your email.');
                // In development, backend may return a devResetUrl if email sending failed.
                if (response.devResetUrl) {
                    console.log('Dev reset URL:', response.devResetUrl);
                }
            } else {
                setError(response.message || 'Failed to process password reset request.');
            }
        } catch (err) {
            setError(err.message || 'Failed to process password reset request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen overflow-hidden bg-[url('./component/img/UserLoginCover.png')] bg-[length:100%_100%] bg-no-repeat bg-center">
            <div className="md:h-[100vh] h-screen flex justify-center items-center">
                <div className="bg-[#0F2A52]/85 p-10 flex flex-col max-h-[480px] scrollbar-thin h-screen flex overflow-auto items-center rounded-2xl shadow-[0_0_40px_rgba(0,212,255,0.15)]">
                    <h1 className="font-semibold text-white text-2xl mb-3">Forgot Password</h1>
                    <h2 className="text-xs text-[#94A3B8] text-center leading-[1.5] mb-4">
                        Enter your email address and we'll send you instructions to reset your password
                    </h2>

                    {error && (
                        <div className="w-full mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                            <p className="text-red-400 text-sm text-center">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="w-full mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                            <p className="text-green-400 text-sm text-center">{success}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
                        <div className="flex flex-col items-start w-full gap-2 mt-4">
                            <label className="text-sm text-[#9BB3D6]">Email</label>
                            <input
                                type="email"
                                placeholder="e.g motosphere@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-[#0A1A3A] text-[#CCCCCC] text-sm w-70 md:w-80 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#22D3EE]"
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-[#2EA8FF] hover:bg-[#2EA8FF]/80 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-center text-white text-sm w-full py-3 rounded-xl mt-6 transition-colors"
                        >
                            {loading ? 'Sending...' : 'Send Reset Instructions'}
                        </button>
                    </form>

                    <div className="flex flex-row mt-4 justify-center w-full md:px-4">
                        <button 
                            onClick={() => navigate("/user-login")} 
                            className="text-[#22D3EE] text-xs cursor-pointer hover:underline"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { authAPI } from '../services/api';

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Invalid reset link. Please request a new password reset.');
        }
    }, [token]);

    const validatePassword = (pwd) => {
        if (!pwd || pwd.length < 8) {
            return 'Password must be at least 8 characters long';
        }
        // Strong password: uppercase, lowercase, number, special character, 8+ characters
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(pwd)) {
            return 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character';
        }
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!token) {
            setError('Invalid reset link. Please request a new password reset.');
            return;
        }

        // Validation
        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await authAPI.resetPassword(token, password, confirmPassword);

            if (response.success) {
                setSuccess(response.message || 'Password has been reset successfully!');
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    navigate("/user-login");
                }, 2000);
            } else {
                setError(response.message || 'Failed to reset password.');
            }
        } catch (err) {
            setError(err.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen overflow-hidden bg-[url('./component/img/UserLoginCover.png')] bg-[length:100%_100%] bg-no-repeat bg-center">
            <div className="md:h-[100vh] h-screen flex justify-center items-center">
                <div className="bg-[#0F2A52]/85 p-10 flex flex-col max-h-[600px] scrollbar-thin h-screen flex overflow-auto items-center rounded-2xl shadow-[0_0_40px_rgba(0,212,255,0.15)]">
                    <h1 className="font-semibold text-white text-2xl mb-3">Reset Password</h1>
                    <h2 className="text-xs text-[#94A3B8] text-center leading-[1.5] mb-4">
                        Enter your new password below
                    </h2>

                    {error && (
                        <div className="w-full mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                            <p className="text-red-400 text-sm text-center">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="w-full mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                            <p className="text-green-400 text-sm text-center">{success}</p>
                            <p className="text-green-400 text-xs text-center mt-2">Redirecting to login...</p>
                        </div>
                    )}

                    {!token && (
                        <div className="w-full mt-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                            <p className="text-yellow-400 text-sm text-center">
                                Invalid reset link. Please request a new password reset.
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
                        <div className="flex flex-col items-start w-full gap-2 mt-4">
                            <label className="text-sm text-[#9BB3D6]">New Password</label>
                            <div className="relative w-full">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-[#0A1A3A] text-[#CCCCCC] text-sm w-70 md:w-80 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#22D3EE]"
                                    disabled={loading || !token}
                                />
                                <span
                                    className="absolute right-3 top-2.5 cursor-pointer text-[#334155]"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <AiFillEyeInvisible size={20} /> : <AiFillEye size={20} />}
                                </span>
                            </div>
                            <p className="text-xs text-[#94A3B8]">
                                8-15 characters, must include uppercase, number, and special character
                            </p>
                        </div>

                        <div className="flex flex-col items-start w-full gap-2 mt-6">
                            <label className="text-sm text-[#9BB3D6]">Confirm Password</label>
                            <div className="relative w-full">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm your new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="bg-[#0A1A3A] text-[#CCCCCC] text-sm w-70 md:w-80 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#22D3EE]"
                                    disabled={loading || !token}
                                />
                                <span
                                    className="absolute right-3 top-2.5 cursor-pointer text-[#334155]"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <AiFillEyeInvisible size={20} /> : <AiFillEye size={20} />}
                                </span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !token}
                            className="bg-[#2EA8FF] hover:bg-[#2EA8FF]/80 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-center text-white text-sm w-full py-3 rounded-xl mt-6 transition-colors"
                        >
                            {loading ? 'Resetting Password...' : 'Reset Password'}
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

export default ResetPassword;

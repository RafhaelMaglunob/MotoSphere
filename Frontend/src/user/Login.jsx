import React, { useState } from 'react';
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { authAPI } from '../services/api';
import { GoogleIcon } from '../component/svg/GoogleIcon';

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [isChecked, setChecked] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        // Frontend validation
        if (!email || email.trim().length === 0) {
            setError('Email or username is required');
            return;
        }

        if (!password || password.length === 0) {
            setError('Password is required');
            return;
        }

        setLoading(true);

        try {
            const response = await authAPI.login(email.trim(), password);

            if (response.success) {
                // Store token in localStorage
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));

                // Navigate to user home
                navigate("/user/home");
            } else {
                setError(response.message || 'Login failed');
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen overflow-hidden bg-[url('./component/img/UserLoginCover.png')] bg-[length:100%_100%] bg-no-repeat bg-center">
            <div className="md:h-[100vh] h-screen flex justify-center items-center">
                <div className="bg-[#0F2A52]/85 p-10 flex flex-col max-h-[480px] scrollbar-thin h-screen flex overflow-auto items-center rounded-2xl shadow-[0_0_40px_rgba(0,212,255,0.15)]">
                    <h1 className="font-semibold text-white text-2xl mb-3">Login to MotoSphere</h1>
                    <h2 className="text-xs text-[#94A3B8] text-center leading-[1.5]">Access your ride logs, live tracking, and emergency <br />notifications</h2>

                    {error && (
                        <div className="w-full mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                            <p className="text-red-400 text-sm text-center">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="w-full flex flex-col items-center">
                        <div className="flex flex-col items-start w-full gap-2 mt-4">
                            <label className="text-sm text-[#9BB3D6]">Email or Username</label>
                            <input
                                type="text"
                                placeholder="e.g motosphere@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-[#0A1A3A] text-[#CCCCCC] text-sm w-70 md:w-80 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#22D3EE]"
                                disabled={loading}
                            />
                        </div>

                        <div className="flex flex-col items-start w-full mt-6 gap-2">
                            <label className="text-sm text-[#9BB3D6]">Password</label>
                            <div className="relative w-full">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-[#0A1A3A] text-[#CCCCCC] text-sm w-70 md:w-80 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#22D3EE]"
                                    disabled={loading}
                                />
                                <span
                                    className="absolute right-3 top-2.5 cursor-pointer text-[#334155]"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <AiFillEyeInvisible size={20} /> : <AiFillEye size={20} />}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-row mt-4 justify-between w-full">
                            <div
                                onClick={() => setChecked(prev => !prev)}
                                className="flex items-center gap-3 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    readOnly
                                    className="cursor-pointer"
                                />
                                <label className="text-[#94A3B8] text-xs cursor-pointer">
                                    Remember this device
                                </label>
                            </div>
                            <span className="text-[#22D3EE] text-xs">Forgot Password?</span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-[#2EA8FF] hover:bg-[#2EA8FF]/80 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-center text-white text-sm w-full py-3 rounded-xl mt-6 transition-colors"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <div className="flex flex-row mt-4 justify-between w-full md:px-4">
                        <label className="text-[#94A3B8] text-xs">Dont have an account yet?</label>
                        <button onClick={() => navigate("/user-register")} className="text-[#22D3EE] text-xs cursor-pointer">Create an account</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;

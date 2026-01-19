import React, { useState } from 'react';
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { authAPI } from '../services/api';
import Shield from "../component/img/Shield.png";

function Login() {
    const [showPassword, setShowPassword] = useState(false);
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
            const response = await authAPI.adminLogin(email.trim(), password);

            if (response.success) {
                // Store token in localStorage
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));

                // Navigate to admin dashboard
                // Use replace to prevent going back to login page
                navigate("/admin/dashboard", { replace: true });
            } else {
                setError(response.message || 'Login failed');
            }
        } catch (err) {
            setError(err.message || 'Invalid admin credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen overflow-hidden bg-[url('./component/img/AdminLogin.png')] bg-[length:100%_100%] bg-no-repeat bg-center">
            <div className="md:h-[100vh] h-screen flex justify-center items-center">
                <div className="bg-[#0F2A52]/85 p-10 flex flex-col items-center rounded-2xl">
                    <span className="text-[#22D3EE] text-sm px-10 py-2 bg-[#06B6D4]/10 rounded-[50px]">⬤ Admin Portal</span>
                    <img src={Shield} alt="Shield" className="w-20 h-20" />
                    <h1 className="font-bold text-white text-xl">Admin Login</h1>
                    <p className="text-xs text-[#9BB3D6]">Secure access for system administrators</p>

                    {error && (
                        <div className="w-full mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                            <p className="text-red-400 text-sm text-center">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="w-full flex flex-col items-center">
                        <div className="flex flex-col items-start w-full mt-6 gap-2">
                            <label className="text-sm text-[#9BB3D6]">Email or Username</label>
                            <input
                                type="text"
                                placeholder="admin@gmail.com"
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
                                    placeholder="Enter admin password"
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

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-[#2EA8FF] hover:bg-[#2EA8FF]/80 disabled:opacity-50 disabled:cursor-not-allowed text-center text-white text-sm w-full py-3 rounded-xl mt-6 transition-colors"
                        >
                            {loading ? 'Signing in...' : 'Sign in as Admin'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;

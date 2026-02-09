import React, { useState, useEffect, useRef } from 'react';
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { authAPI } from '../services/api';
import { GoogleIcon } from '../component/svg/GoogleIcon';

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const navigate = useNavigate();
    const googleButtonRef = useRef(null);

    useEffect(() => {
        const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

        if (!googleClientId) {
            console.warn('Google Client ID not configured. Google Sign-In will not work.');
            return;
        }

        if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
            if (window.google && window.google.accounts) {
                initializeGoogleSignIn(googleClientId);
            }
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            if (window.google && window.google.accounts) {
                initializeGoogleSignIn(googleClientId);
            }
        };
        document.head.appendChild(script);

        return () => {
            const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
            if (existingScript && !document.querySelector('body[data-google-script-loaded]')) {
                existingScript.remove();
            }
        };
    }, []);

    const initializeGoogleSignIn = (clientId) => {
        if (!window.google || !window.google.accounts) return;

        window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleSignIn,
        });

        setTimeout(() => {
            if (googleButtonRef.current && window.google.accounts.id.renderButton) {
                window.google.accounts.id.renderButton(googleButtonRef.current, {
                    type: 'standard',
                    theme: 'outline',
                    size: 'large',
                    text: 'signin_with',
                    width: '100%',
                });
            }
        }, 100);
    };

    const handleGoogleSignIn = async (response) => {
        setError('');
        setGoogleLoading(true);

        try {
            const authResponse = await authAPI.googleLogin(response.credential);

            if (authResponse.success) {
                localStorage.setItem('token', authResponse.token);
                localStorage.setItem('user', JSON.stringify(authResponse.user));

                if (authResponse.user.role === 'admin') {
                    navigate("/admin/dashboard", { replace: true });
                } else {
                    navigate("/user/home", { replace: true });
                }
            } else {
                setError(authResponse.message || 'Google login failed');
            }
        } catch (err) {
            setError(err.message || 'Google authentication failed.');
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim()) {
            setError('Email or username is required');
            return;
        }

        if (!password) {
            setError('Password is required');
            return;
        }

        setLoading(true);

        try {
            const response = await authAPI.login(email.trim(), password);

            if (response.success) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));

                if (response.user.role === 'admin') {
                    navigate("/admin/dashboard", { replace: true });
                } else {
                    navigate("/user/home", { replace: true });
                }
            } else {
                setError(response.message || 'Login failed');
            }
        } catch (err) {
            setError(err.message || 'Login failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen overflow-hidden bg-[url('./component/img/UserLoginCover.png')] bg-[length:100%_100%] bg-no-repeat bg-center">
            <div className="h-screen flex justify-center items-center">
                <div className="bg-[#0F2A52]/85 p-10 flex flex-col items-center rounded-2xl shadow-[0_0_40px_rgba(0,212,255,0.15)]">

                    <h1 className="font-semibold text-white text-2xl mb-3">
                        Login to MotoSphere
                    </h1>

                    <h2 className="text-xs text-[#94A3B8] text-center leading-[1.5]">
                        Access your ride logs, live tracking, and emergency <br />
                        notifications
                    </h2>

                    {error && (
                        <div className="w-full mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                            <p className="text-red-400 text-sm text-center">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="w-full flex flex-col items-center">
                        <div className="flex flex-col w-full gap-2 mt-4">
                            <label className="text-sm text-[#9BB3D6]">Email or Username</label>
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-[#0A1A3A] text-[#CCCCCC] text-sm w-80 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#22D3EE]"
                            />
                        </div>

                        <div className="flex flex-col w-full mt-6 gap-2">
                            <label className="text-sm text-[#9BB3D6]">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-[#0A1A3A] text-[#CCCCCC] text-sm w-80 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#22D3EE]"
                                />
                                <span
                                    className="absolute right-3 top-3 cursor-pointer text-[#334155]"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-end w-full mt-4">
                            <button
                                type="button"
                                onClick={() => navigate("/forgot-password")}
                                className="text-[#22D3EE] text-xs hover:underline"
                            >
                                Forgot Password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || googleLoading}
                            className="bg-[#2EA8FF] w-full py-3 mt-6 rounded-xl text-white text-sm hover:bg-[#2EA8FF]/80 disabled:opacity-50"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <div className="flex items-center w-full my-4">
                        <div className="flex-1 border-t border-[#334155]" />
                        <span className="px-4 text-[#94A3B8] text-xs">OR</span>
                        <div className="flex-1 border-t border-[#334155]" />
                    </div>

                    <div className="w-full" ref={googleButtonRef} />

                    <div className="flex justify-between w-full mt-4 text-xs">
                        <span className="text-[#94A3B8]">Don’t have an account yet?</span>
                        <button
                            onClick={() => navigate("/user-register")}
                            className="text-[#22D3EE]"
                        >
                            Create an account
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Login;

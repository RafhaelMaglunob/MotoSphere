import React,{ useState } from 'react'
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { login } from '../services/authService';

import { GoogleIcon } from '../component/svg/GoogleIcon';

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [isChecked, setChecked] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    
    const handleLogin = async (e) => {
        e?.preventDefault();
        setError('');
        
        // Client-side validation
        if (!username.trim() || !password.trim()) {
            setError('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        
        try {
            const result = await login(username, password, 'user');
            
            if (result.success) {
                // Successful login - navigate to user home
                navigate("/user/home");
            } else {
                // Show error message
                setError(result.error || 'Invalid credentials. Please try again.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="h-screen overflow-hidden bg-[url('./component/img/UserLoginCover.png')] bg-[length:100%_100%] bg-no-repeat bg-center">
            <div className="md:h-[100vh] h-screen flex justify-center items-center">
                <div className="bg-[#0F2A52]/85 p-10 flex flex-col max-h-[580px] scrollbar-thin h-screen flex overflow-auto items-center rounded-2xl shadow-[0_0_40px_rgba(0,212,255,0.15)]">
                    <h1 className="font-semibold text-white text-2xl mb-3">Login to MotoSphere</h1>
                    <h2 className="text-xs text-[#94A3B8] text-center leading-[1.5]">Access your ride logs, live tracking, and emergency <br />notifications</h2>

                    <div className="flex flex-col gap-3 w-full">
                        <div className="p-3 cursor-pointer bg-white rounded-xl flex flex-row items-center justify-center space-x-4 mt-7">
                            <img
                                src="https://www.google.com/favicon.ico"
                                alt="Google"
                                className="w-5 h-5"
                            />
                            <span className="text-xs cursor-pointer font-semibold">Continue with Google</span>
                        </div>
                        <div className="p-3 cursor-pointer bg-blue-700 rounded-xl flex flex-row items-center justify-center space-x-4">
                            <img
                                src="https://www.facebook.com/favicon.ico"
                                alt="Facebook"
                                className="w-5 h-5"
                            />
                            <span className="text-xs text-white font-semibold">Continue with Facebook</span>
                        </div>
                    </div>
                    <span className="bg-[#0F1729] text-[#94A3B8] text-sm px-4 py-1 mt-3 mb-3">OR</span>
                    
                    <form onSubmit={handleLogin} className="flex flex-col items-start w-full gap-2">
                        <div className="flex flex-col items-start w-full gap-2">
                            <label className="text-sm text-[#9BB3D6]">Email or Username</label>
                            <input 
                                type="text" 
                                placeholder="e.g motosphere@example.com" 
                                className="bg-[#0A1A3A] text-[#CCCCCC] text-sm w-70 md:w-80 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#2EA8FF]"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
``
                        <div className="flex flex-col items-start w-full mt-6 gap-2">
                            <label className="text-sm text-[#9BB3D6]">Password</label>
                            <div className="relative w-full">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Enter your password" 
                                    className="bg-[#0A1A3A] text-[#CCCCCC] text-sm w-70 md:w-80 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#2EA8FF]"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                                <span
                                    className="absolute right-3 top-2.5 cursor-pointer text-[#334155]"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <AiFillEyeInvisible size={20} /> : <AiFillEye size={20} />}
                                </span>
                            </div>
                        </div>

                        {error && (
                            <div className="w-full mt-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}

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

                            <span className="text-[#22D3EE] text-xs cursor-pointer">Forgot Password?</span>
                        </div>
                        <button  
                            type="submit"
                            className="bg-[#2EA8FF] cursor-pointer text-center text-white text-sm w-full py-3 rounded-xl mt-6 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2596e6] transition-colors"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <div className="flex flex-row mt-4 justify-between w-full md:px-4">
                        <label className="text-[#94A3B8] text-xs">Dont have an account yet?</label>
                        <span className="text-[#22D3EE] text-xs cursor-pointer">Create an account</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login

import React,{ useState } from 'react'
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

import { GoogleIcon } from '../component/svg/GoogleIcon';

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    
    return (
        <div className="h-screen overflow-hidden bg-[url('./component/img/UserLoginCover.png')] bg-[length:100%_100%] bg-no-repeat bg-center">
            <div className="md:h-[100vh] h-screen flex justify-center items-center">
                <div className="bg-[#0F2A52]/85 p-10 flex flex-col max-h-[580px] scrollbar-thin h-screen flex overflow-auto items-center rounded-2xl shadow-[0_0_40px_rgba(0,212,255,0.15)]">
                    <h1 className="font-semibold text-white text-2xl mb-3">Login to MotoSphere</h1>
                    <h2 className="text-xs text-[#94A3B8] text-center leading-[1.5]">Access your ride logs, live tracking, and emergency <br />notifications</h2>

                    <div className="flex flex-col gap-3 w-full">
                        <div className="p-3 bg-white rounded-xl flex flex-row items-center justify-center space-x-4 mt-7">
                            <img
                                src="https://www.google.com/favicon.ico"
                                alt="Google"
                                className="w-5 h-5"
                            />
                            <label className="text-xs font-semibold">Continue with Google</label>
                        </div>
                        <div className="p-3 bg-blue-700 rounded-xl flex flex-row items-center justify-center space-x-4">
                            <img
                                src="https://www.facebook.com/favicon.ico"
                                alt="Facebook"
                                className="w-5 h-5"
                            />
                            <label className="text-xs text-white font-semibold">Continue with Facebook</label>
                        </div>
                    </div>
                    <span className="bg-[#0F1729] text-[#94A3B8] text-sm px-4 py-1 mt-3 mb-3">OR</span>
                    <div className="flex flex-col items-start w-full gap-2">
                        <label className="text-sm text-[#9BB3D6]">Email or Username</label>
                        <input type="text" placeholder="e.g motosphere@example.com" className="bg-[#0A1A3A] text-[#CCCCCC] text-sm w-70 md:w-80 px-4 py-3 rounded-lg"></input>
                    </div>

                    <div className="flex flex-col items-start w-full mt-6 gap-2">
                        <label className="text-sm text-[#9BB3D6]">Password</label>
                        <div className="relative">
                            <input type={showPassword ? "text" : "password"} placeholder="Enter your password" className="bg-[#0A1A3A] text-[#CCCCCC] text-sm w-70 md:w-80 px-4 py-3 rounded-lg"></input>
                            <span
                                className="absolute right-3 top-2.5 cursor-pointer text-[#334155]"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <AiFillEyeInvisible size={20} /> : <AiFillEye size={20} />}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-row mt-4 justify-between w-full">
                        <div className="flex flex-row space-x-3">
                            <input type="checkbox" />
                            <label className="text-[#94A3B8] text-xs">Remember this device</label>
                        </div>
                        <span className="text-[#22D3EE] text-xs">Forgot Password?</span>
                    </div>
                    <button  
                        className="bg-[#2EA8FF] text-center text-white text-sm w-full py-3 rounded-xl mt-6"
                        onClick={() => navigate("/user/home")}
                    >
                        Login
                    </button>

                    <div className="flex flex-row mt-4 justify-between w-full md:px-4">
                        
                        <label className="text-[#94A3B8] text-xs">Dont have an account yet?</label>
                        <span className="text-[#22D3EE] text-xs">Create an account</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login

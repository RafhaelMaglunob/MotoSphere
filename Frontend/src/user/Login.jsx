import React,{ useState } from 'react'
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

import { GoogleIcon } from '../component/svg/GoogleIcon';

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [isChecked, setChecked] = useState(false);
    const navigate = useNavigate();
    
    return (
        <div className="h-screen overflow-hidden bg-[url('./component/img/UserLoginCover.png')] bg-[length:100%_100%] bg-no-repeat bg-center">
            <div className="md:h-[100vh] h-screen flex justify-center items-center">
                <div className="bg-[#0F2A52]/85 p-10 flex flex-col max-h-[480px] scrollbar-thin h-screen flex overflow-auto items-center rounded-2xl shadow-[0_0_40px_rgba(0,212,255,0.15)]">
                    <h1 className="font-semibold text-white text-2xl mb-3">Login to MotoSphere</h1>
                    <h2 className="text-xs text-[#94A3B8] text-center leading-[1.5]">Access your ride logs, live tracking, and emergency <br />notifications</h2>

                    <div className="flex flex-col items-start w-full gap-2 mt-4">
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
                        className="bg-[#2EA8FF] cursor-pointer text-center text-white text-sm w-full py-3 rounded-xl mt-6"
                        onClick={() => navigate("/user/home")}
                    >
                        Login
                    </button>

                    <div className="flex flex-row mt-4 justify-between w-full md:px-4">
                        
                        <label className="text-[#94A3B8] text-xs">Dont have an account yet?</label>
                        <button onClick={() => navigate("/user-register")} className="text-[#22D3EE] text-xs cursor-pointer">Create an account</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login

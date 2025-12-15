import React,{ useState } from 'react'
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

import Shield from "../component/img/Shield.png"

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    
    return (
        <div className="h-screen overflow-hidden bg-[url('./component/img/AdminLogin.png')] bg-[length:100%_100%] bg-no-repeat bg-center">
            <div className="md:h-[100vh] h-screen flex justify-center items-center">
                <div className="bg-[#0F2A52]/85 p-10 flex flex-col items-center rounded-2xl">
                    <span className="text-[#22D3EE] text-sm px-10 py-2 bg-[#06B6D4]/10 rounded-[50px]">⬤ Admin Portal</span>
                    <img src={Shield} alt="Shield" className="w-20 h-20" />
                    <h1 className="font-bold text-white text-xl">Admin Login</h1>
                    <p className="text-xs text-[#9BB3D6]">Secure access for system administrators</p>

                    <div className="flex flex-col items-start w-full mt-6 gap-2">
                        <label className="text-sm text-[#9BB3D6]">Email or Username</label>
                        <input type="text" placeholder="admin@motosphere.com" className="bg-[#0A1A3A] text-[#CCCCCC] text-sm w-70 md:w-80 px-4 py-3 rounded-lg"></input>
                    </div>

                    <div className="flex flex-col items-start w-full mt-6 gap-2">
                        <label className="text-sm text-[#9BB3D6]">Password</label>
                        <div className="relative">
                            <input type={showPassword ? "text" : "password"} placeholder="Enter admin password" className="bg-[#0A1A3A] text-[#CCCCCC] text-sm w-70 md:w-80 px-4 py-3 rounded-lg"></input>
                            <span
                                className="absolute right-3 top-2.5 cursor-pointer text-[#334155]"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <AiFillEyeInvisible size={20} /> : <AiFillEye size={20} />}
                            </span>
                        </div>
                    </div>
                    <button  
                        className="bg-[#2EA8FF] text-center text-white text-sm w-full py-3 rounded-xl mt-6"
                        onClick={() => navigate("/dashboard")}
                    >
                        Sign in as Admin
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Login

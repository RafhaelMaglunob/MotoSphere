import React,{ useState } from 'react'
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

import Shield from "../component/img/Shield.png"

function Login() {
    const [showPassword, setShowPassword] = useState(false);
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
            // Check Users collection for users with role: "admin"
            const usersRef = collection(db, "Users");
            const snapshot = await getDocs(usersRef);

            let matchedAdmin = null;
            const enteredId = username.trim().toLowerCase();
            const enteredPassword = String(password);

            snapshot.forEach((doc) => {
                const data = doc.data();

                // Check if user has admin role
                const userRole = String(data.role || data.Role || "").toLowerCase();
                if (userRole !== "admin") {
                    return; // Skip non-admin users
                }

                // Be flexible with field names and casing
                const docUsername = (data.Username || data.username || "").toLowerCase();
                const docEmail = (data.Email || data.email || "").toLowerCase();
                const docPassword = String(data.Password || data.password || "");

                const idMatch =
                    docUsername === enteredId || docEmail === enteredId;
                const passwordMatch = docPassword === enteredPassword;

                if (idMatch && passwordMatch) {
                    matchedAdmin = { id: doc.id, ...data };
                }
            });

            if (matchedAdmin) {
                // Save admin session so AdminRoute sees them as admin
                localStorage.setItem(
                    "currentUser",
                    JSON.stringify({
                        id: matchedAdmin.id,
                        username: matchedAdmin.Username || matchedAdmin.Email,
                        email: matchedAdmin.Email,
                        userType: "admin",
                        role: "admin",
                        ...matchedAdmin,
                    }),
                );

                // Successful login - navigate to admin dashboard
                navigate("/admin/dashboard", { replace: true });
            } else {
                // Show error message
                setError("Invalid admin username/email or password.");
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            console.error('Admin login error:', err);
        } finally {
            setIsLoading(false);
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

                    <form onSubmit={handleLogin} className="flex flex-col items-start w-full mt-6 gap-2">
                        <div className="flex flex-col items-start w-full gap-2">
                            <label className="text-sm text-[#9BB3D6]">Email or Username</label>
                            <input 
                                type="text" 
                                placeholder="admin@motosphere.com" 
                                className="bg-[#0A1A3A] text-[#CCCCCC] text-sm w-70 md:w-80 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#2EA8FF]"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="flex flex-col items-start w-full mt-6 gap-2">
                            <label className="text-sm text-[#9BB3D6]">Password</label>
                            <div className="relative w-full">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Enter admin password" 
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

                        <button  
                            type="submit"
                            className="bg-[#2EA8FF] text-center text-white text-sm w-full py-3 rounded-xl mt-6 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2596e6] transition-colors"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign in as Admin'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login

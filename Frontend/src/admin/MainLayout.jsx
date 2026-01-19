import React, { useState, useEffect } from 'react'
import { Outlet, useLocation, Navigate } from "react-router-dom";
import Sidebar from '../component/ui/Sidebar'
import Topbar from '../component/ui/Topbar'
import { useNavigate } from 'react-router-dom';

import MotoSphere_Logo from '../component/img/MotoSphere Logo.png'
import { DashboardIcon } from '../component/svg/DashboardIcon.jsx';
import { UsersIcon } from '../component/svg/UsersIcon.jsx';
import { DevicesIcon } from '../component/svg/DevicesIcon.jsx';
import { SettingsIcon } from '../component/svg/SettingsIcon.jsx';

import { Shield } from "../component/svg/Shield.jsx";
import { ProfileIconOutline } from '../component/svg/ProfileIconOutline.jsx';
import Logout from "../component/img/Logout.png";

function MainLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [showSidebar, setShowSidebar] = useState(false);
    const [adminName, setAdminName] = useState("Admin User");
    const [adminEmail, setAdminEmail] = useState("");
    
    // Check if user is authenticated and is admin
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    
    if (!token || !userData) {
        return <Navigate to="/admin-login" replace />;
    }

    let user;
    try {
        user = JSON.parse(userData);
        if (user.role !== 'admin') {
            // Not an admin, clear data and redirect
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            return <Navigate to="/admin-login" replace />;
        }
    } catch (error) {
        console.error("Error parsing admin data:", error);
        return <Navigate to="/admin-login" replace />;
    }

    // Load admin data from localStorage on mount
    useEffect(() => {
        if (user) {
            setAdminName(user.username || "Admin User");
            setAdminEmail(user.email || "");
        }
    }, [user]);

    const buttons = [
        {icon: DashboardIcon, name: "Dashboard", path: "/admin/dashboard"}, 
        {icon: UsersIcon, name: "Users", path: "/admin/users"},
        {icon: DevicesIcon, name: "Devices", path: "/admin/devices"},
        {icon: SettingsIcon, name: "Settings", path: "/admin/settings"}
    ]

    const activeButton = buttons.find(
        btn => location.pathname.startsWith(btn.path)
    )?.name;

    const footer = (
        <div className="flex flex-col px-5 mt-auto">
            <div className="flex gap-2 items-center">
                <span className="bg-[#06B6D4]/20 rounded-full p-2">
                <Shield className="w-5 h-5 text-[#22D3EE]" />
                </span>
                <div className="flex flex-col justify-center">
                <h1 className="text-white text-sm font-bold">{adminName}</h1>
                <h4 className="text-[#9BB3D6] text-xs">Super Admin</h4>
                </div>
            </div>

            <div className="text-[#F87171] text-sm flex gap-3 mt-5 pb-6 cursor-pointer">
                <img src={Logout} alt="Logout" />
                <h1 onClick={() => {
                    // Clear admin data from localStorage
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate('/admin-login');
                }}>Log Out</h1>
            </div>
        </div>
    )

    return (
        <div className="bg-[#0A1A3A] flex flex-row min-h-screen">
            <Sidebar 
                buttons={buttons} 
                showSidebar={showSidebar}
                setShowSidebar={setShowSidebar} 
                className="absolute w-20 md:flex"
                footer={footer}
            >
                <div className="flex flex-row space-x-4 items-center mb-7 p-3">
                    <img src={MotoSphere_Logo}  className="w-24 h-24" alt="MotoSphere Logo" />
                    <h1 className="text-white text-lg font-bold">Admin Portal</h1>
                </div>
                
            </Sidebar>
            
            {/*Content like Dashboard,  Users, Devices, Settings*/}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <Topbar
                    onBurgerClick={() => setShowSidebar(true)}
                    bgColor="#050816"
                    height={60}
                >
                    <div className="flex flex-row justify-between w-full place-items-center">
                        <span className="text-white font-semibold text-sm">
                            {activeButton || "Dashboard"}
                        </span>
                        <div className="flex flex-row items-center gap-3">
                            <div className="flex flex-col">
                                <span className="text-white text-[12px] font-semibold">{adminName}</span>
                                <span className="text-[#9BB3D6] text-[11px] font-light">Admin</span>
                            </div>
                            <div className="bg-[#0F2A52] p-2 rounded-3xl"> 
                                <ProfileIconOutline className="text-[#39A9FF]" />
                            </div>
                        </div>
                    </div>
                </Topbar>

                {/* Content */}
                <main className="flex-1 p-6 overflow-x-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default MainLayout
import React, { useState } from 'react'
import { Outlet } from "react-router-dom";
import Sidebar from '../component/ui/Sidebar'
import Topbar from '../component/ui/Topbar'

import MotoSphere_Logo from '../component/img/MotoSphere Logo.png'
import { DashboardIcon } from '../component/svg/DashboardIcon.jsx';
import { UsersIcon } from '../component/svg/UsersIcon.jsx';
import { DevicesIcon } from '../component/svg/DevicesIcon.jsx';
import { SettingsIcon } from '../component/svg/SettingsIcon.jsx';

import { Shield } from "../component/svg/Shield.jsx";
import Logout from "../component/img/Logout.png";

function MainLayout() {
    const [showSidebar, setShowSidebar] = useState(false);
    const buttons = [
        {icon: DashboardIcon, name: "Home", path: "/user/home"}, 
        {icon: UsersIcon, name: "Contact Persons", path: "/user/contact-persons"},
        {icon: DevicesIcon, name: "Notifications", path: "/user/notifications"},
        {icon: SettingsIcon, name: "Settings", path: "/user/settings"}
    ]

    const footer = (
        <div className="flex flex-col mt-auto px-5">
            <div className="text-[#F87171] text-sm flex gap-3 pb-6 cursor-pointer">
                <img src={Logout} alt="Logout" />
                <h1>Log Out</h1>
            </div>
        </div>

    )

    return (
        <div className="bg-[#0A1A3A] flex flex-row min-h-screen">
            <Sidebar 
                width={260} 
                buttons={buttons} 
                showSidebar={showSidebar}
                setShowSidebar={setShowSidebar} 
                className="absolute w-20 md:flex"
                footer={footer}
            >
                <div className="flex flex-col space-x-4 items-center mb-7 p-3">
                    
                    <img src={MotoSphere_Logo} alt="MotoSphere Logo" />
                    <h1 className="text-white text-lg font-bold">MotoSphere</h1>
                </div>
            </Sidebar>
            
            {/*Content like Dashboard,  Users, Devices, Settings*/}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <Topbar
                    onBurgerClick={() => setShowSidebar(true)}
                    isMdHidden={true}
                />

                {/* Content */}
                <main className="flex-1 p-6 overflow-x-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default MainLayout
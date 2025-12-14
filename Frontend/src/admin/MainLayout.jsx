import React from 'react'

import Sidebar from '../component/ui/Sidebar'

import MotoSphere_Logo from '../component/img/MotoSphere Logo.png'
import { DashboardIcon } from '../component/svg/DashboardIcon.jsx';
import { UsersIcon } from '../component/svg/UsersIcon.jsx';
import { DevicesIcon } from '../component/svg/DevicesIcon.jsx';
import { SettingsIcon } from '../component/svg/SettingsIcon.jsx';


function MainLayout() {
    const buttons = [
        {icon: DashboardIcon, name: "Dashboard", path: "/dashboard"}, 
        {icon: UsersIcon, name: "Users", path: "/users"},
        {icon: DevicesIcon, name: "Devices", path: "/devices"},
        {icon: SettingsIcon, name: "Settings", path: "/settings"}
    ]
    return (
        <div className="bg-[#0A1A3A] flex flex-row">
            <Sidebar width={260} buttons={buttons}>
                <div className="flex flex-row space-x-4 items-center mb-7 p-3">
                    
                    <img src={MotoSphere_Logo} alt="MotoSphere Logo" />
                    <h1 className="text-white text-lg font-bold">Admin Portal</h1>
                </div>
            </Sidebar>
            
        </div>
    )
}

export default MainLayout

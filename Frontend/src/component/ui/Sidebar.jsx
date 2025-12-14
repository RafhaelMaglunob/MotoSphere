import React from "react";
import { Link } from "react-router-dom";

import { Shield } from '../svg/Shield.jsx'
import Logout from '../img/Logout.png'

{/* The variable inside the '{}' are those the value will be used on the UI of Sidebar */}
function Sidebar({ width = 200, buttons = [], bgColor = "#050816", children }) {
    return (
        <div
            className="h-screen overflow-y-auto p-2 flex flex-col justify-between"
            style={{ width: `${width}px`, backgroundColor: bgColor }}
        >   
        
            {/* Top */}
            <div>
                {/* 'children' refers to the content of the Sidebar */}
                {children}

                {buttons.map((btn, index) => (
                    <Link
                        key={index}
                        to={btn.path}
                        className="block p-4 text-[#9BB3D6] hover:bg-[#06B6D4]/10 hover:text-[#22D3EE] focus:bg-[#06B6D4]/20 focus:text-[#22D3EE] rounded-xl flex flex-row gap-4"
                    >
                        <btn.icon/>
                        {btn.name}
                    </Link>
                ))}
            </div>
            
            {/* Bottom */}
            <div className="flex flex-col px-5">
                {/* Admin Username and Roles */}
                <div className="flex flex-row gap-2">
                    <span className="bg-[#06B6D4]/20 rounded-[50px] p-2">
                        <Shield className="w-5 h-5 rounded-[50px] text-[#22D3EE]"/>

                    </span>
                    <div className="flex flex-col justify-center">
                        <h1 className="text-white text-sm font-bold">Admin User</h1>
                        <h4 className="text-[#9BB3D6] text-xs">Super Admin</h4>
                    </div>
                </div>
                
                {/* Logout Button */}
                <div className="text-[#F87171] text-sm flex flex-row gap-3 mt-5 mb-3">
                    <img src={Logout} />
                    <h1>Log Out</h1>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;

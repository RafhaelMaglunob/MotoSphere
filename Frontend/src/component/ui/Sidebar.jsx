import React from "react";
import { Link } from "react-router-dom";
import { AiOutlineClose } from "react-icons/ai";

import { Shield } from "../svg/Shield.jsx";
import Logout from "../img/Logout.png";

function Sidebar({ width = 200, buttons = [], bgColor = "#050816", showSidebar, setShowSidebar, children }) {
    return (
        <>
            {/* Overlay for mobile */}
            {showSidebar && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setShowSidebar(false)}
                />
            )}

            <div
                className={`fixed top-0 left-0 min-h-screen z-40 transform transition-transform duration-300 justify-between
                ${showSidebar ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:relative md:block`}
                style={{ width: `${width}px`, backgroundColor: bgColor }}
            >
                {/* Close button on mobile */}
                <AiOutlineClose
                    className="block md:hidden text-white text-xl cursor-pointer m-4"
                    onClick={() => setShowSidebar(false)}
                />

                <div className="flex flex-col h-full overflow-hidden justify-between">

                    {/* Top */}
                    <div>
                        {children}

                        {buttons.map((btn, index) => (
                            <Link
                                key={index}
                                to={btn.path}
                                className="block p-4 text-[#9BB3D6] hover:bg-[#06B6D4]/10 hover:text-[#22D3EE] rounded-xl flex gap-4"
                                onClick={() => setShowSidebar(false)} // auto-close on mobile
                            >
                                <btn.icon />
                                {btn.name}
                            </Link>
                        ))}
                    </div>

                    {/* Bottom */}
                    <div className="flex flex-col px-5 mt-20 md:mt-0">
                        <div className="flex gap-2 items-center">
                            <span className="bg-[#06B6D4]/20 rounded-full p-2">
                                <Shield className="w-5 h-5 text-[#22D3EE]" />
                            </span>
                            <div className="flex flex-col justify-center">
                                <h1 className="text-white text-sm font-bold">Admin User</h1>
                                <h4 className="text-[#9BB3D6] text-xs">Super Admin</h4>
                            </div>
                        </div>

                        <div className="text-[#F87171] text-sm flex gap-3 mt-5 pb-6 cursor-pointer">
                            <img src={Logout} />
                            <h1>Log Out</h1>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Sidebar;

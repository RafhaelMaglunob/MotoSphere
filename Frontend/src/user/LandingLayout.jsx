import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink } from "react-router-dom";
import Sidebar from '../component/ui/Sidebar';
import Topbar from '../component/ui/Topbar';
import MotoSphere_Logo from '../component/img/MotoSphere Logo.png';
import { FiLogIn } from "react-icons/fi";
import { ProfileIcon } from '../component/svg/ProfileIcon';

function LandingLayout() {
    const [showSidebar, setShowSidebar] = useState(false);
    const [isProfileOpen, setProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const buttons = [
        { name: "Home", path: "/home" },
        { name: "About Us", path: "/about-us" },
        { name: "Why Motosphere", path: "/why-motosphere" },
        { name: "Hardware Video", path: "/hardware-video" }
    ];

    const footerContent = (
        <div className="flex flex-col px-5">
            <div className="text-green-500 text-sm flex gap-3 mt-5 pb-6 cursor-pointer">
                <FiLogIn className="w-6 h-6 text-green-500" />
                <h1>Login</h1>
            </div>
        </div>
    );

    return (
        <div className="relative min-h-screen flex flex-col">

            {/* Fixed background image with gradient overlay */}
            <div className="absolute inset-0 bg-[url('./component/img/LandingCover.png')] bg-cover bg-center bg-fixed" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0A0E27] sm:hidden" />

            {/* Content wrapper */}
            <div className="relative flex-1 flex flex-col justify-between">

                {/* Header for desktop */}
                <div className="md:flex hidden flex-row items-center justify-between px-16 py-4">
                    <div className="flex flex-row items-center gap-2">
                        <img src={MotoSphere_Logo} alt="MotoSphere" />
                        <h1 className="text-white text-xl font-bold">MotoSphere</h1>
                    </div>
                    <nav className="flex flex-row gap-8 text-white text-lg font-semibold">
                        {buttons.map((btn, idx) => (
                            <NavLink
                                key={idx}
                                to={btn.path}
                                className={({ isActive }) =>
                                    `transition outline-0 ${isActive ? "text-[#22D3EE]" : "hover:text-blue-300"}`
                                }
                            >
                                {btn.name}
                            </NavLink>
                        ))}
                    </nav>
                    <div ref={dropdownRef} className="flex flex-col">
                        <ProfileIcon onClick={() => setProfileOpen((prev) => !prev)} className="text-white w-8 h-8 cursor-pointer" />
                        <div 
                            className={`
                                ${isProfileOpen ? "absolute" : "hidden"} 
                                p-3 w-40 h-fit bg-white mt-10 ml-[-160px]`
                            }
                        >
                            <NavLink to="/user-login" className="hover:text-green-400 tracking-wider">Login</NavLink>
                        </div>
                    </div>
                </div>

                {/* Sidebar for mobile */}
                <Sidebar
                    width={260}
                    buttons={buttons}
                    showSidebar={showSidebar}
                    setShowSidebar={setShowSidebar}
                    className="absolute w-20 md:hidden"
                    bgColor="#231232"
                    footer={footerContent}
                    isMdHidden={true}
                >
                    <div className="flex justify-center items-center">
                        <img src={MotoSphere_Logo} alt="MotoSphere Logo" />
                    </div>
                </Sidebar>

                {/* Main content */}
                <div className="flex-1 flex flex-col min-w-0">
                    <Topbar
                        onBurgerClick={() => setShowSidebar(true)}
                        isMdHidden={true}
                        bgColor="transparent"
                    />

                    <main className="flex-1 p-6 overflow-y-auto">
                        <Outlet />
                    </main>
                </div>

                {/* Footer */}
                <footer className="text-white p-4 text-center bg-[#0A0E27]">
                    © 2025 MotoSphere. All rights reserved.
                </footer>

            </div>
        </div>
    );
}

export default LandingLayout;

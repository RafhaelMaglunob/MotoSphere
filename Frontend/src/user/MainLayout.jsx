import React, { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate, Navigate } from "react-router-dom";
import Sidebar from '../component/ui/Sidebar'
import Topbar from '../component/ui/Topbar'
import { authAPI, settingsAPI } from '../services/api';

import MotoSphere_Logo from '../component/img/MotoSphere Logo.png'
import { DashboardIcon } from '../component/svg/DashboardIcon.jsx';
import { UsersIcon } from '../component/svg/UsersIcon.jsx';
import { DevicesIcon } from '../component/svg/DevicesIcon.jsx';
import { SettingsIcon } from '../component/svg/SettingsIcon.jsx';
import { InfoCircle } from '../component/svg/InfoCircleIcon';

import { ProfileIconOutline } from '../component/svg/ProfileIconOutline.jsx';
import Logout from "../component/img/Logout.png";
import ConfirmModal from "../component/modal/ConfirmModal.jsx";

function formatLastSynced(minutesAgo) {
    if (minutesAgo < 1) return "Just now";
    if (minutesAgo < 60) return `${minutesAgo} min${minutesAgo !== 1 ? "s" : ""} ago`;

    const hours = Math.floor(minutesAgo / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
}

function MainLayout() {
    const [isLight, setIsLight] = useState(() => {
        const saved = localStorage.getItem("isLight");
        return saved ? JSON.parse(saved) : false;
    })

    const navigate = useNavigate();
    const [showSidebar, setShowSidebar] = useState(false);
    const location = useLocation();
    const initialUser = (() => {
        try {
            const s = localStorage.getItem("user");
            if (!s) return { username: "", email: "" };
            const u = JSON.parse(s);
            return {
                username: u?.username || "",
                email: u?.email || ""
            };
        } catch {
            return { username: "", email: "" };
        }
    })();
    const [username, setUsername] = useState(initialUser.username)
    const [email, setEmail] = useState(initialUser.email)
    const [contacts, setContacts] = useState([])
    const deviceNo = "MK-II"
    const lastSynced = "2"
    const isConnected = false
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [announcements, setAnnouncements] = useState([]);

    // Load user data from localStorage on mount and check role
    useEffect(() => {
        const userData = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!token || !userData) {
            // No token or user data, redirect to login
            navigate('/user-login', { replace: true });
            return;
        }

        try {
            const user = JSON.parse(userData);

            // If user is admin, redirect to admin dashboard
            if (user.role === 'admin') {
                navigate('/admin/dashboard', { replace: true });
                return;
            }

            // Refresh user data from server to get latest profile picture
            const refreshUserData = async () => {
                try {
                    const response = await authAPI.getProfile();
                    if (response.success && response.user) {
                        // Update localStorage with fresh data
                        localStorage.setItem("user", JSON.stringify(response.user));
                        setUsername(response.user.username || "");
                        setEmail(response.user.email || "");
                    }
                } catch (error) {
                    console.error("Error refreshing user data:", error);
                    // Continue with cached data if refresh fails
                }
            };
            refreshUserData();
        } catch (error) {
            console.error("Error parsing user data:", error);
            navigate('/user-login', { replace: true });
        }
    }, [navigate]);

    // Fetch contacts from API
    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const response = await authAPI.getContacts();
                if (response.success) {
                    setContacts(response.contacts || []);
                }
            } catch (error) {
                console.error("Error fetching contacts:", error);
                // Set empty array on error
                setContacts([]);
            }
        };

        // Only fetch if user is authenticated
        const token = localStorage.getItem("token");
        if (token) {
            fetchContacts();
        }
    }, []);

    // Persist theme preference (must run unconditionally before any early returns)
    useEffect(() => {
        localStorage.setItem("isLight", JSON.stringify(isLight));
    }, [isLight]);

    // Load public broadcasts for signed-in users (via backend API)
    useEffect(() => {
        const loadBroadcasts = async () => {
            try{
                const res = await settingsAPI.getPublicBroadcasts();
                if (res.success) setAnnouncements(res.broadcasts || []);
            }catch(e){
                console.warn('Announcements load failed:', e?.message || e);
            }
        };
        const token = localStorage.getItem("token");
        if (token) loadBroadcasts();
    }, []);
    // Check if user is authenticated and not admin
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!token || !userData) {
        return <Navigate to="/user-login" replace />;
    }
    let user;
    try {
        user = JSON.parse(userData);
    } catch {
        user = null;
    }
    if (!user) {
        return <Navigate to="/user-login" replace />;
    }
    if (user.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
    }

    const sensors = [
        { type: "Accelerometer", connection: "Active" },
        { type: "Gyroscope", connection: "Inactive" },
        { type: "Camera", connection: "Active" },
    ]

    const buttons = [
        { icon: DashboardIcon, name: "Home", path: "/user/home" },
        { icon: UsersIcon, name: "Contact Persons", path: "/user/contact-persons" },
        { icon: DevicesIcon, name: "Notifications", path: "/user/notifications" },
        { icon: InfoCircle, name: "Announcements", path: "/user/announcements" },
        { icon: SettingsIcon, name: "Settings", path: "/user/settings" }
    ]

    // Notifications - will be populated from API/database in the future
    const notifications = [];

    const activeButton = buttons.find(
        btn => location.pathname.startsWith(btn.path)
    )?.name;

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/user-login")
    }

    const footer = (
        <div className="flex flex-col mt-auto px-5">
            <div className={`${isLight ? "font-bold" : ""}  text-[#F87171] text-sm flex gap-3 pb-6 cursor-pointer`}>
                <img src={Logout} alt="Logout" />
                <h1 onClick={() => setShowLogoutConfirm(true)}>Log Out</h1>
            </div>
        </div>
    )

    return (
        <div className={`${isLight ? "bg-[#F1F1F1]" : "bg-[#0A1A3A]"} flex flex-row min-h-screen`}>
            <Sidebar
                buttons={buttons}
                bgColor={isLight ? '#FFFFFF' : '#050816'}
                showSidebar={showSidebar}
                isLight={isLight}
                setShowSidebar={setShowSidebar}
                className="absolute w-auto md:flex"
                footer={footer}
            >
                <div className="flex flex-col items-center mb-7 p-3">
                    <img src={MotoSphere_Logo} className="w-16 h-16 object-contain mb-2" alt="MotoSphere Logo" />
                    <h1 className={`text-lg font-bold ${isLight ? "text-black" : "text-white"}`}>MotoSphere</h1>
                </div>
            </Sidebar>

            <div className="flex-1 flex flex-col min-w-0">
                <Topbar
                    onBurgerClick={() => setShowSidebar(true)}
                    bgColor={isLight ? "#FFF" : '#050816'}
                    isLight={isLight}
                    height={60}
                >
                    <div className="flex flex-row justify-between w-full place-items-center">
                        <span className={`${isLight ? "text-black" : "text-white"} font-semibold text-sm`}>
                            {activeButton}
                        </span>
                        <div className="flex flex-row items-center gap-3">
                            <div className="flex flex-col">
                                <span className={`${isLight ? "text-black" : "text-white"} text-[12px] font-semibold`}>{username}</span>
                                <span className={`${isLight ? "text-black/70" : "text-[#9BB3D6]"} text-[11px] font-light`}>Rider</span>
                            </div>
                            <div className={`${isLight ? "bg-[#F1F1F1]" : "bg-[#0F2A52]"} p-2 rounded-3xl`}>
                                <ProfileIconOutline className="text-[#39A9FF]" />
                            </div>
                        </div>
                    </div>
                </Topbar>

                {/* Dito natin inalis ang web-fade-in class para hindi magkaroon ng double animation 
                    kapag ang bata (UserHome) ay may sariling animation na */}
                <main className="flex-1 p-6 overflow-x-hidden">
                    {announcements.length > 0 && (
                        <div className={`${isLight ? "bg-[#E8F4FF] text-black" : "bg-[#0F2A52] text-white"} p-4 rounded-lg mb-4`}>
                            <div className="font-semibold">{announcements[0].title}</div>
                            <div className="text-sm opacity-90">{announcements[0].body}</div>
                            <div className="flex items-center justify-between mt-2">
                                <div className="text-xs opacity-70">{announcements[0].createdAt ? new Date(announcements[0].createdAt).toLocaleString() : ''}</div>
                                <button
                                    onClick={() => { window.location.href = '/user/announcements'; }}
                                    className={`${isLight ? "text-[#0A1A3A]" : "text-[#2EA8FF]"} text-xs underline`}
                                >
                                    View all
                                </button>
                            </div>
                        </div>
                    )}
                    <Outlet context={{
                        username: username,
                        setUsername: setUsername,
                        email: email,
                        setEmail: setEmail,
                        deviceNo: deviceNo,
                        lastSynced: formatLastSynced(lastSynced),
                        isConnected: isConnected,
                        sensors: sensors,
                        contacts: contacts,
                        setContacts: setContacts,
                        notifications: notifications,
                        isLight,
                        setIsLight
                    }} />
                </main>
            </div>
            <ConfirmModal
                isOpen={showLogoutConfirm}
                message="Would you like to logout?"
                confirmLabel="Log Out"
                onConfirm={() => {
                    handleLogout();
                    setShowLogoutConfirm(false);
                }}
                onCancel={() => setShowLogoutConfirm(false)}
            />
        </div>
    )
}

export default MainLayout

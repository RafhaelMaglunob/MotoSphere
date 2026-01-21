import React, { useState, useEffect } from 'react'
import { Outlet } from "react-router-dom";
import Sidebar from '../component/ui/Sidebar'
import Topbar from '../component/ui/Topbar'
import { useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';

import MotoSphere_Logo from '../component/img/MotoSphere Logo.png'
import { DashboardIcon } from '../component/svg/DashboardIcon.jsx';
import { UsersIcon } from '../component/svg/UsersIcon.jsx';
import { DevicesIcon } from '../component/svg/DevicesIcon.jsx';
import { SettingsIcon } from '../component/svg/SettingsIcon.jsx';

import { Shield } from "../component/svg/Shield.jsx";
import Logout from "../component/img/Logout.png";

function MainLayout() {
    const navigate = useNavigate();
    const [showSidebar, setShowSidebar] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const buttons = [
        {icon: DashboardIcon, name: "Dashboard", path: "/admin/dashboard"}, 
        {icon: UsersIcon, name: "Users", path: "/admin/users"},
        {icon: DevicesIcon, name: "Devices", path: "/admin/devices"},
        {icon: SettingsIcon, name: "Settings", path: "/admin/settings"}
    ]

    // Fetch current user data and handle authentication
    useEffect(() => {
        // Check if user is authenticated via JWT token (from SSO or backend login)
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                // Check if user has admin role
                if (user.role === 'admin') {
                    // User is authenticated via backend JWT token and is admin
                    setUserData({
                        name: user.username || user.email?.split('@')[0] || 'Admin User',
                        role: 'admin',
                        email: user.email
                    });
                    setLoading(false);
                    return;
                }
            } catch (error) {
                console.error('Error parsing user data from localStorage:', error);
            }
        }

        // If no JWT token, check Firebase Auth (for admin login page)
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                // User is not authenticated via Firebase Auth either
                // Check again for JWT token as a fallback
                const token = localStorage.getItem('token');
                const userStr = localStorage.getItem('user');
                
                if (token && userStr) {
                    try {
                        const userData = JSON.parse(userStr);
                        if (userData.role === 'admin') {
                            setUserData({
                                name: userData.username || userData.email?.split('@')[0] || 'Admin User',
                                role: 'admin',
                                email: userData.email
                            });
                            setLoading(false);
                            return;
                        }
                    } catch (error) {
                        console.error('Error parsing user data:', error);
                    }
                }
                
                // No authentication found, redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/admin-login', { replace: true });
                setLoading(false);
                return;
            }

            try {
                // Try to get user document by UID first
                let userDoc = null;
                let userInfo = null;

                const userDocByUid = doc(db, 'users', user.uid);
                const uidDocSnap = await getDoc(userDocByUid);
                
                if (uidDocSnap.exists()) {
                    userDoc = uidDocSnap;
                    userInfo = uidDocSnap.data();
                } else {
                    // If document doesn't exist by UID, try to find by email
                    const usersRef = collection(db, 'users');
                    const q = query(usersRef, where('email', '==', user.email?.toLowerCase().trim()));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        userDoc = querySnapshot.docs[0];
                        userInfo = userDoc.data();
                    }
                }

                // Check if user has admin role
                if (!userInfo || userInfo.role?.toLowerCase() !== 'admin') {
                    // Not an admin, sign out and redirect
                    await signOut(auth);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/admin-login', { replace: true });
                    setLoading(false);
                    return;
                }

                if (userInfo) {
                    setUserData(userInfo);
                } else {
                    // Fallback to Firebase Auth user data
                    setUserData({
                        name: user.displayName || user.email?.split('@')[0] || 'Admin User',
                        role: 'admin',
                        email: user.email
                    });
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                // On error, sign out and redirect
                try {
                    await signOut(auth);
                } catch (signOutError) {
                    console.error('Error signing out:', signOutError);
                }
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/admin-login', { replace: true });
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [navigate]);

    const footer = (
        <div className="flex flex-col px-5 mt-auto">
            <div className="flex gap-2 items-center">
                <span className="bg-[#06B6D4]/20 rounded-full p-2">
                <Shield className="w-5 h-5 text-[#22D3EE]" />
                </span>
                <div className="flex flex-col justify-center">
                    {loading ? (
                        <>
                            <h1 className="text-white text-sm font-bold">Loading...</h1>
                            <h4 className="text-[#9BB3D6] text-xs">Please wait</h4>
                        </>
                    ) : (
                        <>
                            <h1 className="text-white text-sm font-bold">
                                {userData?.name || 'Admin User'}
                            </h1>
                            <h4 className="text-[#9BB3D6] text-xs capitalize">
                                {userData?.role || 'Admin'}
                            </h4>
                        </>
                    )}
                </div>
            </div>

            <div className="text-[#F87171] text-sm flex gap-3 mt-5 pb-6 cursor-pointer">
                <img src={Logout} alt="Logout" />
                <h1 onClick={async () => {
                    try {
                        await signOut(auth);
                        // Clear any local storage if needed
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        // Redirect to login page
                        navigate('/user-login', { replace: true });
                    } catch (error) {
                        console.error('Logout error:', error);
                        // Even if signOut fails, redirect to login
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        navigate('/user-login', { replace: true });
                    }
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
import React, { useState, useEffect } from 'react'
import { Outlet } from "react-router-dom";
import Sidebar from '../component/ui/Sidebar'
import Topbar from '../component/ui/Topbar'
import { useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';
import { authAPI } from '../services/api';

import MotoSphere_Logo from '../component/img/MotoSphere Logo.png'
import { DashboardIcon } from '../component/svg/DashboardIcon.jsx';
import { UsersIcon } from '../component/svg/UsersIcon.jsx';
import { DevicesIcon } from '../component/svg/DevicesIcon.jsx';
import { SettingsIcon } from '../component/svg/SettingsIcon.jsx';

import { Shield } from "../component/svg/Shield.jsx";
import Logout from "../component/img/Logout.png";
import ConfirmModal from "../component/modal/ConfirmModal.jsx";

// Change Logs Icon component
const ChangeLogsIcon = ({ className }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

function MainLayout() {
    const navigate = useNavigate();
    const [showSidebar, setShowSidebar] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    
    const buttons = [
        {icon: DashboardIcon, name: "Dashboard", path: "/admin/dashboard"}, 
        {icon: UsersIcon, name: "Users", path: "/admin/users"},
        {icon: DevicesIcon, name: "Devices", path: "/admin/devices"},
        {icon: ChangeLogsIcon, name: "Change Logs", path: "/admin/changelogs"},
        {icon: SettingsIcon, name: "Settings", path: "/admin/settings"}
    ]

    // Fetch current user data and handle authentication
    useEffect(() => {
        // Always require Firebase Auth for admin pages to ensure Firestore access
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                // Try to bootstrap Firebase session from existing SSO backend session
                try {
                    const token = localStorage.getItem('token');
                    const userStr = localStorage.getItem('user');
                    if (token && userStr) {
                        const parsed = JSON.parse(userStr);
                        if (parsed?.role === 'admin') {
                            // Ask backend for a Firebase custom token and sign into Firebase
                            const { customToken, token: altToken, success } = await authAPI.adminGetFirebaseCustomToken();
                            const firebaseToken = customToken || altToken;
                            if (firebaseToken) {
                                await signInWithCustomToken(auth, firebaseToken);
                                // Let onAuthStateChanged fire again after sign-in
                                return;
                            } else if (success === false) {
                                // fall through to redirect
                            }
                        }
                    }
                } catch (e) {
                    console.warn('Failed to auto-link SSO to Firebase:', e?.message || e);
                }
                // Redirect to admin login if no Firebase session and auto-link failed
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
                <h1 onClick={() => setShowLogoutConfirm(true)}>Log Out</h1>
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
                <div className="w-full flex justify-center items-center mb-7 p-3">
                    <img src={MotoSphere_Logo} className="w-24 h-24" alt="MotoSphere Logo" />
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
            <ConfirmModal
                isOpen={showLogoutConfirm}
                message="Would you like to logout?"
                confirmLabel="Log Out"
                onConfirm={async () => {
                    try {
                        await signOut(auth);
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        navigate('/user-login', { replace: true });
                    } catch {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        navigate('/user-login', { replace: true });
                    } finally {
                        setShowLogoutConfirm(false);
                    }
                }}
                onCancel={() => setShowLogoutConfirm(false)}
            />
        </div>
    )
}

export default MainLayout

import React, { useState } from 'react'
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';

import Shield from "../component/img/Shield.png"

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email || !password) {
            setError('Please enter both email and password');
            setLoading(false);
            return;
        }

        try {
            // Check if Firebase is initialized
            if (!auth || !db) {
                setError('Firebase is not initialized. Please check your Firebase configuration.');
                setLoading(false);
                return;
            }

            console.log('Attempting to sign in with:', email.trim());
            console.log('Firebase Auth object:', auth);
            console.log('Firebase Auth app:', auth?.app);

            // Authenticate with Firebase Auth first
            let userCredential;
            try {
                userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
            } catch (authError) {
                console.error('Firebase Auth error details:', {
                    code: authError.code,
                    message: authError.message,
                    email: email.trim()
                });
                
                // Provide more specific guidance
                if (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential') {
                    setError(`User not found in Firebase Authentication. Please create the user first by visiting: ${window.location.origin}/admin-setup`);
                } else {
                    throw authError; // Re-throw to be caught by outer catch
                }
                return;
            }
            
            const user = userCredential.user;
            console.log('Firebase Auth successful. User UID:', user.uid);

            // Now check Firestore for user document and admin role
            // Try to get user document by UID first
            let userDoc = null;
            let userData = null;

            const userDocByUid = doc(db, 'users', user.uid);
            const uidDocSnap = await getDoc(userDocByUid);
            
            if (uidDocSnap.exists()) {
                userDoc = uidDocSnap;
                userData = uidDocSnap.data();
            } else {
                // If document doesn't exist by UID, try to find by email
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('email', '==', email.toLowerCase().trim()));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    userDoc = querySnapshot.docs[0];
                    userData = userDoc.data();
                }
            }

            // Check if user document exists
            if (!userDoc || !userData) {
                console.log('User document not found in Firestore');
                await signOut(auth);
                setError('User account not found in database. Please ensure your account exists in Firestore.');
                setLoading(false);
                return;
            }

            console.log('User document found:', userData);

            // Check if user role is "admin" (case-insensitive check)
            const userRole = userData.role?.toLowerCase();
            console.log('User role:', userRole);
            
            if (userRole !== 'admin') {
                await signOut(auth);
                setError(`Access denied. Admin privileges required. Current role: ${userData.role || 'none'}`);
                setLoading(false);
                return;
            }

            console.log('✅ Admin authentication successful');
            // Success - user is authenticated and is an admin
            navigate("/admin/dashboard");
        } catch (error) {
            console.error('Login error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            
            // Handle specific Firebase auth errors
            if (error.code === 'auth/invalid-email') {
                setError('Invalid email address');
            } else if (error.code === 'auth/user-disabled') {
                setError('This account has been disabled');
            } else if (error.code === 'auth/user-not-found') {
                setError('No account found in Firebase Authentication. The user needs to be created in Firebase Auth first. Go to Firebase Console > Authentication > Users to create the account.');
            } else if (error.code === 'auth/wrong-password') {
                setError('Incorrect password. Please check your password.');
            } else if (error.code === 'auth/invalid-credential') {
                setError('Invalid email or password. The user account needs to be created in Firebase Authentication first. Click the link below to create an admin account.');
            } else if (error.code === 'auth/network-request-failed') {
                setError('Network error. Please check your connection.');
            } else if (error.code === 'auth/too-many-requests') {
                setError('Too many failed attempts. Please try again later.');
            } else if (error.code === 'auth/api-key-not-valid' || error.message?.includes('api-key-not-valid')) {
                setError('Firebase configuration error. Please check firebase.js and add your Firebase API key.');
            } else {
                // Show user-friendly error message
                const errorMsg = error.message || 'Please try again.';
                if (errorMsg.includes('api-key-not-valid') || errorMsg.includes('YOUR_API_KEY')) {
                    setError('Firebase not configured. Please add your Firebase credentials to firebase.js');
                } else {
                    setError(`Login failed: ${errorMsg}`);
                }
            }
            setLoading(false);
        }
    };
    
    return (
        <div className="h-screen overflow-hidden bg-[url('./component/img/AdminLogin.png')] bg-[length:100%_100%] bg-no-repeat bg-center">
            <div className="md:h-[100vh] h-screen flex justify-center items-center">
                <div className="bg-[#0F2A52]/85 p-10 flex flex-col items-center rounded-2xl">
                    <img src={Shield} alt="Shield" className="w-20 h-20" />
                    <h1 className="font-bold text-white text-xl">Admin Login</h1>
                    <p className="text-xs text-[#9BB3D6]">Secure access for system administrators</p>

                    <form onSubmit={handleLogin} className="w-full">
                        <div className="flex flex-col items-start w-full mt-6 gap-2">
                            <label className="text-sm text-[#9BB3D6]">Email</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@motosphere.com" 
                                className="bg-[#0A1A3A] text-[#CCCCCC] text-sm w-70 md:w-80 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#2EA8FF]"
                                disabled={loading}
                            />
                        </div>

                        <div className="flex flex-col items-start w-full mt-6 gap-2">
                            <label className="text-sm text-[#9BB3D6]">Password</label>
                            <div className="relative w-full">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter admin password" 
                                    className="bg-[#0A1A3A] text-[#CCCCCC] text-sm w-70 md:w-80 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#2EA8FF]"
                                    disabled={loading}
                                />
                                <span
                                    className="absolute right-3 top-2.5 cursor-pointer text-[#334155] hover:text-[#9BB3D6]"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <AiFillEyeInvisible size={20} /> : <AiFillEye size={20} />}
                                </span>
                            </div>
                        </div>

                        {error && (
                            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                                <p className="text-red-400 text-sm mb-2">{error}</p>
                                {(error.includes('Firebase Authentication') || error.includes('invalid-credential') || error.includes('user-not-found')) && (
                                    <a 
                                        href="/admin-setup" 
                                        className="text-[#22D3EE] text-sm underline hover:text-[#06B6D4]"
                                    >
                                        → Create Admin Account Here
                                    </a>
                                )}
                            </div>
                        )}

                        <button  
                            type="submit"
                            disabled={loading}
                            className={`bg-[#2EA8FF] text-center text-white text-sm w-full py-3 rounded-xl mt-6 ${
                                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#2EA8FF]/90'
                            }`}
                        >
                            {loading ? 'Signing in...' : 'Sign in as Admin'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-[#1E293B]">
                        <p className="text-[#9BB3D6] text-xs text-center">
                            Don't have an admin account?{' '}
                            <a href="/admin-setup" className="text-[#22D3EE] hover:underline font-semibold">
                                Create Admin Account
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login

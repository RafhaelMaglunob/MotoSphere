import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

/**
 * One-time setup page to create an admin user
 * Access this page once to create your admin account
 * After creating, you can delete this file or protect it
 */
function SetupAdmin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        if (!email || !password) {
            setError('Please enter email and password');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            console.log('Creating admin user:', email);

            // Step 1: Create user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
            const user = userCredential.user;
            console.log('✅ User created in Firebase Auth. UID:', user.uid);

            // Step 2: Create user document in Firestore
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, {
                email: email.trim(),
                role: 'admin',
                name: name.trim() || 'Admin User',
                createdAt: Timestamp.now(),
            }, { merge: true });

            console.log('✅ User document created in Firestore');
            setMessage(`✅ Admin user created successfully! You can now login with email: ${email}`);
            setEmail('');
            setPassword('');
            setName('');
        } catch (error) {
            console.error('❌ Error creating admin user:', error);

            if (error.code === 'auth/email-already-in-use') {
                setError('This email is already registered in Firebase Authentication. You can try logging in instead.');
            } else if (error.code === 'auth/invalid-email') {
                setError('Invalid email address');
            } else if (error.code === 'auth/weak-password') {
                setError('Password is too weak. Use at least 6 characters.');
            } else {
                setError(`Failed to create admin user: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center p-4">
            <div className="bg-[#0F2A52]/90 p-8 rounded-2xl max-w-md w-full">
                <h1 className="text-2xl font-bold text-white mb-2">Create Admin User</h1>
                <p className="text-[#9BB3D6] text-sm mb-6">
                    Use this page once to create your admin account. After creating, you can login normally.
                </p>

                <form onSubmit={handleCreateAdmin} className="space-y-4">
                    <div>
                        <label className="text-sm text-[#9BB3D6] block mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@motosphere.com"
                            className="w-full bg-[#0A1A3A] text-[#CCCCCC] text-sm px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#2EA8FF]"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm text-[#9BB3D6] block mb-2">Password (min 6 characters)</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="w-full bg-[#0A1A3A] text-[#CCCCCC] text-sm px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#2EA8FF]"
                            disabled={loading}
                            required
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="text-sm text-[#9BB3D6] block mb-2">Name (optional)</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Admin User"
                            className="w-full bg-[#0A1A3A] text-[#CCCCCC] text-sm px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#2EA8FF]"
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {message && (
                        <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                            <p className="text-green-400 text-sm">{message}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-[#2EA8FF] text-white font-bold py-3 rounded-lg ${
                            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#2EA8FF]/90'
                        }`}
                    >
                        {loading ? 'Creating Admin User...' : 'Create Admin User'}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-[#1E293B]">
                    <p className="text-[#9BB3D6] text-xs text-center">
                        After creating the admin user, go to{' '}
                        <a href="/admin-login" className="text-[#22D3EE] hover:underline">
                            Admin Login
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SetupAdmin;

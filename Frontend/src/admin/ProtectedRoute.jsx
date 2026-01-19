import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';

function ProtectedRoute({ children }) {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                // User is not authenticated
                navigate('/admin-login');
                setLoading(false);
                return;
            }

            try {
                // Check if user has admin role in Firestore
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
                    const q = query(usersRef, where('email', '==', user.email?.toLowerCase().trim()));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        userDoc = querySnapshot.docs[0];
                        userData = userDoc.data();
                    }
                }

                // Check if user document exists and has admin role
                if (!userDoc || !userData) {
                    await signOut(auth);
                    navigate('/admin-login');
                    setLoading(false);
                    return;
                }

                const userRole = userData.role?.toLowerCase();
                if (userRole !== 'admin') {
                    await signOut(auth);
                    navigate('/admin-login');
                    setLoading(false);
                    return;
                }

                // User is authenticated and is an admin
                setIsAdmin(true);
                setLoading(false);
            } catch (error) {
                console.error('Error checking admin status:', error);
                navigate('/admin-login');
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0A1A3A]">
                <div className="text-white text-lg">Loading...</div>
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return children;
}

export default ProtectedRoute;

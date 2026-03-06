import React, { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { logAdminChange } from './changeLogger';
import { settingsAPI, authAPI } from '../services/api';
import ProfilePictureUpload from '../component/ProfilePictureUpload';
import TwoFactorSetup from '../component/TwoFactorSetup';

function Settings() {
    const [adminName, setAdminName] = useState("");
    const [adminEmail, setAdminEmail] = useState("");
    const [role, setRole] = useState("");
    const [profilePicture, setProfilePicture] = useState("");
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [notifications, setNotifications] = useState(true);

    // Notification preferences (same shape as user settings)
    const [notifSystem, setNotifSystem] = useState(true);
    const [notifMessages, setNotifMessages] = useState(true);
    const [lang, setLang] = useState('en');
    const [tz, setTz] = useState('UTC');
    const [savingPrefs, setSavingPrefs] = useState(false);
    const [prefsMsg, setPrefsMsg] = useState('');

    // Modal state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");

    const [currentUid, setCurrentUid] = useState(null);
    const [systemSettings, setSystemSettings] = useState({
        userManagement: { defaultRole: 'user', allowRegistration: true, requireEmailVerification: true },
        securityPolicies: { passwordMinLength: 8, requireNumber: true, requireSymbol: true, sessionTimeoutMinutes: 60, requireAdmin2FA: false },
        systemConfig: { appName: 'MotoSphere', logoUrl: '', maintenanceMode: false, defaultTheme: 'dark', systemTimezone: 'UTC' },
        logsMonitoring: { logRetentionDays: 30, activityTracking: true }
    });
    const [loadingSys, setLoadingSys] = useState(false);
    const [savingSys, setSavingSys] = useState(false);
    const [broadcastTitle, setBroadcastTitle] = useState('');
    const [broadcastBody, setBroadcastBody] = useState('');
    const [broadcasts, setBroadcasts] = useState([]);
    const [loadingBroadcasts, setLoadingBroadcasts] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setCurrentUid(null);
                setAdminName("");
                setAdminEmail("");
                setRole("");
                setLoadingProfile(false);
                return;
            }

            setCurrentUid(user.uid);
            setAdminEmail(user.email || "");

            try {
                const ref = doc(db, 'users', user.uid);
                const snap = await getDoc(ref);
                if (snap.exists()) {
                    const data = snap.data();
                    setAdminName(data.name || data.username || (user.email ? user.email.split('@')[0] : "Admin"));
                    setRole(data.role || "admin");
                    if (data.profilePicture) setProfilePicture(data.profilePicture);
                    if (typeof data.twoFactorEnabled === "boolean") setTwoFactorEnabled(data.twoFactorEnabled);
                    if (typeof data.notifications === "boolean") {
                        setNotifications(data.notifications);
                    }
                } else {
                    // fallback: Auth only
                    setAdminName(user.displayName || (user.email ? user.email.split('@')[0] : "Admin"));
                    setRole("admin");
                }
            } catch (e) {
                console.error("Failed to load admin profile:", e);
                setAdminName(user.displayName || (user.email ? user.email.split('@')[0] : "Admin"));
                setRole("admin");
            } finally {
                setLoadingProfile(false);
            }
        });

        return () => unsub();
    }, []);

    const canSaveProfile = useMemo(() => {
        return !!currentUid && !loadingProfile && adminName.trim().length > 0;
    }, [currentUid, loadingProfile, adminName]);

    // removed unused handleSave placeholder

    const handleSaveProfile = async () => {
        if (!canSaveProfile) return;
        try {
            setSavingProfile(true);
            const ref = doc(db, 'users', currentUid);
            await updateDoc(ref, {
                name: adminName.trim(),
                notifications,
                updatedAt: new Date(),
            });

            // Log profile/settings update
            await logAdminChange({
                actorId: currentUid,
                actorEmail: adminEmail,
                actorName: adminName,
                action: 'admin_settings_updated',
                targetType: 'settings',
                targetId: currentUid,
                summary: `Admin updated their profile/settings.`,
                metadata: {
                    notificationsEnabled: notifications,
                },
            });
            try {
                await settingsAPI.sendSystemAlert({
                    summary: `Admin updated their profile/settings.`,
                    changes: [`Admin updated their profile/settings.`],
                    actorName: adminName,
                    actorEmail: adminEmail,
                });
            } catch (emailErr) {
                console.warn('System alert email skipped or failed:', emailErr);
            }
            alert("Settings saved successfully!");
        } catch (e) {
            console.error("Failed to save settings:", e);
            alert("Failed to save settings. Check console for details.");
        } finally {
            setSavingProfile(false);
        }
    };

    const handleChangePassword = async () => {
        setPasswordError("");
        setPasswordSuccess("");

        if (!auth.currentUser) {
            setPasswordError("No authenticated user found.");
            return;
        }
        if (!oldPassword || !newPassword || !confirmPassword) {
            setPasswordError("Please fill in all fields.");
            return;
        }
        if (newPassword.length < 6) {
            setPasswordError("New password must be at least 6 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("New password and confirm password do not match!");
            return;
        }

        try {
            setChangingPassword(true);
            const user = auth.currentUser;

            if (!user.email) {
                setPasswordError("Cannot re-authenticate: missing user email.");
                return;
            }

            // Re-authenticate with old password (required by Firebase)
            const credential = EmailAuthProvider.credential(user.email, oldPassword);
            await reauthenticateWithCredential(user, credential);

            // Update password
            await updatePassword(user, newPassword);

            setPasswordSuccess("Password changed successfully!");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
            // auto close after success
            setTimeout(() => {
                setShowPasswordModal(false);
                setPasswordSuccess("");
            }, 800);
        } catch (e) {
            console.error("Change password failed:", e);
            if (e.code === 'auth/wrong-password') {
                setPasswordError("Old password is incorrect.");
            } else if (e.code === 'auth/too-many-requests') {
                setPasswordError("Too many attempts. Please try again later.");
            } else if (e.code === 'auth/requires-recent-login') {
                setPasswordError("Please log in again, then try changing your password.");
            } else {
                setPasswordError(e.message || "Failed to change password.");
            }
        } finally {
            setChangingPassword(false);
        }
    };

    useEffect(() => {
        const loadSystem = async () => {
            try {
                setLoadingSys(true);
                // Ensure backend admin token is present by exchanging Firebase ID token
                try {
                    const current = auth.currentUser;
                    if (current) {
                        const idToken = await current.getIdToken();
                        const res = await authAPI.adminExchangeFirebase(idToken);
                        if (res.success && res.token) {
                            localStorage.setItem('token', res.token);
                        }
                    }
                } catch (e) {
                    console.warn('Admin token exchange failed:', e?.message || e);
                }
                try {
                    const sres = await settingsAPI.getUserSettings();
                    if (sres.success && sres.settings) {
                        const p = sres.settings.preferences || {};
                        const n = p.notifications || {};
                        setLang(p.language || 'en');
                        setTz(p.timezone || 'UTC');
                        setNotifSystem(n.systemAlerts !== false);
                        setNotifMessages(n.messages !== false);
                    }
                } catch (e) {
                    console.warn('Admin user settings load failed:', e?.message || e);
                }
                const res = await settingsAPI.getAdminSettings();
                if (res.success && res.settings) {
                    setSystemSettings(prev => ({ ...prev, ...res.settings }));
                }
                try {
                    setLoadingBroadcasts(true);
                    const b = await settingsAPI.getAdminBroadcasts(50);
                    if (b.success) setBroadcasts(b.broadcasts || []);
                } finally {
                    setLoadingBroadcasts(false);
                }
            } catch (e) {
                console.error('Failed to load system settings:', e);
            } finally {
                setLoadingSys(false);
            }
        };
        loadSystem();
    }, []);

    const saveSystemSettings = async () => {
        try {
            setSavingSys(true);
            const res = await settingsAPI.updateAdminSettings(systemSettings);
            if (res.success) {
                alert('System settings saved');
            } else {
                alert(res.message || 'Failed to save');
            }
        } catch (e) {
            alert(e.message || 'Failed to save');
        } finally {
            setSavingSys(false);
        }
    };

    return (
        <div className="p-8 flex flex-col gap-6 text-white bg-[#0F2A52] h-fit rounded-2xl relative">
            <h1 className="text-2xl font-bold">Admin Settings</h1>

            {/* Admin Info */}
            <div className="bg-[#0A1A3A] p-6 rounded-lg flex flex-col gap-4">
                <h2 className="text-xl font-semibold">Profile Info</h2>
                {loadingProfile ? (
                    <div className="text-[#9BB3D6] text-sm">Loading profile...</div>
                ) : (
                    <>
                        <input
                            type="text"
                            value={adminName}
                            onChange={(e) => setAdminName(e.target.value)}
                            placeholder="Admin Name"
                            className="px-4 py-2 rounded-lg bg-[#0F2A52] border border-gray-600 outline-none focus:ring-2 focus:ring-[#2EA8FF]"
                        />
                        <input
                            type="email"
                            value={adminEmail}
                            readOnly
                            placeholder="Admin Email"
                            className="px-4 py-2 rounded-lg bg-[#0F2A52] border border-gray-600 outline-none opacity-80"
                        />
                        <div className="text-xs text-[#9BB3D6]">
                            Role: <span className="text-white font-semibold capitalize">{role || 'admin'}</span>
                        </div>

                        {/* Profile Picture */}
                        <div className="flex flex-col gap-2">
                            <ProfilePictureUpload
                                currentPicture={profilePicture}
                                onUploadSuccess={async (url) => {
                                    setProfilePicture(url);
                                    try {
                                        const ref = doc(db, 'users', currentUid);
                                        await updateDoc(ref, { profilePicture: url, updatedAt: new Date() });
                                    } catch (e) {
                                        console.warn('Failed to sync profile picture to Firestore:', e);
                                    }
                                }}
                                isLight={false}
                            />
                        </div>

                        {/* Change Password Button */}
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="mt-2 px-4 py-2 bg-[#2EA8FF] rounded-lg hover:bg-[#2596e6] w-max font-medium"
                        >
                            Change Password
                        </button>
                    </>
                )}
            </div>

            {/* Notification Settings */}
            <div className="bg-[#0A1A3A] p-6 rounded-lg flex flex-col gap-4">
                <h2 className="text-xl font-semibold">Notification Settings</h2>
                <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-row w-full justify-between px-5 py-3 items-center rounded-xl min-h-12 bg-[#0F2A52]">
                        <span className="text-white text-sm font-medium">System alerts</span>
                        <div
                            onClick={() => setNotifSystem(!notifSystem)}
                            className={`min-w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${notifSystem ? "bg-gray-600" : "bg-[#2EA8FF]"}`}
                        >
                            <div className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ${notifSystem ? "translate-x-0" : "translate-x-7"}`} />
                        </div>
                    </div>
                   
                    <div className="flex items-center gap-3">
                        <button
                            onClick={async () => {
                                setPrefsMsg('');
                                setSavingPrefs(true);
                                try {
                                    const payload = {
                                        preferences: {
                                            language: lang,
                                            timezone: tz,
                                            notifications: { systemAlerts: notifSystem, messages: notifMessages }
                                        }
                                    };
                                    const res = await settingsAPI.updateUserSettings(payload);
                                    if (res.success) setPrefsMsg('Preferences saved');
                                    else setPrefsMsg(res.message || 'Failed to save');
                                } catch (e) {
                                    setPrefsMsg(e.message || 'Failed to save');
                                } finally {
                                    setSavingPrefs(false);
                                    setTimeout(() => setPrefsMsg(''), 2000);
                                }
                            }}
                            disabled={savingPrefs}
                            className="px-6 py-2 bg-[#2EA8FF] hover:bg-[#2596e6] text-white font-semibold rounded-lg disabled:opacity-50"
                        >
                            {savingPrefs ? 'Saving...' : 'Save Preferences'}
                        </button>
                        {prefsMsg && <span className="text-sm text-green-400">{prefsMsg}</span>}
                    </div>
                </div>
            </div>

            {/* Security Settings — 2FA */}
            <div className="bg-[#0A1A3A] p-6 rounded-lg flex flex-col gap-4">
                <h2 className="text-xl font-semibold">Security Settings</h2>
                <TwoFactorSetup
                    isLight={false}
                    isEnabled={twoFactorEnabled}
                    onToggle={(enabled) => {
                        setTwoFactorEnabled(enabled);
                        if (currentUid) {
                            const ref = doc(db, 'users', currentUid);
                            updateDoc(ref, { twoFactorEnabled: enabled, updatedAt: new Date() }).catch(e => console.warn('Failed to sync 2FA state:', e));
                        }
                    }}
                />
            </div>
            
            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSaveProfile}
                    disabled={!canSaveProfile || savingProfile}
                    className="px-6 py-3 bg-[#2EA8FF] rounded-lg hover:bg-[#2596e6] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {savingProfile ? "Saving..." : "Save Settings"}
                </button>
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
                    <div className="bg-[#0A1A3A] p-6 rounded-lg w-96 flex flex-col gap-4">
                        <h2 className="text-xl font-semibold">Change Password</h2>
                        {passwordError && (
                            <div className="p-3 bg-red-500/20 border border-red-500/40 rounded text-sm text-red-300">
                                {passwordError}
                            </div>
                        )}
                        {passwordSuccess && (
                            <div className="p-3 bg-green-500/20 border border-green-500/40 rounded text-sm text-green-300">
                                {passwordSuccess}
                            </div>
                        )}
                        <input
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            placeholder="Old Password"
                            className="px-4 py-2 rounded-lg bg-[#0F2A52] border border-gray-600 outline-none focus:ring-2 focus:ring-[#2EA8FF]"
                            disabled={changingPassword}
                        />
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New Password"
                            className="px-4 py-2 rounded-lg bg-[#0F2A52] border border-gray-600 outline-none focus:ring-2 focus:ring-[#2EA8FF]"
                            disabled={changingPassword}
                        />
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm New Password"
                            className="px-4 py-2 rounded-lg bg-[#0F2A52] border border-gray-600 outline-none focus:ring-2 focus:ring-[#2EA8FF]"
                            disabled={changingPassword}
                        />
                        <div className="flex justify-end gap-3 mt-2">
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700"
                                disabled={changingPassword}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleChangePassword}
                                disabled={changingPassword}
                                className="px-4 py-2 bg-[#2EA8FF] rounded-lg hover:bg-[#2596e6] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {changingPassword ? "Changing..." : "Change"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Settings;

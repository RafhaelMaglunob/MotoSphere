import React, { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { logAdminChange } from './changeLogger';
import { settingsAPI, authAPI } from '../services/api';

function Settings() {
    const [adminName, setAdminName] = useState("");
    const [adminEmail, setAdminEmail] = useState("");
    const [role, setRole] = useState("");
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [notifications, setNotifications] = useState(true);

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

            <div className="bg-[#0A1A3A] p-6 rounded-lg flex flex-col gap-4">
                <h2 className="text-xl font-semibold">System Configuration</h2>
                {loadingSys ? (
                    <div className="text-[#9BB3D6] text-sm">Loading system settings...</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-[#9BB3D6]">App Name</label>
                                <input
                                    type="text"
                                    value={systemSettings.systemConfig.appName}
                                    onChange={(e)=>setSystemSettings(s=>({...s,systemConfig:{...s.systemConfig,appName:e.target.value}}))}
                                    className="px-4 py-2 rounded-lg bg-[#0F2A52] border border-gray-600 outline-none"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-[#9BB3D6]">Default Theme</label>
                                <select
                                    value={systemSettings.systemConfig.defaultTheme}
                                    onChange={(e)=>setSystemSettings(s=>({...s,systemConfig:{...s.systemConfig,defaultTheme:e.target.value}}))}
                                    className="px-4 py-2 rounded-lg bg-[#0F2A52] border border-gray-600 outline-none"
                                >
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-[#9BB3D6]">System Timezone</label>
                                <input
                                    type="text"
                                    value={systemSettings.systemConfig.systemTimezone}
                                    onChange={(e)=>setSystemSettings(s=>({...s,systemConfig:{...s.systemConfig,systemTimezone:e.target.value}}))}
                                    className="px-4 py-2 rounded-lg bg-[#0F2A52] border border-gray-600 outline-none"
                                />
                            </div>
                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={!!systemSettings.systemConfig.maintenanceMode}
                                    onChange={(e)=>setSystemSettings(s=>({...s,systemConfig:{...s.systemConfig,maintenanceMode:e.target.checked}}))}
                                    className="w-5 h-5 accent-[#2EA8FF]"
                                />
                                <span>Maintenance Mode</span>
                            </label>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={saveSystemSettings}
                                disabled={savingSys}
                                className="px-6 py-3 bg-[#2EA8FF] rounded-lg hover:bg-[#2596e6] font-semibold disabled:opacity-50"
                            >
                                {savingSys ? 'Saving...' : 'Save System Settings'}
                            </button>
                        </div>
                    </>
                )}
            </div>

            <div className="bg-[#0A1A3A] p-6 rounded-lg flex flex-col gap-4">
                <h2 className="text-xl font-semibold">Broadcast Notification</h2>
                <input
                    type="text"
                    placeholder="Title"
                    value={broadcastTitle}
                    onChange={(e)=>setBroadcastTitle(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-[#0F2A52] border border-gray-600 outline-none"
                />
                <textarea
                    placeholder="Message"
                    value={broadcastBody}
                    onChange={(e)=>setBroadcastBody(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-[#0F2A52] border border-gray-600 outline-none h-32"
                />
                <div className="flex justify-end">
                    <button
                        onClick={async ()=>{
                            if(!broadcastTitle || !broadcastBody){ alert('Fill title and message'); return; }
                            try{
                                await settingsAPI.broadcastNotification({ title:broadcastTitle, body:broadcastBody, audience:'all' });
                                setBroadcastTitle(''); setBroadcastBody('');
                                const b = await settingsAPI.getAdminBroadcasts(50);
                                if (b.success) setBroadcasts(b.broadcasts || []);
                                alert('Broadcast sent');
                            }catch(e){ alert(e.message||'Failed'); }
                        }}
                        className="px-6 py-3 bg-[#2EA8FF] rounded-lg hover:bg-[#2596e6] font-semibold"
                    >
                        Send Broadcast
                    </button>
                </div>
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Recent Broadcasts</h3>
                    {loadingBroadcasts ? (
                        <div className="text-[#9BB3D6] text-sm">Loading broadcasts...</div>
                    ) : broadcasts.length === 0 ? (
                        <div className="text-[#9BB3D6] text-sm">No broadcasts yet.</div>
                    ) : (
                        <ul className="divide-y divide-gray-700">
                            {broadcasts.map(b => (
                                <li key={b.id} className="py-3 flex items-start justify-between gap-4">
                                    <div>
                                        <div className="font-semibold">{b.title}</div>
                                        <div className="text-sm text-[#9BB3D6]">{b.body}</div>
                                        <div className="text-xs text-[#9BB3D6] mt-1">
                                            {b.createdAt ? new Date(b.createdAt).toLocaleString() : ''}
                                        </div>
                                    </div>
                                    <button
                                        onClick={async ()=>{
                                            if (!confirm('Delete this broadcast?')) return;
                                            try{
                                                await settingsAPI.deleteBroadcast(b.id);
                                                setBroadcasts(prev => prev.filter(x => x.id !== b.id));
                                            }catch(e){ alert(e.message||'Failed'); }
                                        }}
                                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                                    >
                                        Delete
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className="bg-[#0A1A3A] p-6 rounded-lg flex flex-col gap-4">
                <h2 className="text-xl font-semibold">SMTP Test</h2>
                <button
                    onClick={async ()=>{
                        const toEmail = prompt('Send test email to:');
                        if(!toEmail) return;
                        try{
                            await settingsAPI.smtpTest(toEmail);
                            alert('Test email requested');
                        }catch(e){ alert(e.message||'Failed'); }
                    }}
                    className="px-6 py-3 bg-[#2EA8FF] rounded-lg hover:bg-[#2596e6] font-semibold"
                >
                    Send Test Email
                </button>
            </div>
            {/* Notifications */}
            <div className="bg-[#0A1A3A] p-6 rounded-lg flex flex-col gap-4">
                <h2 className="text-xl font-semibold">Notifications</h2>
                <label className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={notifications}
                        onChange={() => setNotifications(!notifications)}
                        className="w-5 h-5 accent-[#2EA8FF]"
                    />
                    <span>Enable Email Notifications</span>
                </label>
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

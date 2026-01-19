import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

function Settings() {
    // Load admin data from localStorage
    const [adminName, setAdminName] = useState("");
    const [adminEmail, setAdminEmail] = useState("");
    const [password, setPassword] = useState("");
    const [notifications, setNotifications] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            try {
                const user = JSON.parse(userData);
                setAdminName(user.username || "");
                setAdminEmail(user.email || "");
            } catch (error) {
                console.error("Error parsing admin data:", error);
            }
        }
    }, []);

    // Modal state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSave = async () => {
        setError("");
        setSuccess("");

        // Validation
        if (!adminName || adminName.trim().length === 0) {
            setError("Admin name is required");
            return;
        }

        if (!adminEmail || adminEmail.trim().length === 0) {
            setError("Email is required");
            return;
        }

        setLoading(true);

        try {
            const response = await authAPI.updateProfile({
                username: adminName.trim(),
                email: adminEmail.trim()
            });

            if (response.success) {
                // Update localStorage with new admin data
                const userData = JSON.parse(localStorage.getItem("user") || "{}");
                userData.username = response.user.username;
                userData.email = response.user.email;
                localStorage.setItem("user", JSON.stringify(userData));

                setSuccess("Settings saved successfully!");
                setTimeout(() => setSuccess(""), 3000);
            } else {
                setError(response.message || "Failed to save settings");
            }
        } catch (err) {
            setError(err.message || "Failed to save settings. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            alert("Please fill in all fields.");
            return;
        }
        if (newPassword !== confirmPassword) {
            alert("New password and confirm password do not match!");
            return;
        }

        // Here you would call API to change password
        setPassword(newPassword);
        alert("Password changed successfully!");
        setShowPasswordModal(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    return (
        <div className="p-8 flex flex-col gap-6 text-white bg-[#0F2A52] h-fit rounded-2xl relative">
            <h1 className="text-2xl font-bold">Admin Settings</h1>

            {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            {success && (
                <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                    <p className="text-green-400 text-sm">{success}</p>
                </div>
            )}

            {/* Admin Info */}
            <div className="bg-[#0A1A3A] p-6 rounded-lg flex flex-col gap-4">
                <h2 className="text-xl font-semibold">Profile Info</h2>
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
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="Admin Email"
                    className="px-4 py-2 rounded-lg bg-[#0F2A52] border border-gray-600 outline-none focus:ring-2 focus:ring-[#2EA8FF]"
                />

                {/* Change Password Button */}
                <button
                    onClick={() => setShowPasswordModal(true)}
                    className="mt-2 px-4 py-2 bg-[#2EA8FF] rounded-lg hover:bg-[#2596e6] w-max font-medium"
                >
                    Change Password
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
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-3 bg-[#2EA8FF] rounded-lg hover:bg-[#2596e6] disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                >
                    {loading ? "Saving..." : "Save Settings"}
                </button>
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
                    <div className="bg-[#0A1A3A] p-6 rounded-lg w-96 flex flex-col gap-4">
                        <h2 className="text-xl font-semibold">Change Password</h2>
                        <input
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            placeholder="Old Password"
                            className="px-4 py-2 rounded-lg bg-[#0F2A52] border border-gray-600 outline-none focus:ring-2 focus:ring-[#2EA8FF]"
                        />
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New Password"
                            className="px-4 py-2 rounded-lg bg-[#0F2A52] border border-gray-600 outline-none focus:ring-2 focus:ring-[#2EA8FF]"
                        />
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm New Password"
                            className="px-4 py-2 rounded-lg bg-[#0F2A52] border border-gray-600 outline-none focus:ring-2 focus:ring-[#2EA8FF]"
                        />
                        <div className="flex justify-end gap-3 mt-2">
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleChangePassword}
                                className="px-4 py-2 bg-[#2EA8FF] rounded-lg hover:bg-[#2596e6]"
                            >
                                Change
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Settings;

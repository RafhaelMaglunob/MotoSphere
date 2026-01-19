import React, { useState, useEffect } from "react";

function EditUserModal({ user, onSave, onClose }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("Active");
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setEmail(user.email || "");
            setStatus(user.status || "Active");
        }
    }, [user]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});

        // Validation
        if (!name.trim()) {
            setErrors(prev => ({ ...prev, name: "Name is required" }));
            return;
        }

        if (!email.trim()) {
            setErrors(prev => ({ ...prev, email: "Email is required" }));
            return;
        }

        if (!/^[A-Za-z0-9_]+@(gmail\.com|yahoo\.com|hotmail\.com)$/.test(email.trim())) {
            setErrors(prev => ({ ...prev, email: "Invalid email format" }));
            return;
        }

        // Call onSave with updated user data
        if (onSave) {
            onSave({
                ...user,
                name: name.trim(),
                email: email.trim(),
                status: status
            });
        }
    };

    return (
        <div className="w-full p-2">
            <h1 className="text-white font-bold text-2xl">Edit User</h1>
            <span className="text-xs text-[#9BB3D6]">Update user information.</span>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full mt-4">
                <div className="flex flex-col w-full">
                    <label className="text-white font-medium mb-1">Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter user name"
                        className="bg-[#0A1A3A] text-gray-300 rounded-md px-3 py-2 w-full"
                    />
                    {errors.name && <span className="text-red-500 text-sm mt-1">{errors.name}</span>}
                </div>

                <div className="flex flex-col w-full">
                    <label className="text-white font-medium mb-1">Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@gmail.com"
                        className="bg-[#0A1A3A] text-gray-300 rounded-md px-3 py-2 w-full"
                    />
                    {errors.email && <span className="text-red-500 text-sm mt-1">{errors.email}</span>}
                </div>

                <div className="flex flex-col w-full">
                    <label className="text-white font-medium mb-1">Status:</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="bg-[#0A1A3A] text-gray-300 rounded-md px-3 py-2 w-full"
                    >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-[#2EA8FF] text-white rounded-lg hover:bg-[#2596e6]"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditUserModal;

import React, { useState, useEffect } from "react";

function EditDeviceModal({ device, onSave, onClose }) {
    const [deviceID, setDeviceID] = useState("");
    const [status, setStatus] = useState("Online");
    const [assignedUser, setAssignedUser] = useState("");
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (device) {
            setDeviceID(device.deviceID || "");
            setStatus(device.status || "Online");
            setAssignedUser(device.assigned_user || "");
        }
    }, [device]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});

        // Validation
        if (!deviceID.trim()) {
            setErrors(prev => ({ ...prev, deviceID: "Device ID is required" }));
            return;
        }

        // Call onSave with updated device data
        if (onSave) {
            onSave({
                ...device,
                deviceID: deviceID.trim(),
                status: status,
                assigned_user: assignedUser.trim()
            });
        }
    };

    return (
        <div className="w-full p-2">
            <h1 className="text-white font-bold text-2xl">Manage Device</h1>
            <span className="text-xs text-[#9BB3D6]">Update device information and status.</span>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full mt-4">
                <div className="flex flex-col w-full">
                    <label className="text-white font-medium mb-1">Device ID:</label>
                    <input
                        type="text"
                        value={deviceID}
                        onChange={(e) => setDeviceID(e.target.value)}
                        placeholder="Enter device ID"
                        className="bg-[#0A1A3A] text-gray-300 rounded-md px-3 py-2 w-full"
                    />
                    {errors.deviceID && <span className="text-red-500 text-sm mt-1">{errors.deviceID}</span>}
                </div>

                <div className="flex flex-col w-full">
                    <label className="text-white font-medium mb-1">Status:</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="bg-[#0A1A3A] text-gray-300 rounded-md px-3 py-2 w-full"
                    >
                        <option value="Online">Online</option>
                        <option value="Offline">Offline</option>
                    </select>
                </div>

                <div className="flex flex-col w-full">
                    <label className="text-white font-medium mb-1">Assigned User:</label>
                    <input
                        type="text"
                        value={assignedUser}
                        onChange={(e) => setAssignedUser(e.target.value)}
                        placeholder="Enter assigned user"
                        className="bg-[#0A1A3A] text-gray-300 rounded-md px-3 py-2 w-full"
                    />
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

export default EditDeviceModal;

import React, { useState, useMemo, useEffect } from 'react';
import { FiFilter } from "react-icons/fi";
import Table from '../component/table/Table';
import EditUserModal from '../component/modal/EditUserModal';
import ConfirmModal from '../component/modal/ConfirmModal';
import { authAPI } from '../services/api';

function formatTimeAgo(secondsAgo) {
    if (secondsAgo < 60) return `${secondsAgo} sec${secondsAgo !== 1 ? "s" : ""} ago`;
    else if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)} min${Math.floor(secondsAgo / 60) !== 1 ? "s" : ""} ago`;
    else if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)} hour${Math.floor(secondsAgo / 3600) !== 1 ? "s" : ""} ago`;
    else return `${Math.floor(secondsAgo / 86400)} day${Math.floor(secondsAgo / 86400) !== 1 ? "s" : ""} ago`;
}

function Users() {
    const [searchQuery, setSearchQuery] = useState("");
    const [tableData, setTableData] = useState([]);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch users from API on component mount
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await authAPI.getAllUsers();
                if (response.success) {
                    setTableData(response.users || []);
                } else {
                    setError(response.message || "Failed to load users");
                }
            } catch (err) {
                setError(err.message || "Failed to load users. Please try again.");
                console.error("Error fetching users:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const tableColumns = [
        { key: "name", label: "Name", minWidth: '180px' },
        { key: "email", label: "Email", minWidth: '250px' },
        { 
            key: "status", 
            label: "Status",
            minWidth: '120px',
            render: (value) => (
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    value === "Active" 
                        ? "bg-green-500/20 text-green-400" 
                        : "bg-slate-700 text-slate-400"
                }`}>
                    {value}
                </span>
            )
        },
        { key: "lastActive", label: "Last Active", minWidth: '150px' },
        { 
            key: "actions", 
            label: "Actions",
            minWidth: '150px',
            render: (value, row) => (
                <div className="flex gap-3">
                    <button 
                        onClick={() => {
                            setSelectedUser(row);
                            setEditModalOpen(true);
                        }}
                        className="text-[#22D3EE] hover:text-[#1ba8c4] cursor-pointer font-medium"
                    >
                        Edit
                    </button>
                    <button 
                        onClick={() => {
                            setDeleteIndex(tableData.findIndex(u => u.id === row.id || u.email === row.email));
                            setDeleteModalOpen(true);
                        }}
                        className="text-red-400 hover:text-red-500 cursor-pointer font-medium"
                    >
                        Delete
                    </button>
                </div>
            )
        }
    ];

    const handleEditUser = async (updatedUser) => {
        try {
            setLoading(true);
            setError("");
            const response = await authAPI.updateUser(updatedUser.id, {
                name: updatedUser.name || updatedUser.username,
                email: updatedUser.email,
                status: updatedUser.status
            });

            if (response.success) {
                // Update local state with the response from server
                setTableData(prev => prev.map(user => 
                    user.id === updatedUser.id ? response.user : user
                ));
                setEditModalOpen(false);
                setSelectedUser(null);
            } else {
                setError(response.message || "Failed to update user");
            }
        } catch (err) {
            setError(err.message || "Failed to update user. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        if (deleteIndex === null) return;

        const userToDelete = tableData[deleteIndex];
        if (!userToDelete) return;

        try {
            setLoading(true);
            const response = await authAPI.deleteUser(userToDelete.id);

            if (response.success) {
                // Remove from local state
                setTableData(prev => prev.filter((_, index) => index !== deleteIndex));
                setDeleteModalOpen(false);
                setDeleteIndex(null);
            } else {
                setError(response.message || "Failed to delete user");
            }
        } catch (err) {
            setError(err.message || "Failed to delete user. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Filtered data based on search query
    const filteredData = useMemo(() => {
        if (!searchQuery) return tableData;
        return tableData.filter(user => 
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, tableData]);

    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-bold text-white text-xl">Users</h1>

            {/* Container for search/filter + table */}
            <div className="flex flex-col gap-6">

                {/* Search & Filter */}
                <div className="p-4 flex flex-col md:flex-row justify-between bg-[#0F2A52] rounded-lg items-start md:items-center gap-4">
                    <input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-5 py-2 bg-[#0A1A3A] text-[#CCCCCC] rounded-lg w-full md:w-72 outline-none focus:ring-2 focus:ring-[#2EA8FF]"
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="p-8 bg-[#0F2A52] rounded-lg text-center">
                        <p className="text-[#9BB3D6] text-sm">Loading users...</p>
                    </div>
                ) : (
                    /* Table */
                    tableData.length === 0 ? (
                        <div className="p-8 bg-[#0F2A52] rounded-lg text-center">
                            <p className="text-[#9BB3D6] text-sm">No users found. Users will appear here when available.</p>
                        </div>
                    ) : (
                        <Table
                            columns={tableColumns}
                            data={filteredData}
                            pageSize={5}
                        />
                    )
                )}
            </div>

            {/* Edit User Modal */}
            {isEditModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 p-5 flex items-center justify-center bg-black/40">
                    <div className="bg-[#0F2A52] rounded-2xl w-full max-w-2xl p-6 relative">
                        <button
                            className="absolute top-4 right-4 text-white text-xl font-bold cursor-pointer hover:text-gray-500"
                            onClick={() => {
                                setEditModalOpen(false);
                                setSelectedUser(null);
                            }}
                        >
                            &times;
                        </button>
                        <EditUserModal 
                            user={selectedUser} 
                            onSave={handleEditUser} 
                            onClose={() => {
                                setEditModalOpen(false);
                                setSelectedUser(null);
                            }} 
                        />
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                message="Are you sure you want to delete this user?"
                onConfirm={handleDeleteUser}
                onCancel={() => {
                    setDeleteModalOpen(false);
                    setDeleteIndex(null);
                }}
            />
        </div>
    );
}

export default Users;

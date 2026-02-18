import React, { useState, useMemo, useEffect } from 'react';
import { collection, getDocs, getDoc, doc, updateDoc, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { auth } from './firebase';
import { logAdminChange } from './changeLogger';

function formatTimeAgo(secondsAgo) {
    if (secondsAgo < 60) return `${secondsAgo} sec${secondsAgo !== 1 ? "s" : ""} ago`;
    else if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)} min${Math.floor(secondsAgo / 60) !== 1 ? "s" : ""} ago`;
    else if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)} hour${Math.floor(secondsAgo / 3600) !== 1 ? "s" : ""} ago`;
    else return `${Math.floor(secondsAgo / 86400)} day${Math.floor(secondsAgo / 86400) !== 1 ? "s" : ""} ago`;
}

function toDateMaybe(ts) {
    if (!ts) return null;
    if (ts instanceof Date) return ts;
    if (typeof ts?.toDate === 'function') return ts.toDate();
    if (typeof ts?.seconds === 'number') return new Date(ts.seconds * 1000);
    return null;
}

// Archive Modal Component
function ArchiveModal({ archivedUsers, onClose, onRestore }) {
    const [isRestoring, setIsRestoring] = useState(false);

    const handleRestore = async (userId) => {
        setIsRestoring(true);
        await onRestore(userId);
        setIsRestoring(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0F2A52] rounded-lg max-w-3xl w-full p-6 shadow-xl max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Archived Users</h2>
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Archived Users List */}
                <div className="overflow-y-auto flex-1">
                    {archivedUsers.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            No archived users
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {archivedUsers.map(user => (
                                <div key={user.id} className="bg-[#0A1A3A] rounded-lg p-4 flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-white font-medium">{user.name}</h3>
                                        <p className="text-slate-400 text-sm">{user.email}</p>
                                        <p className="text-slate-500 text-xs mt-1">Deleted: {user.deletedAt}</p>
                                    </div>
                                    <button
                                        onClick={() => handleRestore(user.id)}
                                        disabled={isRestoring}
                                        className="px-4 py-2 bg-[#2EA8FF] hover:bg-[#2490d6] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Restore
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Modal Component
function UserModal({ user, onClose, onSave, onDelete }) {
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        status: user.status,
        role: user.role
    });
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        await onSave(user.id, formData);
        setIsSaving(false);
    };

    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
            setIsDeleting(true);
            await onDelete(user.id);
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0F2A52] rounded-lg max-w-md w-full p-6 shadow-xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Edit User</h2>
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form Fields */}
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-[#0A1A3A] text-white rounded-lg outline-none focus:ring-2 focus:ring-[#2EA8FF]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-[#0A1A3A] text-white rounded-lg outline-none focus:ring-2 focus:ring-[#2EA8FF]"
                        />
                    </div>

                    <div className="pt-2">
                        <p className="text-sm text-slate-400">
                            <span className="font-medium">Last Active:</span> {user.lastActive}
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 px-4 py-2 bg-[#2EA8FF] hover:bg-[#2490d6] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Simple Table Component
function Table({ columns, data, pageSize }) {
    const [currentPage, setCurrentPage] = useState(0);
    const totalItems = data.length || 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    // Clamp currentPage when data length changes (e.g., after delete)
    useEffect(() => {
        setCurrentPage(prev => {
            if (prev >= totalPages) {
                return Math.max(0, totalPages - 1);
            }
            return prev;
        });
    }, [totalPages, totalItems]);

    const startIndex = currentPage * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const currentData = data.slice(startIndex, endIndex);

    return (
        <div className="bg-[#0F2A52] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-700">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className="text-left px-6 py-4 text-sm font-semibold text-slate-300"
                                    style={{ minWidth: col.minWidth }}
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((row, idx) => (
                            <tr
                                key={row.id || idx}
                                className="border-b border-slate-700/50 hover:bg-[#0A1A3A] transition-colors"
                            >
                                {columns.map((col) => (
                                    <td key={col.key} className="px-6 py-4 text-sm text-slate-200">
                                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination - always visible so you can navigate back even after deletes */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
                <div className="text-sm text-slate-400">
                    {totalItems === 0
                        ? 'No users to display'
                        : `Showing ${startIndex + 1} to ${endIndex} of ${totalItems} users`}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                        disabled={currentPage === 0 || totalItems === 0}
                        className="px-3 py-1 bg-[#0A1A3A] text-slate-300 rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                        disabled={currentPage >= totalPages - 1 || totalItems === 0}
                        className="px-3 py-1 bg-[#0A1A3A] text-slate-300 rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

function Users() {
    const [searchQuery, setSearchQuery] = useState("");
    const [rows, setRows] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [archivedUsers, setArchivedUsers] = useState([]);
    const [showArchive, setShowArchive] = useState(false);
    const [, setLoading] = useState(true);
    const [currentAdmin, setCurrentAdmin] = useState(null);

    // Track currently logged in admin (for attribution in logs)
    useEffect(() => {
        const unsub = auth.onAuthStateChanged((user) => {
            if (!user) {
                setCurrentAdmin(null);
                return;
            }
            setCurrentAdmin({
                uid: user.uid,
                email: user.email || "",
                displayName: user.displayName || "",
            });
        });
        return () => unsub();
    }, []);

    const tableColumns = [
        { key: "name", label: "Name", minWidth: '180px' },
        { key: "email", label: "Email", minWidth: '250px' },
        { 
            key: "actions", 
            label: "Actions",
            minWidth: '100px',
            render: (value, row) => (
                <button 
                    onClick={() => setSelectedUser(row)}
                    className="text-[#22D3EE] hover:text-[#1ba8c4] cursor-pointer font-medium"
                >
                    View
                </button>
            )
        }
    ];

    // strict role helpers (match Dashboard logic)
    const isRider = (u) => u.role?.toLowerCase()?.trim() === 'rider';
    const isEmergencyContact = (u) => {
        const role = u.role?.toLowerCase()?.trim();
        return role === 'emergency_contact'
            || role === 'emergencycontact'
            || role === 'emergency contact'
            || role === 'emergency-contact'
            || role === 'contact';
    };

    const loadUsers = async () => {
        try {
            setLoading(true);
            const snap = await getDocs(collection(db, 'users'));
            const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));

            const filtered = all.filter(u => (isRider(u) || isEmergencyContact(u)) && u.archived !== true);

            const mapped = filtered.map(u => {
                const createdAt = toDateMaybe(u.createdAt);
                const lastActiveAt = toDateMaybe(u.lastActive) || toDateMaybe(u.lastLoginAt) || createdAt;
                const status = (u.status?.toString()?.trim()) || 'Active';

                let lastActive = '—';
                if (lastActiveAt) {
                    const secondsAgo = Math.max(0, Math.floor((Date.now() - lastActiveAt.getTime()) / 1000));
                    lastActive = formatTimeAgo(secondsAgo);
                }

                return {
                    id: u.id,
                    name: (u.name || u.username || (u.email ? u.email.split('@')[0] : 'Unknown')),
                    email: u.email || '—',
                    status,
                    lastActive,
                    role: u.role || '',
                };
            });

            // newest first by createdAt
            mapped.sort((a, b) => {
                const aDate = toDateMaybe(filtered.find(u => u.id === a.id)?.createdAt) || new Date(0);
                const bDate = toDateMaybe(filtered.find(u => u.id === b.id)?.createdAt) || new Date(0);
                return bDate.getTime() - aDate.getTime();
            });

            setRows(mapped);
        } catch (e) {
            console.error('Failed to load users list:', e);
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    const loadArchivedUsers = async () => {
        try {
            const snap = await getDocs(collection(db, 'archivedUsers'));
            const archived = snap.docs.map(d => {
                const data = { id: d.id, ...d.data() };
                const deletedAtDate = toDateMaybe(data.deletedAt);

                return {
                    id: data.id,
                    name: data.name || data.username || (data.email ? data.email.split('@')[0] : 'Unknown'),
                    email: data.email || '—',
                    status: data.status || 'Inactive',
                    role: data.role || '',
                    lastActive: data.lastActive || '—',
                    deletedAt: deletedAtDate ? deletedAtDate.toLocaleString() : '—',
                };
            });

            setArchivedUsers(archived);
        } catch (e) {
            console.log('No archivedUsers collection yet or error:', e.message);
            setArchivedUsers([]);
        }
    };

    useEffect(() => {
        loadUsers();
        loadArchivedUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSaveUser = async (userId, formData) => {
        try {
            const ref = doc(db, 'users', userId);
            await updateDoc(ref, {
                name: formData.name,
                email: formData.email,
                status: formData.status,
                // role stays unchanged here, or you can allow editing:
                // role: formData.role,
                updatedAt: Timestamp.now(),
            });

            // Log change
            if (currentAdmin) {
                await logAdminChange({
                    actorId: currentAdmin.uid,
                    actorEmail: currentAdmin.email,
                    actorName: currentAdmin.displayName,
                    action: 'user_updated',
                    targetType: 'user',
                    targetId: userId,
                    summary: `Admin updated user "${formData.name}" (${formData.email}).`,
                    metadata: {
                        userId,
                        name: formData.name,
                        email: formData.email,
                        status: formData.status,
                    },
                });
            }
            await loadUsers();
            setSelectedUser(null);
        } catch (e) {
            console.error('Failed to save user:', e);
            const code = e?.code || e?.name || 'unknown_error';
            const msg = e?.message || 'An unknown error occurred.';
            alert(`Failed to save user changes.\nReason: ${code}\n${msg}\n\nIf this is permission-denied, update Firestore rules to allow admins to edit users.`);
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            // Find the lightweight row data for logging fallback
            const rowUser = rows.find(u => u.id === userId);
            if (!rowUser) {
                console.warn('User not found in current rows for delete:', userId);
            }

            // Read full user document data directly by ID
            const userRef = doc(db, 'users', userId);
            const snap = await getDoc(userRef);

            if (!snap.exists()) {
                console.warn('User document does not exist in Firestore for delete:', userId);
                return;
            }

            const fullUser = { id: snap.id, ...snap.data() };

            const toArchive = {
                ...fullUser,
                archived: true,
                deletedAt: Timestamp.now(),
            };

            // Write to archivedUsers collection with same ID
            await setDoc(doc(db, 'archivedUsers', userId), toArchive);

            // Delete from users collection
            await deleteDoc(userRef);

            // Log delete
            if (currentAdmin) {
                await logAdminChange({
                    actorId: currentAdmin.uid,
                    actorEmail: currentAdmin.email,
                    actorName: currentAdmin.displayName,
                    action: 'user_deleted',
                    targetType: 'user',
                    targetId: userId,
                    summary: `Admin deleted user "${fullUser.name || rowUser?.name || fullUser.email || 'Unknown'}" (${fullUser.email || rowUser?.email || 'no-email'}).`,
                    metadata: {
                        userId,
                        name: fullUser.name || rowUser?.name || null,
                        email: fullUser.email || rowUser?.email || null,
                    },
                });
            }

            // Reload lists so the archived modal immediately reflects the change
            await Promise.all([loadUsers(), loadArchivedUsers()]);
            setSelectedUser(null);
        } catch (e) {
            console.error('Failed to archive user:', e);
            const code = e?.code || e?.name || 'unknown_error';
            const msg = e?.message || 'An unknown error occurred.';
            alert(`Failed to delete/archive user.\nReason: ${code}\n${msg}\n\nIf this is permission-denied, ensure Firestore rules let admins write to users and archivedUsers collections.`);
        }
    };

    const handleRestoreUser = async (userId) => {
        try {
            const archived = archivedUsers.find(u => u.id === userId);
            if (!archived) return;

            const { deletedAt: _deletedAt, ...rest } = archived;

            // Restore to users collection
            await setDoc(doc(db, 'users', userId), {
                ...rest,
                archived: false,
                restoredAt: Timestamp.now(),
            }, { merge: true });

            // Remove from archivedUsers collection
            await deleteDoc(doc(db, 'archivedUsers', userId));

            // Log restore
            if (currentAdmin) {
                await logAdminChange({
                    actorId: currentAdmin.uid,
                    actorEmail: currentAdmin.email,
                    actorName: currentAdmin.displayName,
                    action: 'user_restored',
                    targetType: 'user',
                    targetId: userId,
                    summary: `Admin restored user "${archived.name}" (${archived.email}).`,
                    metadata: {
                        userId,
                        name: archived.name,
                        email: archived.email,
                    },
                });
            }

            await Promise.all([loadUsers(), loadArchivedUsers()]);
        } catch (e) {
            console.error('Failed to restore user:', e);
            const code = e?.code || e?.name || 'unknown_error';
            const msg = e?.message || 'An unknown error occurred.';
            alert(`Failed to restore user.\nReason: ${code}\n${msg}\n\nIf this is permission-denied, update Firestore rules for users and archivedUsers.`);
        }
    };

    const filteredData = useMemo(() => {
        if (!searchQuery) return rows;
        return rows.filter(user => 
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, rows]);

    return (
        <div className="min-h-screen bg-[#0A1A3A] p-6">
            <div className="w-full">
                {/* Main Container Box */}
                <div className="bg-[#0F2A52] rounded-xl p-6 shadow-2xl">
                    <div className="flex flex-col gap-6">
                        <h1 className="font-bold text-white text-2xl">Users</h1>

                        <div className="flex flex-col gap-6">
                            <div className="flex justify-between items-center gap-4">
                                <input
                                    placeholder="Search users..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="px-5 py-2 bg-[#0A1A3A] text-[#CCCCCC] rounded-lg w-full md:w-72 outline-none focus:ring-2 focus:ring-[#2EA8FF]"
                                />
                                <button
                                    onClick={() => setShowArchive(true)}
                                    className="px-5 py-2 bg-[#0A1A3A] hover:bg-[#061328] text-white rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                    Archive
                                </button>
                            </div>

                            <Table
                                columns={tableColumns}
                                data={filteredData}
                                pageSize={5}
                            />
                        </div>
                    </div>
                </div>

                {/* Modal */}
                {selectedUser && (
                    <UserModal
                        user={selectedUser}
                        onClose={() => setSelectedUser(null)}
                        onSave={handleSaveUser}
                        onDelete={handleDeleteUser}
                    />
                )}

                {/* Archive Modal */}
                {showArchive && (
                    <ArchiveModal
                        archivedUsers={archivedUsers}
                        onClose={() => setShowArchive(false)}
                        onRestore={handleRestoreUser}
                    />
                )}
            </div>
        </div>
    );
}

export default Users;

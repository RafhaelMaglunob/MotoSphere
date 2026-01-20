import React, { useState, useMemo, useEffect } from 'react';

// Simple Table Component
function Table({ columns, data, pageSize }) {
    const [currentPage, setCurrentPage] = useState(0);
    const totalPages = Math.ceil(data.length / pageSize);
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
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

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
                    <div className="text-sm text-slate-400">
                        Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} devices
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                            disabled={currentPage === 0}
                            className="px-3 py-1 bg-[#0A1A3A] text-slate-300 rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                            disabled={currentPage === totalPages - 1}
                            className="px-3 py-1 bg-[#0A1A3A] text-slate-300 rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function Devices() {
    const [searchQuery, setSearchQuery] = useState("");
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    const tableColumns = [
        { key: "deviceID", label: "Device ID", minWidth: '180px' },
        { key: "assigned_user", label: "Assigned User", minWidth: '150px' }
    ];

    // Load riders (from users collection) + their deviceId field
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);

                // Lazy import to avoid circular deps at top-level
                const { collection, getDocs } = await import("firebase/firestore");
                const { db } = await import("./firebase");

                const usersSnap = await getDocs(collection(db, "users"));
                const users = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

                const riders = users.filter((u) => u.role?.toLowerCase()?.trim() === "rider");

                const mapped = riders.map((rider) => {
                    const name =
                        rider.name ||
                        rider.username ||
                        (rider.email ? rider.email.split("@")[0] : rider.id);

                    return {
                        id: rider.id,
                        deviceID: rider.deviceId || rider.deviceID || "—",
                        assigned_user: name,
                    };
                });

                setRows(mapped);
            } catch (e) {
                console.error("Failed to load devices:", e);
                setRows([]);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    // Filter data based on search query
    const filteredData = useMemo(() => {
        if (!searchQuery) return rows;
        return rows.filter(device =>
            device.deviceID.toLowerCase().includes(searchQuery.toLowerCase()) ||
            device.assigned_user.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, rows]);

    return (
        <div className="min-h-screen bg-[#0A1A3A] p-6">
            <div className="w-full">
                {/* Main Container Box */}
                <div className="bg-[#0F2A52] rounded-xl p-6 shadow-2xl">
                    <div className="flex flex-col gap-6">
                        <h1 className="font-bold text-white text-2xl">Devices</h1>

                        <div className="flex flex-col gap-6">
                            <div className="flex justify-between items-center gap-4">
                                <input
                                    placeholder="Search devices..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="px-5 py-2 bg-[#0A1A3A] text-[#CCCCCC] rounded-lg w-full md:w-72 outline-none focus:ring-2 focus:ring-[#2EA8FF]"
                                />
                            </div>

                            <Table
                                columns={tableColumns}
                                data={filteredData}
                                pageSize={5}
                            />
                            {loading && (
                                <div className="text-[#9BB3D6] text-sm mt-2">
                                    Loading devices...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Devices;
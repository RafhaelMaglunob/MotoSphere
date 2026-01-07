import React, { useState, useMemo } from 'react';
import { FiFilter } from "react-icons/fi";
import Table from '../component/table/Table';

import { StatusIcon } from '../component/svg/Status';

function formatTimeAgo(secondsAgo) {
    if (secondsAgo < 60) return `${secondsAgo} sec${secondsAgo !== 1 ? "s" : ""} ago`;
    else if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)} min${Math.floor(secondsAgo / 60) !== 1 ? "s" : ""} ago`;
    else if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)} hour${Math.floor(secondsAgo / 3600) !== 1 ? "s" : ""} ago`;
    else return `${Math.floor(secondsAgo / 86400)} day${Math.floor(secondsAgo / 86400) !== 1 ? "s" : ""} ago`;
}

function Devices() {
    const [searchQuery, setSearchQuery] = useState("");

    const tableColumns = [
        { key: "deviceID", label: "Device ID", minWidth: '180px' },
        { 
            key: "status", 
            label: "Status",
            minWidth: '180px',
            render: (value) => (
                <div className="flex flex-row items-center gap-3">
                    <StatusIcon className="w-4 h-4 text-[#4ADE80]" />
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        value === "Online" 
                            ? "bg-green-500/20 text-green-400" 
                            : "bg-slate-700 text-slate-400"
                    }`}>
                        {value}
                    </span>
                </div>
            )
        },  
        { key: "assigned_user", label: "Assigned User", minWidth: '150px' },
        { key: "last_active", label: "Last Seen", minWidth: '150px' },
        { 
            key: "actions", 
            label: "Actions",
            minWidth: '100px',
            render: (value) => (
                <button className="text-[#22D3EE] hover:text-[#1ba8c4] cursor-pointer font-medium">
                    {value}
                </button>
            )
        }
    ];

    const tableData = Array(6).fill(null).map((_, index) => ({
        deviceID: `DEV-${1000 + index}`,
        status: index % 2 === 0 ? "Online" : "Offline",
        assigned_user: `User ${index + 1}`,
        last_active: formatTimeAgo(12050 + index * 500),
        actions: "Manage"
    }));

    // Filter data based on search query
    const filteredData = useMemo(() => {
        if (!searchQuery) return tableData;
        return tableData.filter(device =>
            device.deviceID.toLowerCase().includes(searchQuery.toLowerCase()) ||
            device.assigned_user.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, tableData]);

    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-bold text-white text-xl">Devices</h1>

            {/* Search & Filter */}
            <div className="p-4 flex flex-col md:flex-row justify-between bg-[#0F2A52] rounded-lg items-start md:items-center gap-4">
                <input
                    placeholder="Search devices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-5 py-2 bg-[#0A1A3A] text-[#CCCCCC] rounded-lg w-full md:w-72 outline-none focus:ring-2 focus:ring-[#2EA8FF]"
                />
            </div>

            {/* Table with horizontal scroll */}
            <div className="w-full overflow-x-auto">
                <div className="inline-block min-w-[700px] w-full">
                    <Table
                        columns={tableColumns}
                        data={filteredData}
                        pageSize={5}
                        tableClass="bg-[#0F2A52] rounded-lg"
                        headerStyle={{ backgroundColor: "#0A1A3A", color: "#9BB3D6" }}
                        rowStyle={{ color: "#fff" }}
                        hoverStyle={{ backgroundColor: "#0F2A52" }}
                        footerClass="flex justify-between text-sm mt-2"
                        paginationClass="flex gap-4 text-[#9BB3D6]"
                    />
                </div>
            </div>
        </div>
    );
}

export default Devices;

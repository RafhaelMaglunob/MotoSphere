import React, { useState, useMemo } from 'react';
import { FiFilter } from "react-icons/fi";
import Table from '../component/table/Table';

function formatTimeAgo(secondsAgo) {
    if (secondsAgo < 60) return `${secondsAgo} sec${secondsAgo !== 1 ? "s" : ""} ago`;
    else if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)} min${Math.floor(secondsAgo / 60) !== 1 ? "s" : ""} ago`;
    else if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)} hour${Math.floor(secondsAgo / 3600) !== 1 ? "s" : ""} ago`;
    else return `${Math.floor(secondsAgo / 86400)} day${Math.floor(secondsAgo / 86400) !== 1 ? "s" : ""} ago`;
}

function Users() {
    const [searchQuery, setSearchQuery] = useState("");

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
            minWidth: '100px',
            render: (value) => (
                <button className="text-[#22D3EE] hover:text-[#1ba8c4] cursor-pointer font-medium">
                    {value}
                </button>
            )
        }
    ];

    const tableData = Array(6).fill(null).map((_, index) => ({
        name: "Alex Johnson",
        email: "alexjohnson@gmail.com",
        status: index % 3 === 0 ? "Inactive" : "Active",
        lastActive: formatTimeAgo(12050 + index * 500),
        actions: "Edit"
    }));

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

                {/* Table */}
                <Table
                    columns={tableColumns}
                    data={filteredData}
                    pageSize={5}
                />
            </div>
        </div>
    );
}

export default Users;

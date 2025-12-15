import React from 'react';
import { FiFilter } from "react-icons/fi";
import Table from '../component/table/Table';

import { StatusIcon } from '../component/svg/Status';
import { BatteryIcon } from '../component/svg/BatteryIcon';
import { SignalIcon } from '../component/svg/SignalIcon';

function formatTimeAgo(secondsAgo) {
    if (secondsAgo < 60) return `${secondsAgo} sec${secondsAgo !== 1 ? "s" : ""} ago`;
    else if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)} min${Math.floor(secondsAgo / 60) !== 1 ? "s" : ""} ago`;
    else if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)} hour${Math.floor(secondsAgo / 3600) !== 1 ? "s" : ""} ago`;
    else return `${Math.floor(secondsAgo / 86400)} day${Math.floor(secondsAgo / 86400) !== 1 ? "s" : ""} ago`;
}

function Devices() {
    const tableColumns = [
        { key: "deviceID", label: "Device ID", minWidth: '180px' },
        { 
            key: "status", 
            label: "Status",
            minWidth: '180px',
            render: (value) => (
                <div className="flex flex-row items-center gap-3">
                    
                    <StatusIcon className="w-4 h-4 text-[#4ADE80]"/>
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
        { 
            key: "battery", 
            label: "Battery", 
            minWidth: '100px',
            render: (value) => (
                <div className="flex flex-row items-center gap-2">
                    <BatteryIcon className="w-4 h-4 text-[#22D3EE]"/>
                    <span>{value}</span>
                </div>
            )
        },
        { 
            key: "signal", 
            label: "Signal", 
            minWidth: '100px',
            render: (value) => (
                <div className="flex flex-row items-center gap-2">
                    <SignalIcon className="w-4 h-4 text-[#22D3EE]"/>
                    <span>{value}</span>
                </div>
            )
        },
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
        battery: `${80 - index * 5}%`,
        signal: `${90 - index * 3}%`,
        last_active: formatTimeAgo(12050 + index * 500),
        actions: "Manages"
    }));

    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-bold text-white text-xl">Devices</h1>

            {/* Search & Filter */}
            <div className="p-4 flex flex-col md:flex-row justify-between bg-[#0F2A52] rounded-lg items-start md:items-center gap-4">
                <input
                    placeholder="Search devices..."
                    className="px-5 py-2 bg-[#0A1A3A] text-[#CCCCCC] rounded-lg w-full md:w-72 outline-none focus:ring-2 focus:ring-[#2EA8FF]"
                />
                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto justify-between md:justify-start">
                    <button className="flex flex-row gap-2 px-6 py-3 bg-[#0A1A3A] rounded-lg text-white font-light items-center justify-center w-full md:w-auto hover:bg-[#0d2142] transition-colors">
                        <FiFilter />
                        <span className="text-base">Filter</span>
                    </button>
                    <button className="md:px-6 md:py-3 px-3 py-2 font-semibold bg-[#2EA8FF] text-white rounded-lg w-full md:w-auto hover:bg-[#2596e6] transition-colors">
                        Add Device
                    </button>
                </div>
            </div>

            {/* Table with horizontal scroll */}
            <div className="w-full overflow-x-auto">
                <div className="inline-block min-w-[900px] w-full">
                    <Table
                        columns={tableColumns}
                        data={tableData}
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

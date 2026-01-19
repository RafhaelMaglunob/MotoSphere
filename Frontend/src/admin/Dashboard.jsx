import React from 'react'
import { BsDot } from "react-icons/bs";

import { UsersIcon } from '../component/svg/UsersIcon.jsx';
import { DashboardIcon } from '../component/svg/DashboardIcon.jsx';
import { DevicesIcon } from '../component/svg/DevicesIcon.jsx';
import { AlertIcon } from '../component/svg/AlertIcon.jsx';

function formatTimeAgo(secondsAgo) {
    if (secondsAgo < 60) {
        return `${secondsAgo} sec${secondsAgo !== 1 ? "s" : ""} ago`;
    } else if (secondsAgo < 3600) {
        const mins = Math.floor(secondsAgo / 60);
        return `${mins} min${mins !== 1 ? "s" : ""} ago`;
    } else if (secondsAgo < 86400) {
        const hours = Math.floor(secondsAgo / 3600);
        return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else {
        const days = Math.floor(secondsAgo / 86400);
        return `${days} day${days !== 1 ? "s" : ""} ago`;
    }
}

function Dashboard() {
    // Recent alerts - will be populated from API/database in the future
    const recentAlerts = [];
    
    // System activity - will be populated from API/database in the future
    const systemActivity = [];

    // Dashboard stats - will be populated from API/database in the future
    const stats = {
        totalUsers: 0,
        onlineDevices: 0,
        activeAlerts: 0,
        systemHealth: 0
    };

    return (
        <div>
            <h1 className="font-bold text-white text-xl mb-6">Dashboard</h1>

            {/* Total Users, Online Devices, Active Alerts, and System Health */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <div className="bg-[#0F2A52] p-5 rounded-3xl">
                    <div className="flex flex-row justify-between">
                        <div className="p-3 rounded-md bg-[#0A1A3A]">
                            <UsersIcon className="text-[#22D3EE]" />
                        </div>
                        <p className="text-[#4ADE80] text-xs">--</p>
                    </div>

                    <div className="mt-3">
                        <label className="text-[#9BB3D6] text-xs">Total Users</label>
                        <h1 className="text-white font-bold text-2xl">{stats.totalUsers}</h1>
                    </div>
                </div>
                <div className="bg-[#0F2A52] p-5 rounded-3xl">
                    <div className="flex flex-row justify-between">
                        <div className="p-3 rounded-md bg-[#0A1A3A]">
                            <DevicesIcon className="text-[#4ADE80]" />
                        </div>
                        <p className="text-[#4ADE80] text-xs">--</p>
                    </div>
                    
                    <div className="mt-3">
                        <label className="text-[#9BB3D6] text-xs">Online Devices</label>
                        <h1 className="text-white font-bold text-2xl">{stats.onlineDevices}</h1>
                    </div>
                </div>
                <div className="bg-[#0F2A52] p-5 rounded-3xl">
                    <div className="flex flex-row justify-between">
                        <div className="p-3 rounded-md bg-[#0A1A3A]">
                            <AlertIcon className="text-[#F87171]" />
                        </div>
                        <p className="text-[#4ADE80] text-xs">--</p>
                    </div>
                    
                    <div className="mt-3">
                        <label className="text-[#9BB3D6] text-xs">Active Alert</label>
                        <h1 className="text-white font-bold text-2xl">{stats.activeAlerts}</h1>
                    </div>
                </div>
                <div className="bg-[#0F2A52] p-5 rounded-3xl">
                    <div className="flex flex-row justify-between">
                        <div className="p-3 rounded-md bg-[#0A1A3A]">
                            <DashboardIcon className="text-[#C084FC]" />
                        </div>
                        <p className="text-[#4ADE80] text-xs">Stable</p>
                    </div>
                    
                    <div className="mt-3">
                        <label className="text-[#9BB3D6] text-xs">System Health</label>
                        <h1 className="text-white font-bold text-2xl">{stats.systemHealth}%</h1>
                    </div>
                </div>
            </div>
            
            {/* Recent Alerts and System Activity */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 justify-between gap-6   ">
                <div className="p-6 bg-[#0F2A52] rounded-2xl w-full">
                    <h1 className="text-white font-semibold text-xl mb-6">Recent Alerts</h1>

                    {/* Crash Detected, Accident Detected, etc. */}
                    {recentAlerts.length === 0 ? (
                        <div className="p-6 text-center">
                            <p className="text-[#9BB3D6] text-sm">No recent alerts. Alerts will appear here when available.</p>
                        </div>
                    ) : (
                        recentAlerts.map((alert, index) => (
                            <div key={index} className="mb-3 bg-[#0A1A3A] p-4 flex flex-row rounded-xl justify-between">
                                <div className="flex flex-row gap-4">
                                    <div className="bg-[#EF4444]/20 rounded-md p-2 ">
                                        <AlertIcon className="text-[#F87171]" />
                                    </div>
                                    <div className="flex flex-col">
                                        <h1 className="text-white text-sm">Crash Detected</h1>
                                        <span className="text-[#9BB3D6] text-xs">Device #{alert.deviceNo} • {formatTimeAgo(alert.time_of_occurence)}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    
                </div>
                <div className="p-6 bg-[#0F2A52] rounded-2xl w-full">
                    <h1 className="text-white font-semibold text-xl mb-6">System Activity</h1>
                    {systemActivity.length === 0 ? (
                        <div className="p-6 text-center">
                            <p className="text-[#9BB3D6] text-sm">No system activity. Activity logs will appear here when available.</p>
                        </div>
                    ) : (
                        systemActivity.map((act, index) => (
                            <div key={index} className="mb-3 flex flex-row">
                                <BsDot className="text-[#06B6D4] text-4xl mt-[-8px]" />
                                <div className="text-[#9BB3D6] text-sm font-light flex flex-col">
                                    <span className="text-white">New user {act.action} verified</span>
                                    <span className="text-xs">{act.time} • System Auto check</span>
                                </div>
                            </div>
                        ))
                    )}

                </div>
            </div>
        </div>
    )
}

export default Dashboard

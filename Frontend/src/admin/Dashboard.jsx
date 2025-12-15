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
    const recentAlerts = [
        {deviceNo: 8832, time_of_occurence: 22},
        {deviceNo: 8592, time_of_occurence: 122130},
        {deviceNo: 8640, time_of_occurence: 13132}
    ]
    
    const systemActivity = [
        {action: "registration", time: "10:42 AM"},
        {action: "registration", time: "9:42 AM"},
        {action: "registration", time: "8:42 AM"},
        {action: "registration", time: "7:42 AM"}
    ]

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
                        <p className="text-[#4ADE80] text-xs">+12% this month</p>
                    </div>

                    <div className="mt-3">
                        <label className="text-[#9BB3D6] text-xs">Total Users</label>
                        <h1 className="text-white font-bold text-2xl">1234</h1>
                    </div>
                </div>
                <div className="bg-[#0F2A52] p-5 rounded-3xl">
                    <div className="flex flex-row justify-between">
                        <div className="p-3 rounded-md bg-[#0A1A3A]">
                            <DevicesIcon className="text-[#4ADE80]" />
                        </div>
                        <p className="text-[#4ADE80] text-xs">+5% vs yesterday</p>
                    </div>
                    
                    <div className="mt-3">
                        <label className="text-[#9BB3D6] text-xs">Online Devices</label>
                        <h1 className="text-white font-bold text-2xl">856</h1>
                    </div>
                </div>
                <div className="bg-[#0F2A52] p-5 rounded-3xl">
                    <div className="flex flex-row justify-between">
                        <div className="p-3 rounded-md bg-[#0A1A3A]">
                            <AlertIcon className="text-[#F87171]" />
                        </div>
                        <p className="text-[#4ADE80] text-xs">+2% from last hour</p>
                    </div>
                    
                    <div className="mt-3">
                        <label className="text-[#9BB3D6] text-xs">Active Alert</label>
                        <h1 className="text-white font-bold text-2xl">3</h1>
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
                        <h1 className="text-white font-bold text-2xl">99%</h1>
                    </div>
                </div>
            </div>
            
            {/* Recent Alerts and System Activity */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 justify-between gap-6   ">
                <div className="p-6 bg-[#0F2A52] rounded-2xl w-full">
                    <h1 className="text-white font-semibold text-xl mb-6">Recent Alerts</h1>

                    {/* Crash Detected, Accident Detected, etc. */}
                    {recentAlerts.map((alert, index) => (
                       <div className="mb-3 bg-[#0A1A3A] p-4 flex flex-row rounded-xl justify-between">
                            <div className="flex flex-row gap-4">
                                <div className="bg-[#EF4444]/20 rounded-md p-2 ">
                                    <AlertIcon className="text-[#F87171]" />
                                </div>
                                <div className="flex flex-col">
                                    <h1 className="text-white text-sm">Crash Detected</h1>
                                    <span className="text-[#9BB3D6] text-xs">Device #{alert.deviceNo} • {formatTimeAgo(alert.time_of_occurence)}</span>
                                </div>
                            </div>
                            
                            <div>
                                <button key={index} className="text-[#F87171] bg-[#EF4444]/10 py-2 px-4 rounded-lg">View</button>
                            </div>
                       </div>
                    ))}

                    
                </div>
                <div className="p-6 bg-[#0F2A52] rounded-2xl w-full">
                    <h1 className="text-white font-semibold text-xl mb-6">System Activity</h1>
                    {systemActivity.map((act, index) => (
                        <div key={index} className="mb-3 flex flex-row">
                            <BsDot className="text-[#06B6D4] text-4xl mt-[-8px]" />
                            <div className="text-[#9BB3D6] text-sm font-light flex flex-col">
                                
                                <span className="text-white">New user {act.action} verified</span>
                                <span className="text-xs">{act.time} • System Auto check</span>
                            </div>
                        </div>
                    ))}

                </div>
            </div>
        </div>
    )
}

export default Dashboard

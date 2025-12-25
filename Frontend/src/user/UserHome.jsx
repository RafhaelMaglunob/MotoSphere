import React from 'react'
import { useOutletContext } from 'react-router-dom'

import { Shield } from '../component/svg/Shield';
import { BatteryIcon } from '../component/svg/BatteryIcon';
import { ProfileIconOutline } from '../component/svg/ProfileIconOutline';
import PhoneIcon from '../component/svg/PhoneIcon';
import MailIcon from '../component/svg/MailIcon';

function UserHome() {
    const { username, deviceNo, lastSynced, isConnected, sensors, contacts } = useOutletContext();
    const firstName = username?.trim().split(/\s+/)[0];
    return (
        <div>
            <div className="md:py-3 md:px-10">
                {/* Welcoming for Users */}
                <div className="flex flex-col gap-3 bg-[#050816]/80 px-8 py-5 rounded-2xl">
                    <h1 className="text-white text-2xl font-semibold tracking-wide">Welcome back, {firstName}</h1>
                    <span className="text-[#9BB3D6] text-sm">Your helmet is connected and systems are optimal.</span>
                </div>

                {/* Checking its connection on the device's */}
                <div className="grid grid-cols-1 md:grid-cols-5 mt-5 md:mt-8 gap-7">

                    {/* Connection for the device */}
                    <div className="col-span-3 bg-[#050816]/80 px-8 py-5 rounded-2xl flex flex-col">
                        <div className="grid md:grid-cols-3 grid-cols-1">
                            <div className="col-span-2 flex flex-row items-center gap-3">
                                <div className="bg-[#0F2A52]/75 p-4 h-fit w-fit rounded-2xl">
                                    <Shield className="text-[#39A9FF] h-10 w-10" />
                                </div>
                                <div>
                                    <h1 className="text-[#FFFFFF] font-semibold text-lg">Smart Helmet {deviceNo}</h1>
                                    <span className="text-[#9BB3D6] text-[11px]">Last synced:: {lastSynced} </span>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <div
                                    className={`
                                        flex text-xs font-medium w-fit h-fit px-3 py-1 rounded-2xl
                                        ${isConnected ?
                                            "bg-[#4EBC34]/10 text-[#22C55E]/30"
                                            :
                                            "bg-red-600/20 text-red-600/80"}`
                                    }
                                >
                                    {isConnected ? "Connected" : "Not Connected"}
                                </div>
                            </div>
                        </div>
                        <div className="mt-5 grid grid-cols-2 gap-2 items-stretch">
                            {/* Battery */}
                            <div className="flex-1 bg-[#0F2A52] p-4 rounded-lg flex flex-col">
                                <div className="flex flex-row items-center gap-3 text-[#9BB3D6]">
                                    <BatteryIcon className="w-4 h-4" />
                                    <label className="text-sm">Battery</label>
                                </div>
                                <h1 className="text-white mt-4 font-medium text-lg">94%</h1>
                            </div>

                            {/* Sensors */}
                            {sensors.map((sensor, index) => (
                                <div key={index} className="flex-1 bg-[#0F2A52] p-4 rounded-lg flex flex-col">
                                    <div className="flex flex-row items-center gap-3 text-[#9BB3D6]">
                                        <BatteryIcon className="w-4 h-4" />
                                        <label className="text-sm">{sensor.type}</label>
                                    </div>
                                    <h1 className={`mt-4 font-medium text-lg ${sensor?.connection.toLowerCase() === "active" ? "text-[#4EBC34]" : "text-red-600"}`}>{sensor.connection}</h1>
                                </div>
                            ))}
                        </div>


                    </div>

                    {/* Live Tracking */}
                    <div className="col-span-2 bg-[#050816]/80 px-8 py-5 rounded-2xl">

                    </div>
                </div>

                <h1 className="font-semibold text-white mt-6">Trusted Contacts</h1>
                <div className="p-3 grid md:grid-cols-3 gap-3 ">
                    {/* name, relation, contactNo, email */}
                    {contacts.map((contact, index) => (
                        <div key={index} className="flex-1 bg-[#050816]/80 p-6 rounded-2xl">
                            <div className="flex flex-row gap-3">
                                <div className="bg-[#0F2A52]/75 p-3 rounded-xl">
                                    <ProfileIconOutline className="text-[#0A1A3A]/30 h-9 w-9"/>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h1 className="text-white font-semibold text-md">{contact.name}</h1>
                                    <span className="bg-[#0F2A52]/75 text-[#39A9FF] rounded-md w-fit text-xs px-3 py-1">{contact.relation}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 mt-6">
                                <div className="flex flex-row items-center gap-3 text-white text-sm font-light">
                                    <PhoneIcon className="w-4 h-4"/>
                                    {contact.contactNo}
                                </div>   
                                <div className="flex flex-row items-center gap-3 text-white text-sm font-light">
                                    <MailIcon innerColor={"#007BFF"} innerOpacity={0.7} borderColor='#39A9FF' borderOpacity={0.7} className="w-4 h-4"/>
                                    {contact.email}
                                </div>                                      
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default UserHome

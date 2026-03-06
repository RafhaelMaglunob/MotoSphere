import React, { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Shield } from '../component/svg/Shield';
import { BatteryIcon } from '../component/svg/BatteryIcon';
import { authAPI, deviceAPI } from '../services/api';

// Bluetooth Icon
const BluetoothIcon = ({ className }) => (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.5 6.5L17.5 17.5L12 23V1L17.5 6.5L6.5 17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

function UserDevice() {
    const { deviceNo, lastSynced, sensors, isLight } = useOutletContext();
    const [isConnecting, setIsConnecting] = useState(false);
    const [connected, setConnected] = useState(false);
    const [connectError, setConnectError] = useState('');
    const [registeredDeviceId, setRegisteredDeviceId] = useState(deviceNo || '');
    const [isRegistering, setIsRegistering] = useState(false);

    // Keep local deviceId in sync with context (e.g., after profile refresh)
    useEffect(() => {
        setRegisteredDeviceId(deviceNo || '');
    }, [deviceNo]);

    const hasDevice = !!registeredDeviceId;

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const res = await deviceAPI.status();
                if (!mounted) return;
                setConnected(!!res.connected);
            } catch (e) {
                // If Pi service isn't up yet, just treat as disconnected.
                if (!mounted) return;
                setConnected(false);
            }
        };
        if (hasDevice) {
            load();
        }
        return () => { mounted = false; };
    }, [hasDevice]);

    // Simulate connection
    const handleConnect = async () => {
        setConnectError('');
        setIsConnecting(true);
        try {
            const res = await deviceAPI.connect(registeredDeviceId);
            setConnected(!!res.connected || res.success === true);
        } catch (e) {
            setConnectError(e?.message || 'Failed to connect');
            setConnected(false);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        setConnectError('');
        setIsConnecting(true);
        try {
            const res = await deviceAPI.disconnect(registeredDeviceId);
            setConnected(!!res.connected && res.connected !== false);
            if (res.connected === false) setConnected(false);
        } catch (e) {
            setConnectError(e?.message || 'Failed to disconnect');
        } finally {
            setIsConnecting(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        // Auto-generate a simple device ID purely on the frontend so the user
        // can always register a device, but we still try to persist it.
        const generatedId =
            (typeof crypto !== 'undefined' && crypto.randomUUID)
                ? crypto.randomUUID()
                : `DEV-${Date.now()}`;

        setConnectError('');
        setIsRegistering(true);

        try {
            // Try to persist to backend so admin Devices view stays in sync.
            try {
                const res = await authAPI.updateProfile({ deviceId: generatedId });
                if (!res.success) {
                    console.warn('Device register: backend responded with error, falling back to local only:', res.message);
                }
            } catch (err) {
                console.warn('Device register: backend unreachable, using local registration only:', err?.message || err);
            }

            // Always update local state so the UI reflects registration immediately.
            setRegisteredDeviceId(generatedId);
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const u = JSON.parse(userStr);
                    u.deviceId = generatedId;
                    u.deviceID = generatedId;
                    localStorage.setItem('user', JSON.stringify(u));
                }
            } catch {
                // ignore JSON/localStorage issues; the in-memory state is enough
            }
        } finally {
            setIsRegistering(false);
        }
    };

    // Separate sensors
    const motionSensors = (sensors || []).filter(sensor => 
        sensor.type.toLowerCase() === 'accelerometer' || sensor.type.toLowerCase() === 'gyroscope'
    );
    const otherSensors = (sensors || []).filter(sensor => 
        sensor.type.toLowerCase() !== 'accelerometer' && sensor.type.toLowerCase() !== 'gyroscope'
    );
    
    const allMotionSensorsActive = motionSensors.length > 0 && 
        motionSensors.every(sensor => sensor?.connection.toLowerCase() === "active");

    const allSensors = [
        { name: 'Motion Sensors', status: allMotionSensorsActive ? 'Active' : 'Inactive' },
        ...otherSensors.map(s => ({ name: s.type, status: s.connection }))
    ];

    return (
        <div className="md:py-3 md:px-10">
            {/* Device Header */}
            <div className={`${isLight ? "bg-white" : "bg-[#050816]/80"} web-fade-in delay-1 p-8 rounded-2xl mb-6`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className={`${isLight ? "bg-[#F1F1F1]" : "bg-[#0F2A52]/75"} p-6 rounded-2xl`}>
                            <Shield className="text-[#39A9FF] h-16 w-16" />
                        </div>
                        <div>
                            <h1 className={`${isLight ? "text-black" : "text-white"} text-3xl font-bold mb-2`}>
                                {hasDevice ? `Smart Helmet ${registeredDeviceId}` : 'No Device Registered'}
                            </h1>
                            <div className="flex items-center gap-4 text-sm">
                                {hasDevice && (
                                    <span className={`${isLight ? "text-black/70" : "text-[#9BB3D6]"}`}>
                                        Last synced: {lastSynced}
                                    </span>
                                )}
                                <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full ${
                                    connected 
                                        ? "bg-[#4EBC34]/10 text-[#22C55E]" 
                                        : "bg-red-600/20 text-red-600"
                                }`}>
                                    <span className={`h-2 w-2 rounded-full ${connected ? "bg-[#22C55E]" : "bg-red-600"} animate-pulse`}></span>
                                    {connected ? "Connected" : "Disconnected"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Connect or Register Button */}
                    {hasDevice ? (
                        <button
                            onClick={connected ? handleDisconnect : handleConnect}
                            disabled={isConnecting}
                            className={`px-8 py-3 rounded-xl font-semibold text-white transition-all ${
                                connected 
                                    ? "bg-[#4EBC34] hover:bg-[#3da028] cursor-default" 
                                    : isConnecting
                                    ? "bg-[#39A9FF]/50 cursor-wait"
                                    : "bg-[#39A9FF] hover:bg-[#2d8cd6]"
                            } ${isConnecting ? 'animate-pulse' : ''}`}
                        >
                            {isConnecting ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Connecting...
                                </span>
                            ) : connected ? (
                                <span className="flex items-center gap-2">
                                    <BluetoothIcon className="w-5 h-5" />
                                    Disconnect
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <BluetoothIcon className="w-5 h-5" />
                                    Connect Device
                                </span>
                            )}
                        </button>
                    ) : (
                        <form onSubmit={handleRegister} className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                            <button
                                type="submit"
                                disabled={isRegistering}
                                className={`px-6 py-3 rounded-xl font-semibold text-white transition-all ${
                                    isRegistering ? "bg-[#39A9FF]/50 cursor-wait" : "bg-[#39A9FF] hover:bg-[#2d8cd6]"
                                }`}
                            >
                                {isRegistering ? 'Registering...' : 'Register Device'}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {connectError ? (
                <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm web-fade-in delay-2">
                    {connectError}
                </div>
            ) : null}

            {hasDevice && (
                <>
                    {/* Battery Status */}
                    <div className={`${isLight ? "bg-white" : "bg-[#050816]/80"} p-6 rounded-2xl mb-6 web-fade-in delay-2`}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className={`${isLight ? "text-black" : "text-white"} text-lg font-semibold`}>Battery Status</h2>
                            <BatteryIcon className={`w-6 h-6 ${isLight ? "text-black" : "text-[#39A9FF]"}`} />
                        </div>
                        <div className="flex items-end gap-2">
                            <span className={`${isLight ? "text-black" : "text-white"} text-5xl font-bold`}>94</span>
                            <span className={`${isLight ? "text-black/70" : "text-[#9BB3D6]"} text-2xl mb-2`}>%</span>
                        </div>
                        <div className="mt-4 w-full bg-gray-600/20 rounded-full h-3 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#4EBC34] to-[#22C55E] h-full rounded-full" style={{ width: '94%' }}></div>
                        </div>
                        <p className={`${isLight ? "text-black/70" : "text-[#9BB3D6]"} text-sm mt-3`}>Estimated 8 hours remaining</p>
                    </div>

                    {/* Sensors Status */}
                    <div className={`${isLight ? "bg-white" : "bg-[#050816]/80"} p-8 rounded-2xl web-fade-in delay-3`}>
                        <h2 className={`${isLight ? "text-black" : "text-white"} text-xl font-semibold mb-6`}>Sensor Status</h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            {allSensors.map((sensor, index) => (
                                <div key={index} className={`${isLight ? "bg-[#F1F1F1]" : "bg-[#0F2A52]"} p-5 rounded-xl`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`${isLight ? "text-black/70" : "text-[#9BB3D6]"} text-sm`}>{sensor.name}</span>
                                        <div className={`h-3 w-3 rounded-full ${
                                            sensor.status.toLowerCase() === "active" 
                                                ? "bg-[#22C55E]" 
                                                : "bg-red-600"
                                        } animate-pulse`}></div>
                                    </div>
                                    <p className={`text-lg font-semibold ${
                                        sensor.status.toLowerCase() === "active" 
                                            ? "text-[#22C55E]" 
                                            : "text-red-600"
                                    }`}>
                                        {sensor.status}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

        </div>
    )
}

export default UserDevice


import React, { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { getRecentAlerts, getSystemActivity } from './firebaseService';

// Mock SVG Icons - replace with your actual imports
const UsersIcon = ({ className }) => <div className={className}>👥</div>;
const DashboardIcon = ({ className }) => <div className={className}>📊</div>;
const DevicesIcon = ({ className }) => <div className={className}>📱</div>;
const AlertIcon = ({ className }) => <div className={className}>⚠️</div>;

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

// Simple dot component to replace BsDot
const Dot = ({ className }) => (
    <span className={className}>•</span>
);

function Dashboard() {
    const [totalUsers, setTotalUsers] = useState(0);
    const [ridersCount, setRidersCount] = useState(0);
    const [emergencyContactsCount, setEmergencyContactsCount] = useState(0);
    const [monthlyGrowth, setMonthlyGrowth] = useState(0);
    const [loading, setLoading] = useState(true);
    const [recentAlerts, setRecentAlerts] = useState([]);
    const [systemActivity, setSystemActivity] = useState([]);
    const [loadingAlerts, setLoadingAlerts] = useState(true);
    const [loadingActivity, setLoadingActivity] = useState(true);

    // Fetch users from Firebase
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Fetch riders from users collection
                const usersRef = collection(db, 'users');
                const usersSnapshot = await getDocs(usersRef);
                
                // Filter for riders (exclude admin)
                const allUsers = usersSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Filter users by role - STRICT filtering
                // Riders: ONLY users with role exactly "rider" (case-insensitive)
                // Emergency Contacts: users with emergency contact related roles
                // Admin: users with role "admin"
                
                const riders = allUsers.filter(user => {
                    const role = user.role?.toLowerCase()?.trim();
                    // ONLY count users with role exactly "rider"
                    return role === 'rider';
                });
                
                const emergencyContacts = allUsers.filter(user => {
                    const role = user.role?.toLowerCase()?.trim();
                    // Include users with emergency contact related roles
                    return role === 'emergency_contact' || 
                           role === 'emergencycontact' ||
                           role === 'contact' ||
                           role === 'emergency contact' ||
                           role === 'emergency-contact';
                });
                
                const adminUsers = allUsers.filter(user => {
                    const role = user.role?.toLowerCase()?.trim();
                    return role === 'admin';
                });
                
                // Log all roles found for debugging
                const allRoles = allUsers.map(u => ({
                    id: u.id,
                    email: u.email,
                    role: u.role,
                    roleLower: u.role?.toLowerCase()?.trim()
                }));
                
                console.log(`Total users fetched: ${allUsers.length}`);
                console.log(`Riders (role="rider" only): ${riders.length}`);
                console.log(`Emergency Contacts: ${emergencyContacts.length}`);
                console.log(`Admin users: ${adminUsers.length}`);
                console.log('All users with roles:', allRoles);
                
                // Check for users that don't match any category
                const uncategorized = allUsers.filter(user => {
                    const role = user.role?.toLowerCase()?.trim();
                    return role !== 'admin' && 
                           role !== 'rider' &&
                           role !== 'emergency_contact' && 
                           role !== 'emergencycontact' &&
                           role !== 'contact' &&
                           role !== 'emergency contact' &&
                           role !== 'emergency-contact';
                });
                
                if (uncategorized.length > 0) {
                    console.warn(`⚠️ Found ${uncategorized.length} users with unrecognized roles:`, 
                        uncategorized.map(u => ({ email: u.email, role: u.role }))
                    );
                }

                // Combine riders and emergency contacts
                const ridersAndContacts = [...riders, ...emergencyContacts];

                // Calculate users created in the past month
                const oneMonthAgo = Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
                const usersThisMonth = ridersAndContacts.filter(user => {
                    const createdAt = user.createdAt;
                    if (!createdAt) return false;
                    
                    // Handle both Timestamp and Date objects
                    let userDate;
                    if (createdAt.toDate) {
                        userDate = createdAt.toDate();
                    } else if (createdAt instanceof Date) {
                        userDate = createdAt;
                    } else if (createdAt.seconds) {
                        // Handle Firestore Timestamp format
                        userDate = new Date(createdAt.seconds * 1000);
                    } else {
                        return false;
                    }
                    
                    return userDate >= oneMonthAgo.toDate();
                });

                // Calculate percentage growth
                const total = ridersAndContacts.length;
                const thisMonth = usersThisMonth.length;
                const percentage = total > 0 ? ((thisMonth / total) * 100).toFixed(1) : 0;

                setRidersCount(riders.length);
                setEmergencyContactsCount(emergencyContacts.length);
                setTotalUsers(total);
                setMonthlyGrowth(parseFloat(percentage));
                
                console.log('Final counts:', {
                    riders: riders.length,
                    emergencyContacts: emergencyContacts.length,
                    total: total,
                    monthlyGrowth: percentage + '%'
                });
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Pie chart data - only riders and emergency contacts
    // Always show both segments even if one is 0
    const pieData = [
        { name: 'Riders', value: ridersCount || 0, color: '#22D3EE' },
        { name: 'Emergency Contacts', value: emergencyContactsCount || 0, color: '#4ADE80' }
    ];
    
    // Filter out zero values for display, but keep at least one segment
    const displayPieData = pieData.filter(item => item.value > 0).length > 0 
        ? pieData.filter(item => item.value > 0)
        : [{ name: 'No Data', value: 1, color: '#6B7280' }];

    // Fetch recent alerts
    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                setLoadingAlerts(true);
                const alerts = await getRecentAlerts(5);
                // Transform alerts to match the expected format
                const formattedAlerts = alerts.map(alert => {
                    const timeOfOccurrence = alert.time_of_occurrence || alert.time_of_occurence || alert.timestamp;
                    let secondsAgo = 0;
                    
                    if (timeOfOccurrence) {
                        if (timeOfOccurrence.toDate) {
                            // Firestore Timestamp
                            const alertTime = timeOfOccurrence.toDate();
                            secondsAgo = Math.floor((Date.now() - alertTime.getTime()) / 1000);
                        } else if (timeOfOccurrence.seconds) {
                            // Firestore Timestamp object
                            const alertTime = new Date(timeOfOccurrence.seconds * 1000);
                            secondsAgo = Math.floor((Date.now() - alertTime.getTime()) / 1000);
                        } else if (typeof timeOfOccurrence === 'number') {
                            secondsAgo = timeOfOccurrence;
                        } else if (timeOfOccurrence instanceof Date) {
                            secondsAgo = Math.floor((Date.now() - timeOfOccurrence.getTime()) / 1000);
                        }
                    }
                    
                    return {
                        deviceNo: alert.deviceId || alert.deviceID || alert.deviceNo || alert.device_id || 'Unknown',
                        time_of_occurence: secondsAgo,
                        type: alert.type || alert.alertType || 'Crash Detected',
                        id: alert.id
                    };
                });
                setRecentAlerts(formattedAlerts);
            } catch (error) {
                console.error('Error fetching alerts:', error);
                setRecentAlerts([]);
            } finally {
                setLoadingAlerts(false);
            }
        };
        
        fetchAlerts();
    }, []);

    // Fetch system activity
    useEffect(() => {
        const fetchActivity = async () => {
            try {
                setLoadingActivity(true);
                const activities = await getSystemActivity(5);
                // Transform activities to match the expected format
                const formattedActivities = activities.map(activity => {
                    const timestamp = activity.timestamp || activity.createdAt || activity.time;
                    let timeStr = 'Unknown';
                    
                    if (timestamp) {
                        if (timestamp.toDate) {
                            // Firestore Timestamp
                            const activityTime = timestamp.toDate();
                            timeStr = activityTime.toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                            });
                        } else if (timestamp.seconds) {
                            // Firestore Timestamp object
                            const activityTime = new Date(timestamp.seconds * 1000);
                            timeStr = activityTime.toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                            });
                        } else if (timestamp instanceof Date) {
                            timeStr = timestamp.toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                            });
                        } else if (typeof timestamp === 'string') {
                            timeStr = timestamp;
                        }
                    }
                    
                    return {
                        action: activity.action || activity.type || activity.activityType || 'registration',
                        time: timeStr,
                        id: activity.id,
                        description: activity.description || activity.message || ''
                    };
                });
                setSystemActivity(formattedActivities);
            } catch (error) {
                console.error('Error fetching system activity:', error);
                setSystemActivity([]);
            } finally {
                setLoadingActivity(false);
            }
        };
        
        fetchActivity();
    }, []);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#0A1A3A] p-3 rounded-lg border border-gray-600">
                    <p className="text-white font-semibold">{payload[0].name}</p>
                    <p className="text-[#9BB3D6]">{payload[0].value.toLocaleString()}</p>
                </div>
            );
        }
        return null;
    };

    return (
        
            <div className="bg-[#0F2A52] rounded-3xl p-8">
                <h1 className="font-semibold text-white text-2xl mb-8">Dashboard</h1>

                {/* Pie Chart Section */}
                <div className="bg-[#0A1A3A] p-8 rounded-xl mb-8">
                <h2 className="text-white font-semibold text-lg mb-6">Users Overview</h2>
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="w-full md:w-1/2">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={displayPieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value, percent }) => 
                                        value > 0 ? `${name}: ${value} (${(percent * 100).toFixed(1)}%)` : ''
                                    }
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {displayPieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    
                    {/* Legend with stats */}
                    <div className="w-full md:w-1/2 grid grid-cols-1 gap-4">
                        <div className="bg-[#0F2A52] p-5 rounded-lg border border-gray-600">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22D3EE' }}></div>
                                <span className="text-[#9BB3D6] text-sm">Riders</span>
                            </div>
                            <h3 className="text-white font-semibold text-2xl">
                                {loading ? '...' : ridersCount.toLocaleString()}
                            </h3>
                        </div>

                        <div className="bg-[#0F2A52] p-5 rounded-lg border border-gray-600">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#4ADE80' }}></div>
                                <span className="text-[#9BB3D6] text-sm">Emergency Contacts</span>
                            </div>
                            <h3 className="text-white font-semibold text-2xl">
                                {loading ? '...' : emergencyContactsCount.toLocaleString()}
                            </h3>
                        </div>

                        <div className="bg-[#0F2A52] p-5 rounded-lg border-2 border-[#22D3EE]">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[#9BB3D6] text-sm font-semibold">Total Users</span>
                            </div>
                            <h3 className="text-white font-semibold text-2xl">
                                {loading ? '...' : totalUsers.toLocaleString()}
                            </h3>
                            <p className="text-[#4ADE80] text-sm mt-2">
                                {loading ? '...' : `+${monthlyGrowth}% this month`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Recent Alerts and System Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 justify-between gap-6">
                <div className="p-6 bg-[#0A1A3A] rounded-xl w-full">
                    <h2 className="text-white font-semibold text-lg mb-6">Recent Alerts</h2>

                    {loadingAlerts ? (
                        <div className="text-[#9BB3D6] text-sm">Loading alerts...</div>
                    ) : recentAlerts.length === 0 ? (
                        <div className="text-[#9BB3D6] text-sm">No recent alerts</div>
                    ) : (
                        recentAlerts.map((alert, index) => (
                            <div key={alert.id || index} className="mb-3 bg-[#0F2A52] p-4 flex flex-row rounded-lg justify-between border border-gray-600">
                                <div className="flex flex-row gap-4">
                                    <div className="bg-[#ef4444]/20 rounded-lg p-2 h-fit">
                                        <AlertIcon className="text-[#f87171]" />
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-white text-sm font-medium">{alert.type || 'Crash Detected'}</h3>
                                        <span className="text-[#9BB3D6] text-xs mt-1">Device #{alert.deviceNo} • {formatTimeAgo(alert.time_of_occurence)}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 bg-[#0A1A3A] rounded-xl w-full">
                    <h2 className="text-white font-semibold text-lg mb-6">System Activity</h2>
                    {loadingActivity ? (
                        <div className="text-[#9BB3D6] text-sm">Loading activity...</div>
                    ) : systemActivity.length === 0 ? (
                        <div className="text-[#9BB3D6] text-sm">No recent activity</div>
                    ) : (
                        systemActivity.map((act, index) => (
                            <div key={act.id || index} className="mb-4 flex flex-row">
                                <Dot className="text-[#06b6d4] text-4xl leading-none" />
                                <div className="text-[#9BB3D6] text-sm flex flex-col ml-2">
                                    <span className="text-white font-medium">
                                        {act.description || `New user ${act.action} verified`}
                                    </span>
                                    <span className="text-xs mt-1">{act.time} • System Auto check</span>
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
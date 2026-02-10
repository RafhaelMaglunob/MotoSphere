import React, { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';

function ChangeLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Fetch logs from Firestore
    useEffect(() => {
        fetchLogs();
    }, []);
    
    const fetchLogs = async () => {
        try {
            setLoading(true);
            const logsRef = collection(db, 'changelogs');
            const q = query(logsRef, orderBy('date', 'desc'));
            const snapshot = await getDocs(q);
            
            const logsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            setLogs(logsData);
        } catch (error) {
            console.error('Error fetching changelogs:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };
    
    const getTypeColor = (logType) => {
        switch(logType) {
            case 'feature':
                return 'bg-[#22D3EE]/20 text-[#22D3EE] border-[#22D3EE]/40';
            case 'bugfix':
                return 'bg-[#EF4444]/20 text-[#F87171] border-[#EF4444]/40';
            case 'improvement':
                return 'bg-[#4ADE80]/20 text-[#4ADE80] border-[#4ADE80]/40';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
        }
    };
    
    const getTypeIcon = (logType) => {
        switch(logType) {
            case 'feature':
                return '✨';
            case 'bugfix':
                return '🐛';
            case 'improvement':
                return '⚡';
            default:
                return '📝';
        }
    };

    return (
        <div className="bg-[#0F2A52] rounded-3xl p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="font-semibold text-white text-2xl">Change Logs</h1>
                <p className="text-[#9BB3D6] text-sm">
                    Automatically generated whenever admins perform changes in the system.
                </p>
            </div>

            {/* Change Logs List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-[#9BB3D6] text-center py-8">Loading change logs...</div>
                ) : logs.length === 0 ? (
                    <div className="text-[#9BB3D6] text-center py-8">No change logs yet.</div>
                ) : (
                    logs.map((log) => (
                        <div key={log.id} className="bg-[#0A1A3A] p-6 rounded-xl border border-gray-600">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{getTypeIcon(log.type)}</span>
                                    <div>
                                        <h2 className="text-white font-semibold text-xl">
                                            {log.summary || 'System Change'}
                                        </h2>
                                        <p className="text-[#9BB3D6] text-sm">
                                            {formatDate(log.date)}
                                            {log.actorEmail && (
                                                <>
                                                    {' '}
                                                    • by{' '}
                                                    <span className="text-white">
                                                        {log.actorName || log.actorEmail}
                                                    </span>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(log.type)}`}>
                                        {(log.type || 'system').charAt(0).toUpperCase() + (log.type || 'system').slice(1)}
                                    </span>
                                </div>
                            </div>
                            
                            {log.changes && log.changes.length > 0 && (
                                <div className="space-y-2">
                                    {log.changes.map((change, index) => (
                                        <div key={index} className="flex items-start gap-2">
                                            <span className="text-[#22D3EE] mt-1">•</span>
                                            <p className="text-white text-sm flex-1">{change}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ChangeLogs;
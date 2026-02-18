import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { settingsAPI } from '../services/api';

function Announcements() {
  const { isLight } = useOutletContext();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await settingsAPI.getPublicBroadcasts();
        if (res.success) {
          setItems(res.broadcasts || []);
        } else {
          setError(res.message || 'Failed to load announcements');
        }
      } catch (e) {
        setError(e?.message || 'Failed to load announcements');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="md:p-3">
      <div className="flex flex-row w-full justify-between items-center">
        <div>
          <h1 className={`${isLight ? "text-black" : "text-white"} text-2xl md:text-3xl font-semibold tracking-wide`}>Announcements</h1>
          <span className={`${isLight ? "text-black" : "text-[#9BB3D6]"} text-xs md:text-sm`}>Latest messages from MotoSphere.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 mt-6">
        {loading && (
          <div className={`${isLight ? "bg-white" : "bg-[#0F2A52]"} px-6 py-8 rounded-2xl text-center`}>
            <p className={`${isLight ? "text-black/60" : "text-[#9BB3D6]"} text-sm`}>Loading announcements…</p>
          </div>
        )}
        {!loading && error && (
          <div className={`${isLight ? "bg-white" : "bg-[#0F2A52]"} px-6 py-8 rounded-2xl text-center`}>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        {!loading && !error && items.length === 0 && (
          <div className={`${isLight ? "bg-white" : "bg-[#0F2A52]"} px-6 py-8 rounded-2xl text-center`}>
            <p className={`${isLight ? "text-black/60" : "text-[#9BB3D6]"} text-sm`}>No announcements yet.</p>
          </div>
        )}
        {!loading && !error && items.map(b => (
          <div
            key={b.id}
            className={`${isLight ? "bg-white hover:bg-black/10" : "bg-[#0F2A52] hover:bg-gray-900/20"} px-6 py-4 rounded-2xl`}
          >
            <div className={`${isLight ? "text-black" : "text-white"} font-semibold mb-1`}>
              {b.title}
            </div>
            <div className={`${isLight ? "text-black/80" : "text-slate-300"} text-sm`}>
              {b.body}
            </div>
            <div className={`${isLight ? "text-black/60" : "text-slate-400"} text-xs mt-2`}>
              {b.createdAt ? new Date(b.createdAt).toLocaleString() : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Announcements;

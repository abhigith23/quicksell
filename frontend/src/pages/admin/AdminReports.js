import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/reports')
      .then(({ data }) => setReports(data))
      .catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoading(false));
  }, []);

  const resolve = async (id, action) => {
    try {
      await api.post(`/api/admin/reports/${id}/resolve`, { action });
      toast.success('Report resolved');
      setReports(r => r.map(x => x.id === id ? { ...x, resolved: true, action } : x));
    } catch { toast.error('Failed to resolve'); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Reports 🚩</h1>
      {reports.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">✅</p>
          <p className="font-medium">No reports found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map(r => (
            <div key={r.id} className={`bg-white dark:bg-gray-900 rounded-2xl border p-5 shadow-sm ${r.resolved ? 'border-gray-100 dark:border-gray-800 opacity-60' : 'border-red-100 dark:border-red-900/40'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.resolved ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-700'}`}>
                      {r.resolved ? `Resolved: ${r.action}` : 'Unresolved'}
                    </span>
                  </div>
                  <p className="font-semibold">{r.reason}</p>
                  <p className="text-sm text-gray-400 mt-1">Listing ID: <span className="font-mono text-xs">{r.listingId}</span></p>
                  <p className="text-sm text-gray-400">Reported by: <span className="font-mono text-xs">{r.reportedBy}</span></p>
                </div>
                {!r.resolved && (
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button onClick={() => resolve(r.id, 'delete_listing')} className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">🗑 Delete Listing</button>
                    <button onClick={() => resolve(r.id, 'block_user')} className="px-3 py-1.5 text-xs bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium">🚫 Block User</button>
                    <button onClick={() => resolve(r.id, 'dismiss')} className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 font-medium">Dismiss</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

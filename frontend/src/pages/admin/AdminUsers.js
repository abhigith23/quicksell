// AdminUsers.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [blockingId, setBlockingId] = useState(null);

  useEffect(() => {
    api.get('/api/admin/users')
      .then(({ data }) => setUsers(data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const block = async (id) => {
    if (!blockReason.trim()) return toast.error('Enter a reason');
    try {
      await api.post(`/api/admin/users/${id}/block`, { reason: blockReason });
      toast.success('User blocked');
      setUsers(u => u.map(x => x.uid === id ? { ...x, isBlocked: true, blockReason } : x));
      setBlockingId(null); setBlockReason('');
    } catch { toast.error('Failed'); }
  };

  const unblock = async (id) => {
    try {
      await api.post(`/api/admin/users/${id}/unblock`);
      toast.success('User unblocked');
      setUsers(u => u.map(x => x.uid === id ? { ...x, isBlocked: false } : x));
    } catch { toast.error('Failed'); }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Manage Users 👥</h1>
      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search by name or email..."
        className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />

      <div className="space-y-3">
        {filtered.map(u => (
          <div key={u.uid} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <img src={u.photoURL || `https://ui-avatars.com/api/?name=${u.name}&background=3b82f6&color=fff`}
                alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold">{u.name}</p>
                  {u.isAdmin && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Admin</span>}
                  {u.isBlocked && <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 px-2 py-0.5 rounded-full">Blocked</span>}
                </div>
                <p className="text-sm text-gray-400">{u.email}</p>
                {u.phone && <p className="text-xs text-gray-400">{u.phone}</p>}
                {u.isBlocked && u.blockReason && <p className="text-xs text-red-500 mt-0.5">Reason: {u.blockReason}</p>}
              </div>
              {!u.isAdmin && (
                <div className="flex-shrink-0">
                  {u.isBlocked ? (
                    <button onClick={() => unblock(u.uid)} className="px-4 py-2 text-sm bg-green-50 dark:bg-green-900/30 text-green-600 rounded-xl hover:bg-green-100 font-medium">Unblock</button>
                  ) : (
                    <button onClick={() => setBlockingId(u.uid)} className="px-4 py-2 text-sm bg-red-50 dark:bg-red-900/30 text-red-600 rounded-xl hover:bg-red-100 font-medium">Block</button>
                  )}
                </div>
              )}
            </div>
            {blockingId === u.uid && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <input value={blockReason} onChange={e => setBlockReason(e.target.value)}
                  placeholder="Reason for blocking..."
                  className="w-full px-3 py-2 rounded-lg border border-red-200 bg-white dark:bg-gray-900 text-sm mb-2 focus:outline-none" />
                <div className="flex gap-2">
                  <button onClick={() => { setBlockingId(null); setBlockReason(''); }} className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg">Cancel</button>
                  <button onClick={() => block(u.uid)} className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg">Confirm Block</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

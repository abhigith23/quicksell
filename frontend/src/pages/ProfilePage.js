import React, { useState } from 'react';
import { useAuth } from '../context';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/api/auth/profile', form);
      updateUser(form);
      toast.success('Profile updated!');
      setEditing(false);
    } catch { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <img
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.name}&background=3b82f6&color=fff&size=128`}
            alt="" className="w-24 h-24 rounded-full object-cover mb-4 ring-4 ring-blue-100 dark:ring-blue-900" />
          <h2 className="text-xl font-bold">{user?.name}</h2>
          <p className="text-gray-400 text-sm">{user?.email}</p>
          {user?.isAdmin && <span className="mt-2 px-3 py-1 bg-red-100 dark:bg-red-900/40 text-red-600 text-xs rounded-full font-semibold">Admin</span>}
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
            <span className="text-gray-500 text-sm">Full Name</span>
            {editing
              ? <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              : <span className="font-medium">{user?.name}</span>}
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
            <span className="text-gray-500 text-sm">Email</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
            <span className="text-gray-500 text-sm">Phone</span>
            {editing
              ? <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                  placeholder="+91 9876543210"
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              : <span className="font-medium">{user?.phone || '—'}</span>}
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
            <span className="text-gray-500 text-sm">Email Verified</span>
            <span className={`text-sm font-medium ${user?.emailVerified ? 'text-green-600' : 'text-red-500'}`}>
              {user?.emailVerified ? '✅ Verified' : '❌ Not Verified'}
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-gray-500 text-sm">Location</span>
            <span className="font-medium">📍 Jaipur, Rajasthan</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-3">
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
              <button onClick={handleSave} disabled={loading} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all">
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

function StatCard({ icon, label, value, color, to }) {
  return (
    <Link to={to || '#'} className={`bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all`}>
      <div className={`text-3xl mb-3`}>{icon}</div>
      <p className="text-3xl font-bold">{value ?? '—'}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </Link>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/dashboard')
      .then(({ data }) => setStats(data))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard ⚙️</h1>
          <p className="text-gray-400 mt-1">Manage QuickSell marketplace</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon="👥" label="Total Users"     value={stats?.totalUsers}       to="/admin/users" />
        <StatCard icon="📦" label="Total Listings"  value={stats?.totalListings}     to="/admin/listings" />
        <StatCard icon="⏳" label="Pending Review"  value={stats?.pendingListings}   to="/admin/listings?status=pending" />
        <StatCard icon="🚩" label="Open Reports"    value={stats?.unresolvedReports} to="/admin/reports" />
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { to: '/admin/listings?status=pending', icon: '📋', label: 'Review Pending Listings', desc: `${stats?.pendingListings || 0} listings awaiting approval`, color: 'blue' },
          { to: '/admin/reports',   icon: '🚩', label: 'Resolve Reports',    desc: `${stats?.unresolvedReports || 0} unresolved reports`, color: 'red' },
          { to: '/admin/users',     icon: '👥', label: 'Manage Users',       desc: `${stats?.totalUsers || 0} registered users`, color: 'green' },
          { to: '/admin/categories',icon: '🏷️', label: 'Manage Categories',  desc: 'Add, edit, delete categories', color: 'purple' },
          { to: '/admin/listings',  icon: '📦', label: 'All Listings',       desc: `${stats?.totalListings || 0} total listings`, color: 'orange' },
        ].map(({ to, icon, label, desc }) => (
          <Link key={to} to={to} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md transition-all">
            <p className="text-2xl mb-2">{icon}</p>
            <p className="font-semibold">{label}</p>
            <p className="text-sm text-gray-400 mt-1">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

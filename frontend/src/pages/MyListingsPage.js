import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const statusColor = { approved: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700', rejected: 'bg-red-100 text-red-700' };

export default function MyListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchMyListings(); }, []);

  const fetchMyListings = async () => {
    try {
      const { data } = await api.get('/api/listings/user/mine');
      setListings(data);
    } catch { toast.error('Failed to load listings'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await api.delete(`/api/listings/${id}`);
      setListings(l => l.filter(x => x.id !== id));
      toast.success('Listing deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = filter === 'all' ? listings : listings.filter(l => l.status === filter);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Listings</h1>
        <Link to="/create-listing" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all">
          + New Listing
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['all','approved','pending','rejected'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${filter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'}`}>
            {s} {s === 'all' ? `(${listings.length})` : `(${listings.filter(l => l.status === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-xl font-semibold">No listings here</p>
          <Link to="/create-listing" className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all">
            Create your first listing
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(listing => (
            <div key={listing.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex gap-4 items-start shadow-sm hover:shadow-md transition-all">
              <img src={listing.images?.[0]?.url || 'https://via.placeholder.com/80'} alt=""
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold truncate">{listing.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${statusColor[listing.status]}`}>
                    {listing.status}
                  </span>
                </div>
                <p className="text-blue-600 font-bold mt-1">₹{listing.price?.toLocaleString('en-IN')}</p>
                <p className="text-sm text-gray-400 mt-1">{listing.category} • {listing.condition} • 👁 {listing.views} views</p>
                {listing.status === 'rejected' && listing.rejectionReason && (
                  <p className="text-xs text-red-500 mt-1">❌ Reason: {listing.rejectionReason}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Link to={`/listing/${listing.id}`} className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 font-medium">View</Link>
                <Link to={`/edit-listing/${listing.id}`} className="px-3 py-1.5 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg hover:bg-blue-100 font-medium">Edit</Link>
                <button onClick={() => handleDelete(listing.id)} className="px-3 py-1.5 text-xs bg-red-50 dark:bg-red-900/30 text-red-600 rounded-lg hover:bg-red-100 font-medium">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

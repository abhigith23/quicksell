import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const statusColor = { approved: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700', rejected: 'bg-red-100 text-red-700' };

export default function AdminListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
  const status = searchParams.get('status') || '';

  useEffect(() => { fetchListings(); }, [status]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/listings', { params: { status } });
      setListings(data);
    } catch { toast.error('Failed to load listings'); }
    finally { setLoading(false); }
  };

  const approve = async (id) => {
    try {
      await api.post(`/api/admin/listings/${id}/approve`);
      toast.success('Listing approved ✅');
      fetchListings();
    } catch { toast.error('Failed to approve'); }
  };

  const reject = async (id) => {
    if (!rejectReason.trim()) return toast.error('Enter a reason');
    try {
      await api.post(`/api/admin/listings/${id}/reject`, { reason: rejectReason });
      toast.success('Listing rejected');
      setRejectingId(null);
      setRejectReason('');
      fetchListings();
    } catch { toast.error('Failed to reject'); }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Manage Listings 📦</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['', 'pending', 'approved', 'rejected'].map(s => (
          <button key={s} onClick={() => setSearchParams(s ? { status: s } : {})}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${status === s ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📭</p><p>No listings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map(l => (
            <div key={l.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
              <div className="flex gap-4 items-start">
                <img src={l.images?.[0]?.url || 'https://via.placeholder.com/80'} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold">{l.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[l.status]}`}>{l.status}</span>
                  </div>
                  <p className="text-blue-600 font-bold">₹{l.price?.toLocaleString('en-IN')}</p>
                  <p className="text-sm text-gray-400 mt-1">{l.category} · {l.condition} · Seller: {l.sellerName}</p>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{l.description}</p>
                  {l.status === 'rejected' && l.rejectionReason && (
                    <p className="text-xs text-red-500 mt-1">Reason: {l.rejectionReason}</p>
                  )}
                </div>
                {l.status === 'pending' && (
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button onClick={() => approve(l.id)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-xl transition-all font-medium">✅ Approve</button>
                    <button onClick={() => setRejectingId(l.id)} className="px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 text-sm rounded-xl hover:bg-red-100 transition-all font-medium">❌ Reject</button>
                  </div>
                )}
              </div>

              {/* Reject reason modal inline */}
              {rejectingId === l.id && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <p className="text-sm font-semibold mb-2 text-red-700 dark:text-red-400">Rejection Reason</p>
                  <input value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    className="w-full px-3 py-2 rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-gray-900 text-sm mb-3 focus:outline-none" />
                  <div className="flex gap-2">
                    <button onClick={() => { setRejectingId(null); setRejectReason(''); }} className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg">Cancel</button>
                    <button onClick={() => reject(l.id)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Confirm Reject</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

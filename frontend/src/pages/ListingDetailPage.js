import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context';
import { Spinner } from '../components/Spinner';
import toast from 'react-hot-toast';

export default function ListingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');

  useEffect(() => { fetchListing(); }, [id]);

  const fetchListing = async () => {
    try {
      const { data } = await api.get(`/api/listings/${id}`);
      setListing(data);
    } catch { toast.error('Listing not found'); navigate('/'); }
    finally { setLoading(false); }
  };

  const handleChat = async () => {
    if (!user) return navigate('/login');
    if (listing.sellerId === user.uid) return toast.error("You can't chat with yourself");
    try {
      const { data } = await api.post('/api/chat/rooms', {
        sellerId: listing.sellerId, listingId: id, listingTitle: listing.title
      });
      navigate(`/chat/${data.roomId}`);
    } catch { toast.error('Could not open chat'); }
  };

  const handleWishlist = async () => {
    if (!user) return navigate('/login');
    try {
      const isWishlisted = user.wishlist?.includes(id);
      if (isWishlisted) { await api.delete(`/api/wishlist/${id}`); toast.success('Removed from wishlist'); }
      else { await api.post(`/api/wishlist/${id}`); toast.success('Added to wishlist ❤️'); }
    } catch { toast.error('Failed'); }
  };

  const handleReport = async () => {
    if (!reportReason) return toast.error('Please select a reason');
    try {
      await api.post('/api/reports', { listingId: id, reportedUserId: listing.sellerId, reason: reportReason });
      toast.success('Report submitted');
      setReporting(false);
    } catch { toast.error('Failed to report'); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!listing) return null;

  const conditionBadge = { 'new': '🟢 New', 'like-new': '🔵 Like New', 'used': '🟡 Used', 'old': '🔴 Old' };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-fade">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-3">
            <img src={listing.images?.[imgIndex]?.url || 'https://via.placeholder.com/500'}
              alt={listing.title} className="w-full h-full object-cover" />
          </div>
          {listing.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {listing.images.map((img, i) => (
                <button key={i} onClick={() => setImgIndex(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === imgIndex ? 'border-blue-600' : 'border-transparent'}`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex gap-2 flex-wrap mb-2">
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 px-2 py-1 rounded-full">{listing.category}</span>
            <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">{conditionBadge[listing.condition]}</span>
            {listing.status === 'pending' && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Pending Approval</span>}
          </div>

          <h1 className="text-2xl font-bold mb-2">{listing.title}</h1>
          <p className="text-3xl font-bold text-blue-600 mb-4">₹{listing.price?.toLocaleString('en-IN')}</p>

          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">{listing.description}</p>

          {/* Seller info */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
            <h3 className="font-semibold mb-2">Seller Information</h3>
            <div className="flex items-center gap-3 mb-3">
              <img src={listing.sellerPhoto || `https://ui-avatars.com/api/?name=${listing.sellerName}&background=3b82f6&color=fff`}
                alt="" className="w-10 h-10 rounded-full" />
              <div>
                <p className="font-medium">{listing.sellerName}</p>
                <p className="text-sm text-gray-400">📍 Jaipur, Rajasthan</p>
              </div>
            </div>
            {listing.sellerPhone && (
              <p className="text-sm text-gray-600 dark:text-gray-400">📞 {listing.sellerPhone}</p>
            )}
          </div>

          {/* Actions */}
          {user?.uid !== listing.sellerId ? (
            <div className="space-y-3">
              <button onClick={handleChat}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
                💬 Chat with Seller
              </button>
              <button onClick={handleWishlist}
                className="w-full py-3 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all">
                {user?.wishlist?.includes(id) ? '❤️ Remove from Wishlist' : '🤍 Add to Wishlist'}
              </button>
              <button onClick={() => setReporting(true)}
                className="w-full py-2 text-sm text-red-500 hover:text-red-600 transition-all">
                🚩 Report this listing
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <Link to={`/edit-listing/${id}`}
                className="block w-full py-3 bg-green-600 hover:bg-green-700 text-white text-center font-semibold rounded-xl transition-all">
                ✏️ Edit Listing
              </Link>
            </div>
          )}

          <p className="text-xs text-gray-400 mt-4 text-center">👁 {listing.views} views</p>
        </div>
      </div>

      {/* Report Modal */}
      {reporting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md animate-fade">
            <h3 className="font-bold text-lg mb-4">Report Listing</h3>
            <div className="space-y-2 mb-4">
              {['Spam or misleading', 'Prohibited item', 'Wrong category', 'Offensive content', 'Fraud or scam'].map(r => (
                <label key={r} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <input type="radio" name="reason" value={r} onChange={e => setReportReason(e.target.value)} />
                  {r}
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setReporting(false)} className="flex-1 py-2 border border-gray-200 dark:border-gray-700 rounded-xl">Cancel</button>
              <button onClick={handleReport} className="flex-1 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700">Submit Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

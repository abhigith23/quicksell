import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context';
import api from '../services/api';
import toast from 'react-hot-toast';

const conditionColors = {
  'new':      'bg-green-100 text-green-700',
  'like-new': 'bg-blue-100 text-blue-700',
  'used':     'bg-yellow-100 text-yellow-700',
  'old':      'bg-red-100 text-red-700'
};

export default function ListingCard({ listing, onWishlistChange }) {
  const { user } = useAuth();
  const isWishlisted = user?.wishlist?.includes(listing.id);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to save items');
    try {
      if (isWishlisted) {
        await api.delete(`/api/wishlist/${listing.id}`);
        toast.success('Removed from wishlist');
      } else {
        await api.post(`/api/wishlist/${listing.id}`);
        toast.success('Added to wishlist ❤️');
      }
      if (onWishlistChange) onWishlistChange();
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <Link
      to={`/listing/${listing.id}`}
      className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 dark:border-gray-800 transition-all duration-300 animate-fade"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={listing.images?.[0]?.url || 'https://via.placeholder.com/300x225?text=No+Image'}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button
          onClick={toggleWishlist}
          className="absolute top-2 right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-all"
        >
          {isWishlisted ? '❤️' : '🤍'}
        </button>
        {listing.condition && (
          <span className={`absolute bottom-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium ${conditionColors[listing.condition] || 'bg-gray-100 text-gray-600'}`}>
            {listing.condition}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
          {listing.title}
        </h3>
        <p className="text-blue-600 dark:text-blue-400 font-bold text-lg mt-1">
          ₹{listing.price?.toLocaleString('en-IN')}
        </p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-400 truncate">{listing.sellerName}</p>
          <p className="text-xs text-gray-400">👁 {listing.views || 0}</p>
        </div>
        <p className="text-xs text-gray-400 mt-1">📦 {listing.category}</p>
      </div>
    </Link>
  );
}

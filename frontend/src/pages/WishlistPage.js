import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

import ListingCard from '../components/ListingCard';
import { SkeletonCard } from '../components/Spinner';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchWishlist(); }, []);

  const fetchWishlist = async () => {
    try {
      const { data } = await api.get('/api/wishlist');
      setItems(data);
    } catch { toast.error('Failed to load wishlist'); }
    finally { setLoading(false); }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">My Wishlist ❤️</h1>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🤍</p>
          <p className="text-xl font-semibold">Your wishlist is empty</p>
          <p className="text-gray-400 mt-2">Save items you love by clicking the heart icon</p>
          <Link to="/" className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all">
            Browse Listings
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(l => <ListingCard key={l.id} listing={l} onWishlistChange={fetchWishlist} />)}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ListingCard from '../components/ListingCard';
import { SkeletonCard } from '../components/Spinner';

const CATEGORIES = ['Electronics','Vehicles','Furniture','Books','Clothing','Property'];

export default function HomePage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const keyword  = searchParams.get('keyword')  || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sortBy   = searchParams.get('sortBy')   || 'newest';

  useEffect(() => {
    fetchListings();
  }, [searchParams]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/listings', { params: { keyword, category, minPrice, maxPrice, sortBy } });
      setListings(data.listings || []);
    } catch { setListings([]); }
    finally { setLoading(false); }
  };

  const set = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    setSearchParams(p);
  };

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Buy & Sell in Jaipur 🏪</h1>
          <p className="text-blue-100 mb-8 text-lg">Find great deals on local items near you</p>
          <div className="max-w-xl mx-auto flex gap-2">
            <input value={keyword} onChange={e => set('keyword', e.target.value)}
              placeholder="Search for phones, bikes, furniture..."
              className="flex-1 px-5 py-3 rounded-xl text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            <button onClick={fetchListings}
              className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold rounded-xl transition-all">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Category pills */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 py-4 overflow-x-auto">
        <div className="container mx-auto px-4 flex gap-2 flex-nowrap">
          <button onClick={() => set('category', '')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${!category ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'}`}>
            All
          </button>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => set('category', cat === category ? '' : cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${category === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Filters + Listings */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-3 mb-6">
          <input type="number" value={minPrice} onChange={e => set('minPrice', e.target.value)}
            placeholder="Min ₹" className="w-28 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm" />
          <input type="number" value={maxPrice} onChange={e => set('maxPrice', e.target.value)}
            placeholder="Max ₹" className="w-28 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm" />
          <select value={sortBy} onChange={e => set('sortBy', e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm">
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
          {(keyword || category || minPrice || maxPrice) && (
            <button onClick={() => setSearchParams({})}
              className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 text-sm hover:bg-red-100 transition-all">
              Clear Filters ✕
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-xl font-semibold">No listings found</p>
            <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{listings.length} items found</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {listings.map(l => <ListingCard key={l.id} listing={l} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-12">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3 text-blue-600">🏪 QuickSell</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Buy and sell locally in Jaipur. Fast, easy, and free.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Link to="/" className="hover:text-blue-600">Browse Listings</Link>
              <Link to="/create-listing" className="hover:text-blue-600">Sell an Item</Link>
              <Link to="/wishlist" className="hover:text-blue-600">Wishlist</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Categories</h4>
            <div className="flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Link to="/?category=Electronics" className="hover:text-blue-600">📱 Electronics</Link>
              <Link to="/?category=Vehicles" className="hover:text-blue-600">🚗 Vehicles</Link>
              <Link to="/?category=Furniture" className="hover:text-blue-600">🛋️ Furniture</Link>
              <Link to="/?category=Property" className="hover:text-blue-600">🏠 Property</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <div className="flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>📍 Jaipur, Rajasthan</span>
              <span>📧 support@quicksell.in</span>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} QuickSell. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

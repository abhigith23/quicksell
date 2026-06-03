import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context';
import { useTheme } from '../context';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path) => location.pathname === path;

  const navLink = (to, label) => (
    <Link to={to} onClick={() => setMenuOpen(false)}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive(to) ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
          🏪 QuickSell
          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-normal">Jaipur</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLink('/', 'Browse')}
          {user && navLink('/create-listing', '+ Sell')}
          {user && navLink('/my-listings', 'My Listings')}
          {user && navLink('/wishlist', '❤️ Wishlist')}
          {user && navLink('/chat', '💬 Chat')}
          {user?.isAdmin && navLink('/admin', '⚙️ Admin')}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button onClick={toggleDarkMode} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
            {darkMode ? '☀️' : '🌙'}
          </button>

          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <Link to="/profile" className="flex items-center gap-2 hover:opacity-80">
                <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.name}&background=3b82f6&color=fff`} alt="" className="w-8 h-8 rounded-full object-cover" />
                <span className="text-sm font-medium">{user.name?.split(' ')[0]}</span>
              </Link>
              <button onClick={handleLogout} className="px-4 py-2 text-sm bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-all font-medium">
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden md:flex gap-2">
              <Link to="/login" className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Login</Link>
              <Link to="/register" className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all">Sign Up</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5">
            <span className={`w-5 h-0.5 bg-current transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`w-5 h-0.5 bg-current transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`w-5 h-0.5 bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-2 animate-fade">
          {navLink('/', 'Browse')}
          {user && navLink('/create-listing', '+ Sell Item')}
          {user && navLink('/my-listings', 'My Listings')}
          {user && navLink('/wishlist', '❤️ Wishlist')}
          {user && navLink('/chat', '💬 Chat')}
          {user?.isAdmin && navLink('/admin', '⚙️ Admin Panel')}
          {user ? (
            <button onClick={handleLogout} className="text-left px-3 py-2 text-sm text-red-600 font-medium">Logout</button>
          ) : (
            <>
              {navLink('/login', 'Login')}
              {navLink('/register', 'Sign Up')}
            </>
          )}
        </div>
      )}
    </nav>
  );
}

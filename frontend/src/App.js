import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ThemeProvider, useAuth } from './context';
import { Toaster } from 'react-hot-toast';

import Navbar               from './components/Navbar';
import Footer               from './components/Footer';
import HomePage             from './pages/HomePage';
import LoginPage            from './pages/LoginPage';
import RegisterPage         from './pages/RegisterPage';
import ListingDetailPage    from './pages/ListingDetailPage';
import CreateListingPage    from './pages/CreateListingPage';
import EditListingPage      from './pages/EditListingPage';
import MyListingsPage       from './pages/MyListingsPage';
import ChatPage             from './pages/ChatPage';
import WishlistPage         from './pages/WishlistPage';
import ProfilePage          from './pages/ProfilePage';
import NotFoundPage         from './pages/NotFoundPage';
import AdminDashboard       from './pages/admin/AdminDashboard';
import AdminListings        from './pages/admin/AdminListings';
import AdminUsers           from './pages/admin/AdminUsers';
import AdminReports         from './pages/admin/AdminReports';
import AdminCategories      from './pages/admin/AdminCategories';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (!user.isAdmin) return <Navigate to="/" />;
  return children;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <Navbar />
        <main className="flex-1">

          <Routes>
            <Route path="/"             element={<HomePage />} />
            <Route path="/listing/:id"  element={<ListingDetailPage />} />
            <Route path="/login"        element={<LoginPage />} />
            <Route path="/register"     element={<RegisterPage />} />

            <Route path="/create-listing"   element={<ProtectedRoute><CreateListingPage /></ProtectedRoute>} />
            <Route path="/edit-listing/:id" element={<ProtectedRoute><EditListingPage /></ProtectedRoute>} />
            <Route path="/my-listings"      element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
            <Route path="/chat"             element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/chat/:roomId"     element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/wishlist"         element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
            <Route path="/profile"          element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            <Route path="/admin"             element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/listings"    element={<AdminRoute><AdminListings /></AdminRoute>} />
            <Route path="/admin/users"       element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/reports"     element={<AdminRoute><AdminReports /></AdminRoute>} />
            <Route path="/admin/categories"  element={<AdminRoute><AdminCategories /></AdminRoute>} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}
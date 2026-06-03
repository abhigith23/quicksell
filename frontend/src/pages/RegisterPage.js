import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await api.post('/api/auth/register', {
        name: form.name, email: form.email,
        phone: form.phone, password: form.password
      });
      toast.success('Account created! Please check your email to verify.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const field = (type, key, placeholder, label) => (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input type={type} required
        value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 animate-fade">
        <h1 className="text-3xl font-bold mb-1">Create account 🎉</h1>
        <p className="text-gray-500 mb-8">Join thousands of sellers in Jaipur</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {field('text',     'name',     'Full Name',       'Full Name')}
          {field('email',    'email',    'you@example.com', 'Email')}
          {field('tel',      'phone',    '+91 9876543210',  'Phone Number')}
          {field('password', 'password', '••••••••',        'Password')}
          {field('password', 'confirm',  '••••••••',        'Confirm Password')}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}

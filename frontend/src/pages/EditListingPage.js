import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Electronics','Vehicles','Furniture','Books','Clothing','Property'];
const CONDITIONS = ['new','like-new','used','old'];

export default function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', category: '', condition: 'used', price: '', description: '' });
  const [previews, setPreviews] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    api.get(`/api/listings/${id}`)
      .then(({ data }) => {
        setForm({ title: data.title, category: data.category, condition: data.condition, price: data.price, description: data.description });
        setPreviews(data.images?.map(i => i.url) || []);
      })
      .catch(() => { toast.error('Listing not found'); navigate('/my-listings'); })
      .finally(() => setFetching(false));
  }, [id]);

  const handleImages = (e) => {
    Array.from(e.target.files).forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => {
        setNewImages(p => [...p, ev.target.result]);
        setPreviews(p => [...p, ev.target.result]);
      };
      reader.readAsDataURL(f);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/api/listings/${id}`, { ...form, price: Number(form.price), images: newImages });
      toast.success('Listing updated!');
      navigate('/my-listings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  if (fetching) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Edit Listing ✏️</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <div>
          <label className="block text-sm font-semibold mb-2">Title *</label>
          <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Category *</label>
            <select required value={form.category} onChange={e => setForm({...form, category: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select...</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Condition *</label>
            <select required value={form.condition} onChange={e => setForm({...form, condition: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {CONDITIONS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Price (₹) *</label>
          <input required type="number" min="1" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Description *</label>
          <textarea required rows={5} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Add New Photos</label>
          <label className="block border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 transition-all">
            <input type="file" multiple accept="image/*" onChange={handleImages} className="hidden" />
            <p className="text-2xl mb-1">📷</p>
            <p className="text-sm text-gray-500">Click to add more photos</p>
          </label>
          {previews.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {previews.map((src, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/my-listings')}
            className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

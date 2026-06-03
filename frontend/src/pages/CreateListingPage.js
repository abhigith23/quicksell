import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Electronics','Vehicles','Furniture','Books','Clothing','Property'];
const CONDITIONS = ['new','like-new','used','old'];

function ListingForm({ initial, onSubmit, loading, title }) {
  const [form, setForm]       = useState(initial);
  const [images, setImages]   = useState([]);
  const [previews, setPreviews] = useState(initial.existingImages || []);
  const [suggesting, setSugg] = useState(false);

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => {
        setImages(p => [...p, ev.target.result]);
        setPreviews(p => [...p, ev.target.result]);
      };
      reader.readAsDataURL(f);
    });
  };

  const removePreview = (i) => {
    setPreviews(p => p.filter((_,idx) => idx !== i));
    setImages(p => p.filter((_,idx) => idx !== i));
  };

  const suggestPrice = async () => {
    if (!form.category) return toast.error('Select a category first');
    setSugg(true);
    try {
      const { data } = await api.post('/api/listings/suggest-price', {
        category: form.category, condition: form.condition, description: form.description
      });
      if (data.suggestedPrice) {
        setForm(f => ({ ...f, price: data.suggestedPrice }));
        toast.success(`💡 AI suggests ₹${data.suggestedPrice.toLocaleString('en-IN')}`);
      } else toast.error('Could not suggest price');
    } catch { toast.error('Price suggestion failed'); }
    finally { setSugg(false); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (images.length === 0 && !initial.existingImages?.length) return toast.error('Add at least one image');
    onSubmit({ ...form, images });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">{title}</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">

        <div>
          <label className="block text-sm font-semibold mb-2">Title *</label>
          <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
            placeholder="e.g. iPhone 13, Honda Activa 2022"
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
          <div className="flex gap-2">
            <input required type="number" min="1" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
              placeholder="0"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="button" onClick={suggestPrice} disabled={suggesting}
              className="px-4 py-3 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 rounded-xl hover:bg-purple-200 font-medium transition-all text-sm whitespace-nowrap">
              {suggesting ? '...' : '🤖 AI Price'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Description *</label>
          <textarea required rows={5} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
            placeholder="Describe your item - age, features, defects, accessories included..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Photos *</label>
          <label className="block border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-all">
            <input type="file" multiple accept="image/*" onChange={handleImages} className="hidden" />
            <p className="text-3xl mb-2">📷</p>
            <p className="font-medium">Click to add photos</p>
            <p className="text-sm text-gray-400 mt-1">JPG, PNG, WEBP – max 5 photos</p>
          </label>
          {previews.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removePreview(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all text-lg">
          {loading ? 'Submitting...' : 'Submit Listing'}
        </button>
        <p className="text-center text-sm text-gray-400">Your listing will be reviewed before going live</p>
      </form>
    </div>
  );
}

export default function CreateListingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const initial = { title: '', category: '', condition: 'used', price: '', description: '' };

  const handleSubmit = async (form) => {
    setLoading(true);
    try {
      await api.post('/api/listings', form);
      toast.success('Listing submitted for approval! 🎉');
      navigate('/my-listings');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create listing'); }
    finally { setLoading(false); }
  };

  return <ListingForm initial={initial} onSubmit={handleSubmit} loading={loading} title="Create New Listing" />;
}

export function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initial, setInitial] = useState(null);

  useEffect(() => {
    api.get(`/api/listings/${id}`).then(({ data }) => {
      setInitial({ ...data, existingImages: data.images?.map(i => i.url) || [] });
    }).catch(() => { toast.error('Listing not found'); navigate('/my-listings'); });
  }, [id]);

  const handleSubmit = async (form) => {
    setLoading(true);
    try {
      await api.put(`/api/listings/${id}`, form);
      toast.success('Listing updated!');
      navigate('/my-listings');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setLoading(false); }
  };

  if (!initial) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  return <ListingForm initial={initial} onSubmit={handleSubmit} loading={loading} title="Edit Listing" />;
}

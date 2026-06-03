import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const DEFAULT_CATEGORIES = [
  { name: 'Electronics', icon: '📱' }, { name: 'Vehicles', icon: '🚗' },
  { name: 'Furniture', icon: '🛋️' }, { name: 'Books', icon: '📚' },
  { name: 'Clothing', icon: '👕' }, { name: 'Property', icon: '🏠' }
];

export default function AdminCategories() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', icon: '' });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCats(); }, []);

  const fetchCats = async () => {
    try {
      const { data } = await api.get('/api/admin/categories');
      setCats(data.length ? data : DEFAULT_CATEGORIES.map((c, i) => ({ id: String(i), ...c })));
    } catch { setCats(DEFAULT_CATEGORIES.map((c, i) => ({ id: String(i), ...c }))); }
    finally { setLoading(false); }
  };

  const save = async () => {
    if (!form.name.trim()) return toast.error('Enter category name');
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/api/admin/categories/${editId}`, form);
        setCats(c => c.map(x => x.id === editId ? { ...x, ...form } : x));
        toast.success('Category updated!');
      } else {
        const { data } = await api.post('/api/admin/categories', form);
        setCats(c => [...c, data]);
        toast.success('Category created!');
      }
      setForm({ name: '', icon: '' }); setEditId(null);
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/api/admin/categories/${id}`);
      setCats(c => c.filter(x => x.id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const startEdit = (cat) => { setEditId(cat.id); setForm({ name: cat.name, icon: cat.icon || '' }); };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Manage Categories 🏷️</h1>

      {/* Add/Edit Form */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-8 shadow-sm">
        <h2 className="font-semibold mb-4">{editId ? 'Edit Category' : 'Add New Category'}</h2>
        <div className="flex gap-3">
          <input value={form.icon} onChange={e => setForm({...form, icon: e.target.value})}
            placeholder="Icon (emoji)"
            className="w-24 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-center text-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
            placeholder="Category name"
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button onClick={save} disabled={saving} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all">
            {saving ? '...' : editId ? 'Update' : 'Add'}
          </button>
          {editId && <button onClick={() => { setEditId(null); setForm({ name: '', icon: '' }); }} className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>}
        </div>
      </div>

      {/* Categories List */}
      {loading ? <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {cats.map(cat => (
            <div key={cat.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3 shadow-sm">
              <span className="text-2xl">{cat.icon}</span>
              <span className="flex-1 font-medium">{cat.name}</span>
              <button onClick={() => startEdit(cat)} className="px-3 py-1.5 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg hover:bg-blue-100 font-medium">Edit</button>
              <button onClick={() => del(cat.id)} className="px-3 py-1.5 text-xs bg-red-50 dark:bg-red-900/30 text-red-600 rounded-lg hover:bg-red-100 font-medium">Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

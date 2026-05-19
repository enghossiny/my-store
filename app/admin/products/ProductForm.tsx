'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

type Category = { id: string; name_en: string; name_ar: string };

export default function ProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name_en: '', name_ar: '',
    description_en: '', description_ar: '',
    price: '', stock: '',
    category_id: '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name_en || !form.name_ar || !form.price) return;
    setSaving(true);
    await supabase.from('products').insert({
      name_en: form.name_en,
      name_ar: form.name_ar,
      description_en: form.description_en,
      description_ar: form.description_ar,
      price: parseFloat(form.price),
      stock: parseInt(form.stock) || 0,
      category_id: form.category_id || null,
    });
    setForm({
      name_en: '', name_ar: '',
      description_en: '', description_ar: '',
      price: '', stock: '', category_id: '',
    });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    setSaving(false);
    router.refresh();
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#6b7280' }}>
            Name (English) *
          </label>
          <input name="name_en" value={form.name_en} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#6b7280' }}>
            Name (Arabic) *
          </label>
          <input name="name_ar" value={form.name_ar} onChange={handleChange} style={inputStyle} dir="rtl" />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#6b7280' }}>
            Description (English)
          </label>
          <textarea name="description_en" value={form.description_en} onChange={handleChange}
            rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#6b7280' }}>
            Description (Arabic)
          </label>
          <textarea name="description_ar" value={form.description_ar} onChange={handleChange}
            rows={2} style={{ ...inputStyle, resize: 'vertical' }} dir="rtl" />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#6b7280' }}>
            Price *
          </label>
          <input name="price" value={form.price} onChange={handleChange}
            type="number" placeholder="0.00" style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#6b7280' }}>
            Stock
          </label>
          <input name="stock" value={form.stock} onChange={handleChange}
            type="number" placeholder="0" style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#6b7280' }}>
            Category
          </label>
          <select name="category_id" value={form.category_id} onChange={handleChange} style={inputStyle}>
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name_en}</option>
            ))}
          </select>
        </div>
      </div>

      {success && (
        <p style={{ color: '#16a34a', marginBottom: '1rem', fontSize: '14px' }}>
          ✅ Product added successfully!
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={saving}
        style={{
          padding: '10px 24px',
          background: saving ? '#9ca3af' : '#111',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: saving ? 'not-allowed' : 'pointer',
          fontSize: '14px',
        }}
      >
        {saving ? 'Saving...' : 'Add Product'}
      </button>
    </div>
  );
}
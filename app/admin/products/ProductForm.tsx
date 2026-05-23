'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from '@/components/ImageUploader';

type Category = { id: string; name_en: string; name_ar: string };

export default function ProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name_en: '', name_ar: '',
    description_en: '', description_ar: '',
    price: '', stock: '',
    category_id: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (url: string) => {
    setImages((prev) => [...prev, url]);
  };

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((i) => i !== url));
  };

  const handleSubmit = async () => {
    if (!form.name_en || !form.name_ar || !form.price) {
      setError('Please fill in name (EN), name (AR) and price');
      return;
    }
    setSaving(true);
    setError('');

    const response = await fetch('/api/admin/products', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name_en: form.name_en,
        name_ar: form.name_ar,
        description_en: form.description_en,
        description_ar: form.description_ar,
        price: form.price,
        stock: form.stock,
        category_id: form.category_id || null,
        images,
      }),
    });
    const result = await response.json();

    if (!response.ok || result.error) {
      setError(result.error || 'Failed to save product');
      setSaving(false);
      return;
    }

    setForm({
      name_en: '', name_ar: '',
      description_en: '', description_ar: '',
      price: '', stock: '', category_id: '',
    });
    setImages([]);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    setSaving(false);
    router.refresh();
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
    outline: 'none',
    fontFamily: 'inherit',
  };

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        marginBottom: '1rem',
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
            Name (English) *
          </label>
          <input name="name_en" value={form.name_en} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
            Name (Arabic) *
          </label>
          <input name="name_ar" value={form.name_ar} onChange={handleChange} style={inputStyle} dir="rtl" />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
            Description (English)
          </label>
          <textarea name="description_en" value={form.description_en} onChange={handleChange}
            rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
            Description (Arabic)
          </label>
          <textarea name="description_ar" value={form.description_ar} onChange={handleChange}
            rows={3} style={{ ...inputStyle, resize: 'vertical' }} dir="rtl" />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
            Price *
          </label>
          <input name="price" value={form.price} onChange={handleChange}
            type="number" placeholder="0.00" style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
            Stock
          </label>
          <input name="stock" value={form.stock} onChange={handleChange}
            type="number" placeholder="0" style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
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

      {/* Image upload */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
          Product Images
        </label>

        {/* Uploaded images preview */}
        {images.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '12px',
          }}>
            {images.map((url) => (
              <div key={url} style={{ position: 'relative' }}>
                <img src={url} alt="" loading="lazy" style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'cover',
                  borderRadius: '10px',
                  border: '2px solid #c4b5fd',
                }} />
                <button
                  onClick={() => removeImage(url)}
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '999px',
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >✕</button>
              </div>
            ))}
          </div>
        )}

        <ImageUploader onUpload={handleImageUpload} />
      </div>

      {error && (
        <p style={{ color: '#ef4444', background: '#fef2f2', padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', fontSize: '14px' }}>
          {error}
        </p>
      )}

      {success && (
        <p style={{ color: '#16a34a', background: '#f0fdf4', padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', fontSize: '14px' }}>
          ✅ Product added successfully!
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={saving}
        style={{
          padding: '12px 32px',
          background: saving ? '#9ca3af' : 'linear-gradient(135deg, #6c63ff, #e91e8c)',
          color: '#fff',
          border: 'none',
          borderRadius: '999px',
          cursor: saving ? 'not-allowed' : 'pointer',
          fontSize: '15px',
          fontWeight: '700',
          boxShadow: saving ? 'none' : '0 4px 15px rgba(108,99,255,0.4)',
        }}
      >
        {saving ? 'Saving...' : '+ Add Product'}
      </button>
    </div>
  );
}
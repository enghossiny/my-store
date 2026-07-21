'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import ImageUploader from '@/components/ImageUploader';

type Category = { id: string; name_en: string; name_ar: string };

export default function ProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name_en: '', name_ar: '',
    description_en: '', description_ar: '',
    price: '', stock: '', category_id: '',
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

  const handleSubmit = async () => {
    if (!form.name_en || !form.name_ar || !form.price) {
      setError('Please fill in name (EN), name (AR) and price');
      return;
    }
    setSaving(true);
    setError('');

    const { error: insertError } = await supabase.from('products').insert({
      name_en: form.name_en,
      name_ar: form.name_ar,
      description_en: form.description_en,
      description_ar: form.description_ar,
      price: parseFloat(form.price),
      stock: parseInt(form.stock) || 0,
      category_id: form.category_id || null,
      images,
    });

    if (insertError) {
      setError('Failed to save product: ' + insertError.message);
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
    width: '100%', padding: '10px 12px',
    border: '1.5px solid #e5e7eb', borderRadius: '10px',
    fontSize: '14px', boxSizing: 'border-box' as const,
    fontFamily: 'inherit', outline: 'none',
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>NAME (EN) *</label>
          <input name="name_en" value={form.name_en} onChange={handleChange} placeholder="Product name" style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>NAME (AR) *</label>
          <input name="name_ar" value={form.name_ar} onChange={handleChange} placeholder="اسم المنتج" style={inputStyle} dir="rtl" />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>DESCRIPTION (EN)</label>
          <textarea name="description_en" value={form.description_en} onChange={handleChange} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>DESCRIPTION (AR)</label>
          <textarea name="description_ar" value={form.description_ar} onChange={handleChange} rows={3} style={{ ...inputStyle, resize: 'vertical' }} dir="rtl" />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>PRICE *</label>
          <input name="price" value={form.price} onChange={handleChange} type="number" placeholder="0.00" style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>STOCK</label>
          <input name="stock" value={form.stock} onChange={handleChange} type="number" placeholder="0" style={inputStyle} />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>CATEGORY</label>
          <select name="category_id" value={form.category_id} onChange={handleChange} style={inputStyle}>
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name_en}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Images section */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
          PRODUCT IMAGES ({images.length} uploaded)
        </label>

        {/* Uploaded images */}
        {images.length > 0 && (
          <div style={{
            display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px',
            padding: '12px', background: '#f9fafb', borderRadius: '12px',
            border: '1px solid #f3f4f6',
          }}>
            {images.map((url, i) => (
              <div key={url} style={{ position: 'relative' }}>
                <img src={url} alt={`Image ${i + 1}`} style={{
                  width: '80px', height: '80px', objectFit: 'cover',
                  borderRadius: '10px', border: i === 0 ? '3px solid #6c63ff' : '2px solid #e5e7eb',
                }} />
                {i === 0 && (
                  <span style={{
                    position: 'absolute', bottom: '-6px', left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#6c63ff', color: '#fff',
                    fontSize: '9px', fontWeight: '700',
                    padding: '1px 6px', borderRadius: '999px', whiteSpace: 'nowrap',
                  }}>
                    MAIN
                  </span>
                )}
                <button
                  onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                  style={{
                    position: 'absolute', top: '-8px', right: '-8px',
                    background: '#ef4444', color: '#fff', border: 'none',
                    borderRadius: '999px', width: '22px', height: '22px',
                    cursor: 'pointer', fontSize: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '700',
                  }}
                >✕</button>
              </div>
            ))}
          </div>
        )}

        <ImageUploader onUpload={(url) => setImages(prev => [...prev, url])} />

        {images.length > 1 && (
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#9ca3af' }}>
            💡 First image is the main display image. Drag to reorder (coming soon).
          </p>
        )}
      </div>

      {error && (
        <p style={{ color: '#ef4444', background: '#fef2f2', padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', fontSize: '14px' }}>
          ❌ {error}
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
          color: '#fff', border: 'none', borderRadius: '999px',
          cursor: saving ? 'not-allowed' : 'pointer',
          fontSize: '15px', fontWeight: '700', fontFamily: 'inherit',
          boxShadow: saving ? 'none' : '0 4px 15px rgba(108,99,255,0.4)',
        }}
      >
        {saving ? 'Saving...' : '+ Add Product'}
      </button>
    </div>
  );
}
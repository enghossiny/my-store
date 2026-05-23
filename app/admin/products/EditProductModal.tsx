'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from '@/components/ImageUploader';

type Category = { id: string; name_en: string; name_ar: string };
type Product = {
  id: string; name_en: string; name_ar: string;
  description_en: string; description_ar: string;
  price: number; stock: number; category_id: string; images: string[];
};

export default function EditProductModal({
  product, categories,
}: {
  product: Product;
  categories: Category[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name_en: product.name_en, name_ar: product.name_ar,
    description_en: product.description_en ?? '',
    description_ar: product.description_ar ?? '',
    price: String(product.price), stock: String(product.stock),
    category_id: product.category_id ?? '',
  });
  const [images, setImages] = useState<string[]>(product.images ?? []);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    const response = await fetch(`/api/admin/products/${product.id}`, {
      method: 'PUT',
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

    setSuccess(true);
    setSaving(false);
    router.refresh();
    setTimeout(() => { setSuccess(false); setOpen(false); }, 1000);
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px',
    border: '1.5px solid #e5e7eb', borderRadius: '8px',
    fontSize: '13px', boxSizing: 'border-box' as const,
    fontFamily: 'inherit', outline: 'none',
  };

  return (
    <>
      <button onClick={() => setOpen(true)} style={{
        flex: 1, padding: '8px',
        background: '#f8f7ff', color: '#6c63ff',
        border: '1px solid #c4b5fd', borderRadius: '8px',
        cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit',
      }}>
        ✏️ Edit
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem',
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px', padding: '2rem',
            width: '100%', maxWidth: '640px', maxHeight: '90vh',
            overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Edit Product</h2>
              <button onClick={() => setOpen(false)} style={{
                background: '#f3f4f6', border: 'none', borderRadius: '999px',
                width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px',
              }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>NAME (EN)</label>
                <input name="name_en" value={form.name_en} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>NAME (AR)</label>
                <input name="name_ar" value={form.name_ar} onChange={handleChange} style={inputStyle} dir="rtl" />
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
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>PRICE</label>
                <input name="price" value={form.price} onChange={handleChange} type="number" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>STOCK</label>
                <input name="stock" value={form.stock} onChange={handleChange} type="number" style={inputStyle} />
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

            {/* Images */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                IMAGES
              </label>
              {images.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {images.map((url) => (
                    <div key={url} style={{ position: 'relative' }}>
                      <img src={url} alt="" loading="lazy" style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #c4b5fd' }} />
                      <button onClick={() => setImages(images.filter(i => i !== url))} style={{
                        position: 'absolute', top: '-6px', right: '-6px',
                        background: '#ef4444', color: '#fff', border: 'none',
                        borderRadius: '999px', width: '18px', height: '18px',
                        cursor: 'pointer', fontSize: '10px',
                      }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
              <ImageUploader onUpload={(url) => setImages([...images, url])} />
            </div>

            {error && (
              <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '1rem' }}>
                ❌ {error}
              </p>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleSave} disabled={saving} style={{
                flex: 1, padding: '12px',
                background: success ? '#16a34a' : saving ? '#9ca3af' : 'linear-gradient(135deg, #6c63ff, #e91e8c)',
                color: '#fff', border: 'none', borderRadius: '999px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '15px', fontWeight: '800', fontFamily: 'inherit',
              }}>
                {success ? '✅ Saved!' : saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => setOpen(false)} style={{
                padding: '12px 24px', background: '#f3f4f6',
                color: '#374151', border: 'none', borderRadius: '999px',
                cursor: 'pointer', fontSize: '15px', fontWeight: '600', fontFamily: 'inherit',
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
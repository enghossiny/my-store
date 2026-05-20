'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegionForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name_en: '', name_ar: '', delivery_fee: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name_en || !form.name_ar || !form.delivery_fee) {
      setError('All fields are required');
      return;
    }
    setSaving(true);
    setError('');

    const response = await fetch('/api/admin/regions', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name_en: form.name_en,
        name_ar: form.name_ar,
        delivery_fee: form.delivery_fee,
      }),
    });
    const result = await response.json();

    if (!response.ok || result.error) {
      setError(result.error || 'Failed to add region');
      setSaving(false);
      return;
    }

    setForm({ name_en: '', name_ar: '', delivery_fee: '' });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    setSaving(false);
    router.refresh();
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px',
    border: '1.5px solid #e5e7eb', borderRadius: '8px',
    fontSize: '14px', boxSizing: 'border-box' as const,
    fontFamily: 'inherit', outline: 'none',
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
            NAME (ENGLISH) *
          </label>
          <input name="name_en" value={form.name_en} onChange={handleChange}
            placeholder="Cairo" style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
            NAME (ARABIC) *
          </label>
          <input name="name_ar" value={form.name_ar} onChange={handleChange}
            placeholder="القاهرة" style={inputStyle} dir="rtl" />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
            DELIVERY FEE ($) *
          </label>
          <input name="delivery_fee" value={form.delivery_fee} onChange={handleChange}
            type="number" placeholder="20" style={inputStyle} />
        </div>
      </div>

      {error && <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '1rem' }}>❌ {error}</p>}
      {success && <p style={{ color: '#16a34a', fontSize: '13px', marginBottom: '1rem' }}>✅ Region added!</p>}

      <button onClick={handleSubmit} disabled={saving} style={{
        padding: '10px 28px',
        background: saving ? '#9ca3af' : 'linear-gradient(135deg, #6c63ff, #e91e8c)',
        color: '#fff', border: 'none', borderRadius: '999px',
        cursor: saving ? 'not-allowed' : 'pointer',
        fontSize: '14px', fontWeight: '700', fontFamily: 'inherit',
      }}>
        {saving ? 'Adding...' : '+ Add Region'}
      </button>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Region = { id: string; name_en: string; name_ar: string; delivery_fee: number };

export default function EditRegionButton({ region }: { region: Region }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name_en: region.name_en,
    name_ar: region.name_ar,
    delivery_fee: String(region.delivery_fee),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');

    const response = await fetch(`/api/admin/regions/${region.id}`, {
      method: 'PUT',
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
      setError(result.error || 'Failed to save region');
      setSaving(false);
      return;
    }

    setSaving(false);
    setOpen(false);
    router.refresh();
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px',
    border: '1.5px solid #e5e7eb', borderRadius: '8px',
    fontSize: '14px', boxSizing: 'border-box' as const,
    fontFamily: 'inherit', outline: 'none',
  };

  return (
    <>
      <button onClick={() => setOpen(true)} style={{
        padding: '5px 14px', background: '#f8f7ff', color: '#6c63ff',
        border: '1px solid #c4b5fd', borderRadius: '6px',
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
            width: '100%', maxWidth: '480px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Edit Region</h2>
              <button onClick={() => setOpen(false)} style={{
                background: '#f3f4f6', border: 'none', borderRadius: '999px',
                width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px',
              }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>NAME (EN)</label>
                <input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>NAME (AR)</label>
                <input value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} style={inputStyle} dir="rtl" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>DELIVERY FEE ({process.env.NEXT_PUBLIC_CURRENCY ?? 'EGP'})</label>
                <input type="number" value={form.delivery_fee} onChange={(e) => setForm({ ...form, delivery_fee: e.target.value })} style={inputStyle} />
              </div>
            </div>

            {error && (
              <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '1rem' }}>
                ❌ {error}
              </p>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleSave} disabled={saving} style={{
                flex: 1, padding: '12px',
                background: saving ? '#9ca3af' : 'linear-gradient(135deg, #6c63ff, #e91e8c)',
                color: '#fff', border: 'none', borderRadius: '999px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '15px', fontWeight: '800', fontFamily: 'inherit',
              }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => setOpen(false)} style={{
                padding: '12px 24px', background: '#f3f4f6',
                color: '#374151', border: 'none', borderRadius: '999px',
                cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600',
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
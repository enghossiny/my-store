'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function PromoForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    code: '', discount_type: 'percentage',
    discount_value: '', min_order_amount: '0',
    max_uses: '', expires_at: '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.code || !form.discount_value) {
      setError('Code and discount value are required');
      return;
    }
    setSaving(true);
    setError('');

    const { error: insertError } = await supabase.from('promo_codes').insert({
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value),
      min_order_amount: parseFloat(form.min_order_amount) || 0,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      expires_at: form.expires_at || null,
      active: true,
    });

    if (insertError) {
      setError(insertError.message.includes('unique')
        ? 'This code already exists'
        : 'Failed to create promo code');
      setSaving(false);
      return;
    }

    setForm({
      code: '', discount_type: 'percentage',
      discount_value: '', min_order_amount: '0',
      max_uses: '', expires_at: '',
    });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    setSaving(false);
    router.refresh();
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
  };

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        marginBottom: '1rem',
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
            Code *
          </label>
          <input name="code" value={form.code} onChange={handleChange}
            placeholder="SAVE10" style={{ ...inputStyle, textTransform: 'uppercase', letterSpacing: '1px' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
            Discount Type *
          </label>
          <select name="discount_type" value={form.discount_type} onChange={handleChange} style={inputStyle}>
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount ($)</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
            Discount Value *
          </label>
          <input name="discount_value" value={form.discount_value} onChange={handleChange}
            type="number" placeholder={form.discount_type === 'percentage' ? '10' : '5.00'}
            style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
            Min Order Amount ($)
          </label>
          <input name="min_order_amount" value={form.min_order_amount} onChange={handleChange}
            type="number" placeholder="0" style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
            Max Uses (leave empty = unlimited)
          </label>
          <input name="max_uses" value={form.max_uses} onChange={handleChange}
            type="number" placeholder="∞" style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
            Expiry Date (optional)
          </label>
          <input name="expires_at" value={form.expires_at} onChange={handleChange}
            type="datetime-local" style={inputStyle} />
        </div>
      </div>

      {error && (
        <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '1rem' }}>❌ {error}</p>
      )}
      {success && (
        <p style={{ color: '#16a34a', fontSize: '13px', marginBottom: '1rem' }}>✅ Promo code created!</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={saving}
        style={{
          padding: '10px 28px',
          background: saving ? '#9ca3af' : 'linear-gradient(135deg, #6c63ff, #e91e8c)',
          color: '#fff',
          border: 'none',
          borderRadius: '999px',
          cursor: saving ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: '700',
          fontFamily: 'inherit',
        }}
      >
        {saving ? 'Creating...' : '+ Create Promo Code'}
      </button>
    </div>
  );
}
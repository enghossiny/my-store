'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

type PromoResult = {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  discountAmount: number;
};

type Props = {
  lang: string;
  orderTotal: number;
  onApply: (promo: PromoResult | null) => void;
};

export default function PromoCode({ lang, orderTotal, onApply }: Props) {
  const isAr = lang === 'ar';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [applied, setApplied] = useState<PromoResult | null>(null);

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');

    const { data, error: dbError } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .eq('active', true)
      .single();

    if (dbError || !data) {
      setError(isAr ? 'كود الخصم غير صحيح' : 'Invalid promo code');
      setLoading(false);
      return;
    }

    // Check expiry
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setError(isAr ? 'انتهت صلاحية كود الخصم' : 'Promo code has expired');
      setLoading(false);
      return;
    }

    // Check max uses
    if (data.max_uses !== null && data.used_count >= data.max_uses) {
      setError(isAr ? 'تم استخدام هذا الكود بالحد الأقصى' : 'Promo code has reached its limit');
      setLoading(false);
      return;
    }

    // Check minimum order
    if (orderTotal < data.min_order_amount) {
      setError(
        isAr
          ? `الحد الأدنى للطلب EGP ${data.min_order_amount}`
          : `Minimum order amount is EGP ${data.min_order_amount}`
      );
      setLoading(false);
      return;
    }

    // Calculate discount
    let discountAmount = 0;
    if (data.discount_type === 'percentage') {
      discountAmount = (orderTotal * data.discount_value) / 100;
    } else {
      discountAmount = data.discount_value;
    }

    const result: PromoResult = {
      code: data.code,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      discountAmount: parseFloat(discountAmount.toFixed(2)),
    };

    setApplied(result);
    onApply(result);
    setLoading(false);
  };

  const handleRemove = () => {
    setApplied(null);
    setCode('');
    setError('');
    onApply(null);
  };

  if (applied) {
    return (
      <div style={{
        padding: '12px 16px',
        background: '#f0fdf4',
        border: '1.5px solid #86efac',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🎉</span>
          <div>
            <p style={{ margin: 0, fontWeight: '700', color: '#15803d', fontSize: '14px' }}>
              {applied.code}
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#16a34a' }}>
              {applied.discount_type === 'percentage'
                ? `${applied.discount_value}% ${isAr ? 'خصم' : 'off'}`
                : `EGP ${applied.discount_value} ${isAr ? 'خصم' : 'off'}`}
              {' — '}
              {isAr ? 'وفرت' : 'You save'} EGP {applied.discountAmount}
            </p>
          </div>
        </div>
        <button
          onClick={handleRemove}
          style={{
            background: 'none',
            border: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: '18px',
          }}
        >✕</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          placeholder={isAr ? 'أدخل كود الخصم' : 'Enter promo code'}
          style={{
            flex: 1,
            padding: '10px 14px',
            border: '1.5px solid #e5e7eb',
            borderRadius: '10px',
            fontSize: '14px',
            fontFamily: 'inherit',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            outline: 'none',
          }}
        />
        <button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          style={{
            padding: '10px 20px',
            background: loading || !code.trim()
              ? '#e5e7eb'
              : 'linear-gradient(135deg, #6c63ff, #e91e8c)',
            color: loading || !code.trim() ? '#9ca3af' : '#fff',
            border: 'none',
            borderRadius: '10px',
            cursor: loading || !code.trim() ? 'not-allowed' : 'pointer',
            fontWeight: '700',
            fontSize: '14px',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
          }}
        >
          {loading
            ? '...'
            : isAr ? 'تطبيق' : 'Apply'}
        </button>
      </div>
      {error && (
        <p style={{
          color: '#ef4444',
          fontSize: '13px',
          margin: '6px 0 0',
        }}>
          ❌ {error}
        </p>
      )}
    </div>
  );
}
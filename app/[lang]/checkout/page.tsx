'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cartContext';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PromoCode from '@/components/PromoCode';

type PromoResult = {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  discountAmount: number;
};

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const params = useParams();
  const router = useRouter();
  const lang = params.lang as string;
  const isAr = lang === 'ar';

  const [form, setForm] = useState({
    name: '', phone: '', address: '', notes: '',
  });
  const [promo, setPromo] = useState<PromoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const discount = promo?.discountAmount ?? 0;
  const finalTotal = Math.max(0, total - discount);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.address) {
      setError(isAr ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields');
      return;
    }
    if (items.length === 0) {
      setError(isAr ? 'السلة فارغة' : 'Your cart is empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create or find customer
      let customerId = null;
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', form.phone)
        .single();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({ name: form.name, phone: form.phone, address: form.address })
          .select('id')
          .single();
        if (customerError) throw customerError;
        customerId = newCustomer.id;
      }

      // 2. Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: customerId,
          auth_id: (await supabase.auth.getUser()).data.user?.id ?? null,
          status: 'pending',
          total: finalTotal,
          discount: discount,
          promo_code: promo?.code ?? null,
          address: form.address,
          phone: form.phone,
          notes: form.notes,
        })
        .select('id')
        .single();
      if (orderError) throw orderError;

      // 3. Save order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(items.map((item) => ({
          order_id: order.id,
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
        })));
      if (itemsError) throw itemsError;

      // 4. Increment promo code usage
      if (promo) {
        await supabase.rpc('increment_promo_usage', { promo_code: promo.code });
      }

      // 5. Send Telegram notification
      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            customerName: form.name,
            phone: form.phone,
            address: form.address,
            notes: form.notes,
            total: finalTotal.toFixed(2),
            discount: discount > 0 ? discount.toFixed(2) : null,
            promoCode: promo?.code ?? null,
            items: items.map((item) => ({
              name: item.name_en,
              quantity: item.quantity,
              price: item.price,
            })),
          }),
        });
      } catch (err) {
        console.error('Notification error:', err);
      }

      // 6. Clear and redirect
      clearCart();
      router.push(`/${lang}/checkout/success?order=${order.id}`);

    } catch (err) {
      console.error(err);
      setError(isAr ? 'حدث خطأ، يرجى المحاولة مجدداً' : 'Something went wrong, please try again');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <main style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <p style={{ fontSize: '48px' }}>🛒</p>
        <h2>{isAr ? 'السلة فارغة' : 'Your cart is empty'}</h2>
        <Link href={`/${lang}/products`} style={{
          display: 'inline-block', marginTop: '1rem',
          padding: '10px 24px', background: '#6c63ff',
          color: '#fff', borderRadius: '999px', textDecoration: 'none',
        }}>
          {isAr ? 'تسوق الآن' : 'Shop Now'}
        </Link>
      </main>
    );
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '15px',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
    outline: 'none',
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontSize: '32px',
        fontWeight: '800',
      }}>
        {isAr ? 'إتمام الطلب' : 'Checkout'}
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

        {/* Left — form */}
        <div>
          <h2 style={{ fontSize: '18px', marginBottom: '1.5rem', fontWeight: '700' }}>
            {isAr ? 'بيانات التوصيل' : 'Delivery Details'}
          </h2>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
              {isAr ? 'الاسم الكامل *' : 'Full Name *'}
            </label>
            <input name="name" value={form.name} onChange={handleChange}
              placeholder={isAr ? 'أدخل اسمك الكامل' : 'Enter your full name'}
              style={inputStyle} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
              {isAr ? 'رقم الهاتف *' : 'Phone Number *'}
            </label>
            <input name="phone" value={form.phone} onChange={handleChange}
              placeholder={isAr ? 'أدخل رقم هاتفك' : 'Enter your phone number'}
              style={inputStyle} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
              {isAr ? 'عنوان التوصيل *' : 'Delivery Address *'}
            </label>
            <textarea name="address" value={form.address} onChange={handleChange}
              placeholder={isAr ? 'أدخل عنوانك بالتفصيل' : 'Enter your full address'}
              rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
              {isAr ? 'ملاحظات (اختياري)' : 'Notes (optional)'}
            </label>
            <textarea name="notes" value={form.notes} onChange={handleChange}
              placeholder={isAr ? 'أي تعليمات إضافية' : 'Any extra instructions'}
              rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          {/* Promo code */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
              🎟️ {isAr ? 'كود الخصم' : 'Promo Code'}
            </label>
            <PromoCode lang={lang} orderTotal={total} onApply={setPromo} />
          </div>

          {/* Cash on delivery badge */}
          <div style={{
            padding: '12px 16px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{ fontSize: '24px' }}>💵</span>
            <div>
              <p style={{ margin: 0, fontWeight: '700', color: '#15803d' }}>
                {isAr ? 'الدفع عند الاستلام' : 'Cash on Delivery'}
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#16a34a' }}>
                {isAr ? 'ادفع عند وصول طلبك' : 'Pay when your order arrives'}
              </p>
            </div>
          </div>

          {error && (
            <p style={{
              color: '#ef4444', background: '#fef2f2',
              padding: '10px 14px', borderRadius: '10px',
              marginBottom: '1rem', fontSize: '14px',
            }}>
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #6c63ff, #e91e8c)',
              color: '#fff',
              border: 'none',
              borderRadius: '999px',
              fontSize: '16px',
              fontWeight: '800',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(108,99,255,0.4)',
              fontFamily: 'inherit',
            }}
          >
            {loading
              ? (isAr ? 'جاري تأكيد الطلب...' : 'Placing order...')
              : (isAr ? '✓ تأكيد الطلب' : '✓ Place Order')}
          </button>
        </div>

        {/* Right — order summary */}
        <div>
          <h2 style={{ fontSize: '18px', marginBottom: '1.5rem', fontWeight: '700' }}>
            {isAr ? 'ملخص الطلب' : 'Order Summary'}
          </h2>

          <div style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            overflow: 'hidden',
          }}>
            {items.map((item, index) => (
              <div key={item.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderBottom: index < items.length - 1 ? '1px solid #f3f4f6' : 'none',
              }}>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: '600' }}>
                    {isAr ? item.name_ar : item.name_en}
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>
                    LE {item.price} × {item.quantity}
                  </p>
                </div>
                <p style={{ margin: 0, fontWeight: '700' }}>
                  LE {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}

            {/* Subtotal */}
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '14px',
              color: '#6b7280',
            }}>
              <span>{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
              <span>LE {total.toFixed(2)}</span>
            </div>

            {/* Discount row */}
            {discount > 0 && (
              <div style={{
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '14px',
                color: '#16a34a',
                fontWeight: '600',
                background: '#f0fdf4',
              }}>
                <span>🎟️ {promo?.code}</span>
                <span>− LE {discount.toFixed(2)}</span>
              </div>
            )}

            {/* Final total */}
            <div style={{
              padding: '16px',
              background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <p style={{ margin: 0, fontWeight: '700', color: '#fff', fontSize: '16px' }}>
                {isAr ? 'المجموع الكلي' : 'Total'}
              </p>
              <p style={{ margin: 0, fontWeight: '800', color: '#fff', fontSize: '22px' }}>
                LE {finalTotal.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
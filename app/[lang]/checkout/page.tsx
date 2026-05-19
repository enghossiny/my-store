'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cartContext';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const params = useParams();
  const router = useRouter();
  const lang = params.lang as string;
  const isAr = lang === 'ar';

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
          .insert({
            name: form.name,
            phone: form.phone,
            address: form.address,
          })
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
            total: total,
            address: form.address,
            phone: form.phone,
            notes: form.notes,
        })
        .select('id')
        .single();

      if (orderError) throw orderError;

      // 3. Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 4. Clear cart and redirect to success
      clearCart();
      router.push(`/${lang}/checkout/success?order=${order.id}`);

    } catch (err) {
      console.error(err);
      setError(isAr ? 'حدث خطأ، يرجى المحاولة مجدداً' : 'Something went wrong, please try again');
    } finally {
      setLoading(false);
    }
  };

  // Empty cart
  if (items.length === 0) {
    return (
      <main style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <p style={{ fontSize: '48px' }}>🛒</p>
        <h2>{isAr ? 'السلة فارغة' : 'Your cart is empty'}</h2>
        <Link href={`/${lang}/products`} style={{
          display: 'inline-block',
          marginTop: '1rem',
          padding: '10px 24px',
          background: '#111',
          color: '#fff',
          borderRadius: '8px',
          textDecoration: 'none',
        }}>
          {isAr ? 'تسوق الآن' : 'Shop Now'}
        </Link>
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>
        {isAr ? 'إتمام الطلب' : 'Checkout'}
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
      }}>

        {/* Left — form */}
        <div>
          <h2 style={{ fontSize: '18px', marginBottom: '1.5rem' }}>
            {isAr ? 'بيانات التوصيل' : 'Delivery Details'}
          </h2>

          {/* Name */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#374151' }}>
              {isAr ? 'الاسم الكامل *' : 'Full Name *'}
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder={isAr ? 'أدخل اسمك الكامل' : 'Enter your full name'}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '15px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Phone */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#374151' }}>
              {isAr ? 'رقم الهاتف *' : 'Phone Number *'}
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder={isAr ? 'أدخل رقم هاتفك' : 'Enter your phone number'}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '15px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Address */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#374151' }}>
              {isAr ? 'عنوان التوصيل *' : 'Delivery Address *'}
            </label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder={isAr ? 'أدخل عنوانك بالتفصيل' : 'Enter your full address'}
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '15px',
                boxSizing: 'border-box',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#374151' }}>
              {isAr ? 'ملاحظات (اختياري)' : 'Notes (optional)'}
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder={isAr ? 'أي تعليمات إضافية للتوصيل' : 'Any extra delivery instructions'}
              rows={2}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '15px',
                boxSizing: 'border-box',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Payment method badge */}
          <div style={{
            padding: '12px 16px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ fontSize: '20px' }}>💵</span>
            <div>
              <p style={{ margin: 0, fontWeight: '500', color: '#15803d' }}>
                {isAr ? 'الدفع عند الاستلام' : 'Cash on Delivery'}
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#16a34a' }}>
                {isAr ? 'ادفع عند وصول طلبك' : 'Pay when your order arrives'}
              </p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <p style={{
              color: '#ef4444',
              background: '#fef2f2',
              padding: '10px 14px',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '14px',
            }}>
              {error}
            </p>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#9ca3af' : '#111',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading
              ? (isAr ? 'جاري تأكيد الطلب...' : 'Placing order...')
              : (isAr ? 'تأكيد الطلب' : 'Place Order')}
          </button>
        </div>

        {/* Right — order summary */}
        <div>
          <h2 style={{ fontSize: '18px', marginBottom: '1.5rem' }}>
            {isAr ? 'ملخص الطلب' : 'Order Summary'}
          </h2>

          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            {items.map((item, index) => (
              <div key={item.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: index < items.length - 1 ? '1px solid #e5e7eb' : 'none',
              }}>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: '500' }}>
                    {isAr ? item.name_ar : item.name_en}
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                    x{item.quantity}
                  </p>
                </div>
                <p style={{ margin: 0, fontWeight: '500' }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}

            {/* Total */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '16px',
              background: '#f9fafb',
              borderTop: '2px solid #111',
            }}>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px' }}>
                {isAr ? 'المجموع الكلي' : 'Total'}
              </p>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px' }}>
                ${total.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
'use client';

import { useState, useEffect } from 'react';
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

type Region = {
  id: string;
  name_en: string;
  name_ar: string;
  delivery_fee: number;
};

type PaymentMethod = 'cod' | 'instapay' | 'wallet';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const params = useParams();
  const router = useRouter();
  const lang = params.lang as string;
  const isAr = lang === 'ar';

  const [form, setForm] = useState({
    name: '', phone: '', address: '', notes: '',
  });
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [paymentReference, setPaymentReference] = useState('');
  const [promo, setPromo] = useState<PromoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const instapayAccount = process.env.NEXT_PUBLIC_INSTAPAY_ACCOUNT ?? '';
  const walletNumber = process.env.NEXT_PUBLIC_WALLET_NUMBER ?? '';

  const deliveryFee = selectedRegion?.delivery_fee ?? 0;
  const discount = promo?.discountAmount ?? 0;
  const finalTotal = Math.max(0, total + deliveryFee - discount);

  useEffect(() => {
    supabase
      .from('delivery_regions')
      .select('*')
      .eq('active', true)
      .order('delivery_fee', { ascending: true })
      .then(({ data }) => setRegions(data ?? []));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const region = regions.find((r) => r.id === e.target.value) ?? null;
    setSelectedRegion(region);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.address) {
      setError(isAr ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields');
      return;
    }
    if (!selectedRegion) {
      setError(isAr ? 'يرجى اختيار منطقة التوصيل' : 'Please select a delivery region');
      return;
    }
    if (paymentMethod !== 'cod' && !paymentReference) {
      setError(isAr ? 'يرجى إدخال رقم مرجع الدفع' : 'Please enter your payment reference number');
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
        .from('customers').select('id').eq('phone', form.phone).single();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({ name: form.name, phone: form.phone, address: form.address })
          .select('id').single();
        if (customerError) throw customerError;
        customerId = newCustomer.id;
      }

      // 2. Create order
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
          region_id: selectedRegion.id,
          region_name: isAr ? selectedRegion.name_ar : selectedRegion.name_en,
          delivery_fee: deliveryFee,
          payment_method: paymentMethod,
          payment_reference: paymentReference || null,
        })
        .select('id').single();
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

      // 4. Increment promo usage
      if (promo) {
        await supabase.rpc('increment_promo_usage', { promo_code: promo.code });
      }

      // 5. Telegram notification
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
            deliveryFee: deliveryFee.toFixed(2),
            region: isAr ? selectedRegion.name_ar : selectedRegion.name_en,
            paymentMethod,
            paymentReference: paymentReference || null,
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
      <main style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '56px' }}>🛒</p>
        <h2>{isAr ? 'السلة فارغة' : 'Your cart is empty'}</h2>
        <Link href={`/${lang}/products`} style={{
          display: 'inline-block', marginTop: '1rem',
          padding: '12px 28px', background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
          color: '#fff', borderRadius: '999px', textDecoration: 'none', fontWeight: '700',
        }}>
          {isAr ? 'تسوق الآن' : 'Shop Now'}
        </Link>
      </main>
    );
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    border: '1.5px solid #e5e7eb', borderRadius: '10px',
    fontSize: '15px', boxSizing: 'border-box' as const,
    fontFamily: 'inherit', outline: 'none',
    background: '#fff',
  };

  const paymentMethods = [
    {
      key: 'cod' as PaymentMethod,
      icon: '💵',
      label: isAr ? 'الدفع عند الاستلام' : 'Cash on Delivery',
      desc: isAr ? 'ادفع نقداً عند وصول طلبك' : 'Pay cash when your order arrives',
    },
    {
      key: 'instapay' as PaymentMethod,
      icon: '📲',
      label: 'InstaPay',
      desc: isAr ? 'ادفع عبر InstaPay' : 'Pay via InstaPay',
    },
    {
      key: 'wallet' as PaymentMethod,
      icon: '📱',
      label: isAr ? 'محفظة إلكترونية' : 'Mobile Wallet',
      desc: isAr ? 'فودافون كاش / اتصالات كاش / أورانج كاش' : 'Vodafone Cash / Etisalat Cash / Orange Cash',
    },
  ];

  return (
    <>
      <style>{`
        .checkout-grid { grid-template-columns: 1fr !important; }
        @media (min-width: 768px) {
          .checkout-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      <main style={{ padding: '1.5rem 1rem', maxWidth: '960px', margin: '0 auto' }}>
        <h1 style={{
          marginBottom: '1.5rem', fontSize: '28px', fontWeight: '800',
          background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          {isAr ? 'إتمام الطلب' : 'Checkout'}
        </h1>

        <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

          {/* LEFT — form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Delivery details */}
            <div style={{
              background: '#fff', borderRadius: '16px', padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(108,99,255,0.06)', border: '1px solid #f3f4f6',
            }}>
              <h2 style={{ margin: '0 0 1.25rem', fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📍 {isAr ? 'بيانات التوصيل' : 'Delivery Details'}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>
                    {isAr ? 'الاسم الكامل *' : 'Full Name *'}
                  </label>
                  <input name="name" value={form.name} onChange={handleChange}
                    placeholder={isAr ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                    style={inputStyle} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>
                    {isAr ? 'رقم الهاتف *' : 'Phone Number *'}
                  </label>
                  <input name="phone" value={form.phone} onChange={handleChange}
                    placeholder={isAr ? 'أدخل رقم هاتفك' : 'Enter your phone number'}
                    style={inputStyle} />
                </div>

                {/* Delivery Region */}
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>
                    🚚 {isAr ? 'منطقة التوصيل *' : 'Delivery Region *'}
                  </label>
                  <select
                    value={selectedRegion?.id ?? ''}
                    onChange={handleRegionChange}
                    style={inputStyle}
                  >
                    <option value="">{isAr ? 'اختر منطقتك' : 'Select your region'}</option>
                    {regions.map((r) => (
                      <option key={r.id} value={r.id}>
                        {isAr ? r.name_ar : r.name_en} — ${r.delivery_fee}
                      </option>
                    ))}
                  </select>
                  {selectedRegion && (
                    <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#6c63ff', fontWeight: '600' }}>
                      🚚 {isAr ? 'رسوم التوصيل:' : 'Delivery fee:'} ${selectedRegion.delivery_fee}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>
                    {isAr ? 'العنوان التفصيلي *' : 'Full Address *'}
                  </label>
                  <textarea name="address" value={form.address} onChange={handleChange}
                    placeholder={isAr ? 'الشارع، المبنى، الطابق...' : 'Street, building, floor...'}
                    rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>
                    {isAr ? 'ملاحظات (اختياري)' : 'Notes (optional)'}
                  </label>
                  <textarea name="notes" value={form.notes} onChange={handleChange}
                    placeholder={isAr ? 'أي تعليمات إضافية...' : 'Any extra instructions...'}
                    rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div style={{
              background: '#fff', borderRadius: '16px', padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(108,99,255,0.06)', border: '1px solid #f3f4f6',
            }}>
              <h2 style={{ margin: '0 0 1.25rem', fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                💳 {isAr ? 'طريقة الدفع' : 'Payment Method'}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {paymentMethods.map((method) => (
                  <div
                    key={method.key}
                    onClick={() => setPaymentMethod(method.key)}
                    style={{
                      padding: '14px 16px', borderRadius: '12px', cursor: 'pointer',
                      border: paymentMethod === method.key
                        ? '2px solid #6c63ff'
                        : '1.5px solid #e5e7eb',
                      background: paymentMethod === method.key ? '#f8f7ff' : '#fff',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '999px',
                        border: paymentMethod === method.key ? '6px solid #6c63ff' : '2px solid #d1d5db',
                        flexShrink: 0, transition: 'all 0.2s',
                      }} />
                      <span style={{ fontSize: '22px' }}>{method.icon}</span>
                      <div>
                        <p style={{ margin: 0, fontWeight: '700', fontSize: '15px', color: '#1a1a2e' }}>
                          {method.label}
                        </p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                          {method.desc}
                        </p>
                      </div>
                    </div>

                    {/* InstaPay details */}
                    {method.key === 'instapay' && paymentMethod === 'instapay' && (
                      <div style={{
                        marginTop: '14px', padding: '14px',
                        background: 'linear-gradient(135deg, #667eea20, #764ba220)',
                        borderRadius: '10px', border: '1px solid #c4b5fd',
                      }}>
                        <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>
                          {isAr ? 'حول المبلغ إلى:' : 'Transfer amount to:'}
                        </p>
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          background: '#fff', borderRadius: '8px', padding: '10px 14px',
                          border: '1px solid #e5e7eb', marginBottom: '12px',
                        }}>
                          <span style={{ fontWeight: '800', fontSize: '18px', color: '#6c63ff', letterSpacing: '1px' }}>
                            {instapayAccount}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(instapayAccount); }}
                            style={{
                              padding: '4px 12px', background: '#6c63ff', color: '#fff',
                              border: 'none', borderRadius: '6px', cursor: 'pointer',
                              fontSize: '12px', fontWeight: '600', fontFamily: 'inherit',
                            }}
                          >
                            {isAr ? 'نسخ' : 'Copy'}
                          </button>
                        </div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>
                          {isAr ? 'رقم العملية / المرجع *' : 'Transaction Reference Number *'}
                        </label>
                        <input
                          value={paymentReference}
                          onChange={(e) => setPaymentReference(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          placeholder={isAr ? 'أدخل رقم العملية' : 'Enter transaction number'}
                          style={{
                            ...inputStyle,
                            border: '1.5px solid #c4b5fd',
                          }}
                        />
                      </div>
                    )}

                    {/* Mobile wallet details */}
                    {method.key === 'wallet' && paymentMethod === 'wallet' && (
                      <div style={{
                        marginTop: '14px', padding: '14px',
                        background: 'linear-gradient(135deg, #e91e8c20, #ff6b9d20)',
                        borderRadius: '10px', border: '1px solid #fbcfe8',
                      }}>
                        <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>
                          {isAr ? 'حول المبلغ إلى:' : 'Transfer amount to:'}
                        </p>
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          background: '#fff', borderRadius: '8px', padding: '10px 14px',
                          border: '1px solid #e5e7eb', marginBottom: '12px',
                        }}>
                          <span style={{ fontWeight: '800', fontSize: '20px', color: '#e91e8c', letterSpacing: '2px' }}>
                            {walletNumber}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(walletNumber); }}
                            style={{
                              padding: '4px 12px', background: '#e91e8c', color: '#fff',
                              border: 'none', borderRadius: '6px', cursor: 'pointer',
                              fontSize: '12px', fontWeight: '600', fontFamily: 'inherit',
                            }}
                          >
                            {isAr ? 'نسخ' : 'Copy'}
                          </button>
                        </div>
                        <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#9ca3af' }}>
                          {isAr
                            ? 'فودافون كاش • اتصالات كاش • أورانج كاش • بنك مصر'
                            : 'Vodafone Cash • Etisalat Cash • Orange Cash • Banque Misr'}
                        </p>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>
                          {isAr ? 'رقم المحفظة المحوّل منها *' : 'Sender Wallet Number *'}
                        </label>
                        <input
                          value={paymentReference}
                          onChange={(e) => setPaymentReference(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          placeholder={isAr ? 'أدخل رقم المحفظة' : 'Enter your wallet number'}
                          style={{
                            ...inputStyle,
                            border: '1.5px solid #fbcfe8',
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Promo code */}
            <div style={{
              background: '#fff', borderRadius: '16px', padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(108,99,255,0.06)', border: '1px solid #f3f4f6',
            }}>
              <h2 style={{ margin: '0 0 1rem', fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🎟️ {isAr ? 'كود الخصم' : 'Promo Code'}
              </h2>
              <PromoCode lang={lang} orderTotal={total} onApply={setPromo} />
            </div>

            {error && (
              <div style={{
                padding: '12px 16px', background: '#fef2f2',
                border: '1px solid #fecaca', borderRadius: '10px',
                color: '#ef4444', fontSize: '14px', fontWeight: '500',
              }}>
                ❌ {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%', padding: '16px',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #6c63ff, #e91e8c)',
                color: '#fff', border: 'none', borderRadius: '999px',
                fontSize: '17px', fontWeight: '800',
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

          {/* RIGHT — order summary */}
          <div>
            <div style={{
              background: '#fff', borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(108,99,255,0.06)', border: '1px solid #f3f4f6',
              overflow: 'hidden', position: 'sticky', top: '80px',
            }}>
              <div style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #f3f4f6',
                background: 'linear-gradient(135deg, #6c63ff10, #e91e8c10)',
              }}>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>
                  {isAr ? '📋 ملخص الطلب' : '📋 Order Summary'}
                </h2>
              </div>

              {/* Items */}
              <div style={{ padding: '0' }}>
                {items.map((item, index) => (
                  <div key={item.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 16px',
                    borderBottom: index < items.length - 1 ? '1px solid #f9f9f9' : 'none',
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>
                        {isAr ? item.name_ar : item.name_en}
                      </p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                        ${item.price} × {item.quantity}
                      </p>
                    </div>
                    <p style={{ margin: 0, fontWeight: '700', color: '#1a1a2e' }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Bill breakdown */}
              <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #f3f4f6', background: '#fafafa' }}>
                {/* Subtotal */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>
                    {isAr ? 'المجموع الفرعي' : 'Subtotal'}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>${total.toFixed(2)}</span>
                </div>

                {/* Delivery fee */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    🚚 {isAr ? 'رسوم التوصيل' : 'Delivery Fee'}
                    {selectedRegion && (
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                        ({isAr ? selectedRegion.name_ar : selectedRegion.name_en})
                      </span>
                    )}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: selectedRegion ? '#374151' : '#9ca3af' }}>
                    {selectedRegion ? `$${deliveryFee.toFixed(2)}` : (isAr ? 'اختر المنطقة' : 'Select region')}
                  </span>
                </div>

                {/* Discount */}
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#16a34a', fontWeight: '600' }}>
                      🎟️ {promo?.code}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#16a34a' }}>
                      − ${discount.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Payment method badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>
                    {isAr ? 'طريقة الدفع' : 'Payment'}
                  </span>
                  <span style={{
                    fontSize: '12px', fontWeight: '700', padding: '3px 10px',
                    borderRadius: '999px',
                    background: paymentMethod === 'cod' ? '#f0fdf4' : paymentMethod === 'instapay' ? '#eff6ff' : '#fdf4ff',
                    color: paymentMethod === 'cod' ? '#16a34a' : paymentMethod === 'instapay' ? '#3b82f6' : '#9333ea',
                  }}>
                    {paymentMethod === 'cod'
                      ? (isAr ? 'الدفع عند الاستلام' : 'Cash on Delivery')
                      : paymentMethod === 'instapay'
                        ? 'InstaPay'
                        : (isAr ? 'محفظة إلكترونية' : 'Mobile Wallet')}
                  </span>
                </div>

                {/* Divider */}
                <div style={{ borderTop: '2px solid #1a1a2e', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#1a1a2e' }}>
                      {isAr ? 'المجموع الكلي' : 'Total'}
                    </span>
                    <span style={{
                      fontSize: '26px', fontWeight: '800',
                      background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
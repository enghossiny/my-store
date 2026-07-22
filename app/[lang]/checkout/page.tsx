'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/lib/cartContext';
import { useAuth } from '@/lib/authContext';
import { getCurrentUser, supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PromoCode from '@/components/PromoCode';
import SavedAddresses from '@/components/SavedAddresses';
import { formatPrice } from '@/lib/currency';

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

type SavedAddress = {
  id: string;
  label: string;
  name: string;
  phone: string;
  address: string;
  region_id: string | null;
  region_name_en: string | null;
  region_name_ar: string | null;
  delivery_fee: number;
  is_default: boolean;
};

type PaymentMethod = 'cod' | 'instapay' | 'wallet';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const lang = params.lang as string;
  const isAr = lang === 'ar';

  const [form, setForm] = useState({ name: '', phone: '', address: '', notes: '' });
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [paymentReference, setPaymentReference] = useState('');
  const [promo, setPromo] = useState<PromoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);

  const apiBaseUrl = typeof window !== 'undefined' ? window.location.origin : '';
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

  // When a saved address is selected, auto-fill the form
  const handleSelectSavedAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    setUseNewAddress(false);
    setForm({
      name: addr.name,
      phone: addr.phone,
      address: addr.address,
      notes: form.notes,
    });
    if (addr.region_id) {
      setSelectedRegion({
        id: addr.region_id,
        name_en: addr.region_name_en ?? '',
        name_ar: addr.region_name_ar ?? '',
        delivery_fee: addr.delivery_fee,
      });
    }
  };

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
      setError(isAr ? 'يرجى إدخال رقم مرجع الدفع' : 'Please enter payment reference');
      return;
    }
    if (items.length === 0) {
      setError(isAr ? 'السلة فارغة' : 'Your cart is empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Validate stock before creating the order
      const { data: productStocks, error: stockFetchError } = await supabase
        .from('products')
        .select('id, stock')
        .in('id', items.map((item) => item.id));

      if (stockFetchError) throw stockFetchError;

      const unavailableItem = items.find((item) => {
        const product = productStocks?.find((p) => p.id === item.id);
        return !product || item.quantity > (product.stock ?? 0);
      });

      if (unavailableItem) {
        setError(isAr ? 'الكمية المطلوبة غير متاحة حالياً' : 'Requested quantity is not available');
        setLoading(false);
        return;
      }

      // 2. Create or find customer
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
          auth_id: user?.id ?? null,
          status: 'pending',
          total: finalTotal,
          discount,
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

      
        // 3. Check stock availability first
          for (const item of items) {
            const { data: product, error: stockCheckError } = await supabase
              .from('products')
              .select('stock, name_en, name_ar')
              .eq('id', item.id)
              .single();

            if (stockCheckError || !product) {
              throw new Error(isAr ? 'خطأ في التحقق من المخزون' : 'Error checking stock');
            }

            if (product.stock < item.quantity) {
              throw new Error(
                isAr
                  ? `الكمية المطلوبة غير متوفرة لـ ${product.name_ar}`
                  : `Not enough stock for "${product.name_en}" (available: ${product.stock})`
              );
            }
          }

          // 4. Save order items
          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(items.map((item) => ({
              order_id: order.id,
              product_id: item.id,
              quantity: item.quantity,
              price: item.price,
            })));
          if (itemsError) throw itemsError;

      // 4. Decrease product stock for ordered items
      const stockAdjustments = items.map((item) => ({
        productId: item.id,
        quantityDelta: -item.quantity,
      }));

      const rollbackOrder = async (orderId: string) => {
        await supabase.from('order_items').delete().eq('order_id', orderId);
        await supabase.from('orders').delete().eq('id', orderId);
      };

      let stockResponse: Response;
      try {
        stockResponse = await fetch(`${apiBaseUrl}/api/stock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adjustments: stockAdjustments }),
        });
      } catch {
        await rollbackOrder(order.id);
        setError(isAr
          ? 'تعذر الاتصال بالخادم عند تحديث المخزون. يرجى المحاولة مرة أخرى.'
          : 'The stock update request could not reach the server. Please try again.');
        return;
      }

      if (!stockResponse.ok) {
        const stockError = await stockResponse.json().catch(() => null);
        await rollbackOrder(order.id);
        setError(stockError?.error || (isAr ? 'فشل تحديث المخزون' : 'Failed to update product stock'));
        return;
      }

      // 5. Increment promo usage
      if (promo) {
        await supabase.rpc('increment_promo_usage', { promo_code: promo.code });
      }

      // 6. Telegram
      try {
        await fetch(`${apiBaseUrl}/api/notify`, {
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
      const errMsg = err instanceof Error ? err.message : '';
      setError(errMsg || (isAr ? 'حدث خطأ، يرجى المحاولة مجدداً' : 'Something went wrong, please try again'));
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
    fontFamily: 'inherit', outline: 'none', background: '#fff',
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
      desc: isAr ? 'فودافون كاش / اتصالات كاش / أورانج كاش' : 'Vodafone Cash / Etisalat / Orange Cash',
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

          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* SAVED ADDRESSES — only if logged in */}
            {user && (
              <div style={{
                background: '#fff', borderRadius: '16px', padding: '1.5rem',
                boxShadow: '0 4px 20px rgba(108,99,255,0.06)', border: '1px solid #f3f4f6',
              }}>
                <h2 style={{ margin: '0 0 1.25rem', fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📋 {isAr ? 'عناويني المحفوظة' : 'My Saved Addresses'}
                </h2>
                <SavedAddresses
                  lang={lang}
                  onSelect={handleSelectSavedAddress}
                  selectedId={selectedAddressId}
                />

                {/* Option to use different address */}
                {selectedAddressId && (
                  <button
                    onClick={() => {
                      setUseNewAddress(!useNewAddress);
                      if (!useNewAddress) {
                        setSelectedAddressId(null);
                        setForm({ name: '', phone: '', address: '', notes: form.notes });
                        setSelectedRegion(null);
                      }
                    }}
                    style={{
                      marginTop: '12px', width: '100%', padding: '10px',
                      border: '1.5px dashed #e5e7eb', borderRadius: '10px',
                      background: 'transparent', color: '#6b7280',
                      cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit',
                    }}
                  >
                    {useNewAddress
                      ? (isAr ? '← استخدم عنوان محفوظ' : '← Use saved address')
                      : (isAr ? '+ استخدم عنوان مختلف' : '+ Use a different address')}
                  </button>
                )}
              </div>
            )}

            {/* DELIVERY DETAILS */}
            {/* Show if: not logged in OR chose new address OR has no saved addresses */}
            {(!user || useNewAddress || !selectedAddressId) && (
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

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>
                      🚚 {isAr ? 'منطقة التوصيل *' : 'Delivery Region *'}
                    </label>
                    <select value={selectedRegion?.id ?? ''} onChange={handleRegionChange} style={inputStyle}>
                      <option value="">{isAr ? 'اختر منطقتك' : 'Select your region'}</option>
                      {regions.map((r) => (
                        <option key={r.id} value={r.id}>
                          {isAr ? r.name_ar : r.name_en} — {formatPrice(r.delivery_fee)}
                        </option>
                      ))}
                    </select>
                    {selectedRegion && (
                      <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#6c63ff', fontWeight: '600' }}>
                        🚚 {isAr ? 'رسوم التوصيل:' : 'Delivery fee:'} {formatPrice(selectedRegion.delivery_fee)}
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

                  {/* Save address option for logged in users */}
                  {user && (
                    <SaveNewAddressInline
                      lang={lang}
                      form={form}
                      regionId={selectedRegion?.id ?? null}
                      regionNameEn={selectedRegion?.name_en ?? null}
                      regionNameAr={selectedRegion?.name_ar ?? null}
                      deliveryFee={selectedRegion?.delivery_fee ?? 0}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Selected address summary */}
            {user && selectedAddressId && !useNewAddress && (
              <div style={{
                background: '#f8f7ff', borderRadius: '16px', padding: '1.25rem',
                border: '1.5px solid #c4b5fd',
              }}>
                <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6c63ff', fontWeight: '700' }}>
                  ✓ {isAr ? 'سيتم التوصيل إلى:' : 'Delivering to:'}
                </p>
                <p style={{ margin: '0 0 2px', fontWeight: '700', fontSize: '15px' }}>{form.name} — {form.phone}</p>
                <p style={{ margin: '0 0 2px', fontSize: '14px', color: '#374151' }}>{form.address}</p>
                {selectedRegion && (
                  <p style={{ margin: 0, fontSize: '13px', color: '#6c63ff', fontWeight: '600' }}>
                    🚚 {isAr ? selectedRegion.name_ar : selectedRegion.name_en} — {formatPrice(selectedRegion.delivery_fee)}
                  </p>
                )}
              </div>
            )}

            {/* Notes */}
            <div style={{
              background: '#fff', borderRadius: '16px', padding: '1.25rem',
              boxShadow: '0 4px 20px rgba(108,99,255,0.06)', border: '1px solid #f3f4f6',
            }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>
                📝 {isAr ? 'ملاحظات (اختياري)' : 'Notes (optional)'}
              </label>
              <textarea name="notes" value={form.notes} onChange={handleChange}
                placeholder={isAr ? 'أي تعليمات إضافية...' : 'Any extra instructions...'}
                rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>

            {/* Payment */}
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
                      border: paymentMethod === method.key ? '2px solid #6c63ff' : '1.5px solid #e5e7eb',
                      background: paymentMethod === method.key ? '#f8f7ff' : '#fff',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '999px', flexShrink: 0,
                        border: paymentMethod === method.key ? '6px solid #6c63ff' : '2px solid #d1d5db',
                        transition: 'all 0.2s',
                      }} />
                      <span style={{ fontSize: '22px' }}>{method.icon}</span>
                      <div>
                        <p style={{ margin: 0, fontWeight: '700', fontSize: '15px', color: '#1a1a2e' }}>{method.label}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>{method.desc}</p>
                      </div>
                    </div>

                    {method.key === 'instapay' && paymentMethod === 'instapay' && (
                      <div style={{ marginTop: '14px', padding: '14px', background: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                        <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>
                          {isAr ? 'حول المبلغ إلى:' : 'Transfer to:'}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderRadius: '8px', padding: '10px 14px', border: '1px solid #bfdbfe', marginBottom: '12px' }}>
                          <span style={{ fontWeight: '800', fontSize: '18px', color: '#3b82f6', letterSpacing: '1px' }}>{instapayAccount}</span>
                          <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(instapayAccount); }} style={{ padding: '4px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', fontFamily: 'inherit' }}>
                            {isAr ? 'نسخ' : 'Copy'}
                          </button>
                        </div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>
                          {isAr ? 'رقم العملية *' : 'Transaction Reference *'}
                        </label>
                        <input value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} onClick={(e) => e.stopPropagation()} placeholder={isAr ? 'أدخل رقم العملية' : 'Enter transaction number'} style={{ ...inputStyle, border: '1.5px solid #bfdbfe' }} />
                      </div>
                    )}

                    {method.key === 'wallet' && paymentMethod === 'wallet' && (
                      <div style={{ marginTop: '14px', padding: '14px', background: '#fdf4ff', borderRadius: '10px', border: '1px solid #e9d5ff' }}>
                        <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>
                          {isAr ? 'حول المبلغ إلى:' : 'Transfer to:'}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderRadius: '8px', padding: '10px 14px', border: '1px solid #e9d5ff', marginBottom: '12px' }}>
                          <span style={{ fontWeight: '800', fontSize: '20px', color: '#9333ea', letterSpacing: '2px' }}>{walletNumber}</span>
                          <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(walletNumber); }} style={{ padding: '4px 12px', background: '#9333ea', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', fontFamily: 'inherit' }}>
                            {isAr ? 'نسخ' : 'Copy'}
                          </button>
                        </div>
                        <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#9ca3af' }}>
                          {isAr ? 'فودافون كاش • اتصالات كاش • أورانج كاش' : 'Vodafone Cash • Etisalat Cash • Orange Cash'}
                        </p>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>
                          {isAr ? 'رقم المحفظة المحوّل منها *' : 'Sender Wallet Number *'}
                        </label>
                        <input value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} onClick={(e) => e.stopPropagation()} placeholder={isAr ? 'أدخل رقم المحفظة' : 'Enter your wallet number'} style={{ ...inputStyle, border: '1.5px solid #e9d5ff' }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Promo */}
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
              <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#ef4444', fontSize: '14px', fontWeight: '500' }}>
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
                padding: '1.25rem 1.5rem', borderBottom: '1px solid #f3f4f6',
                background: 'linear-gradient(135deg, #6c63ff10, #e91e8c10)',
              }}>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>
                  {isAr ? '📋 ملخص الطلب' : '📋 Order Summary'}
                </h2>
              </div>

              {items.map((item, index) => (
                <div key={item.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 16px',
                  borderBottom: index < items.length - 1 ? '1px solid #f9f9f9' : 'none',
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: '600' }}>
                      {isAr ? item.name_ar : item.name_en}
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <p style={{ margin: 0, fontWeight: '700' }}>
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}

              <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #f3f4f6', background: '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>{formatPrice(total)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>
                    🚚 {isAr ? 'رسوم التوصيل' : 'Delivery'}
                    {selectedRegion && <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '4px' }}>({isAr ? selectedRegion.name_ar : selectedRegion.name_en})</span>}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: selectedRegion ? '#374151' : '#9ca3af' }}>
                    {selectedRegion ? `${formatPrice(deliveryFee)}` : (isAr ? 'اختر المنطقة' : 'Select region')}
                  </span>
                </div>

                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#16a34a', fontWeight: '600' }}>🎟️ {promo?.code}</span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#16a34a' }}>− {formatPrice(discount)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>{isAr ? 'الدفع' : 'Payment'}</span>
                  <span style={{
                    fontSize: '12px', fontWeight: '700', padding: '3px 10px', borderRadius: '999px',
                    background: paymentMethod === 'cod' ? '#f0fdf4' : paymentMethod === 'instapay' ? '#eff6ff' : '#fdf4ff',
                    color: paymentMethod === 'cod' ? '#16a34a' : paymentMethod === 'instapay' ? '#3b82f6' : '#9333ea',
                  }}>
                    {paymentMethod === 'cod' ? (isAr ? 'عند الاستلام' : 'Cash on Delivery') : paymentMethod === 'instapay' ? 'InstaPay' : (isAr ? 'محفظة' : 'Wallet')}
                  </span>
                </div>

                <div style={{ borderTop: '2px solid #1a1a2e', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '16px', fontWeight: '800' }}>{isAr ? 'المجموع الكلي' : 'Total'}</span>
                    <span style={{
                      fontSize: '26px', fontWeight: '800',
                      background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                      {formatPrice(finalTotal)}
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

// Small inline component to optionally save the new address
function SaveNewAddressInline({
  lang, form, regionId, regionNameEn, regionNameAr, deliveryFee,
}: {
  lang: string;
  form: { name: string; phone: string; address: string };
  regionId: string | null;
  regionNameEn: string | null;
  regionNameAr: string | null;
  deliveryFee: number;
}) {
  const isAr = lang === 'ar';
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [label, setLabel] = useState('Home');

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.address || !regionId) return;
    setSaving(true);
    const user = await getCurrentUser();
    if (!user) { setSaving(false); return; }

    await supabase.from('customer_addresses').insert({
      auth_id: user.id,
      label,
      name: form.name,
      phone: form.phone,
      address: form.address,
      region_id: regionId,
      region_name_en: regionNameEn,
      region_name_ar: regionNameAr,
      delivery_fee: deliveryFee,
      is_default: false,
    });

    setSaved(true);
    setSaving(false);
  };

  if (saved) {
    return (
      <p style={{ margin: 0, color: '#16a34a', fontSize: '13px', fontWeight: '600' }}>
        ✅ {isAr ? 'تم حفظ العنوان!' : 'Address saved!'}
      </p>
    );
  }

  return (
    <div style={{
      padding: '12px', background: '#f8f7ff',
      borderRadius: '10px', border: '1px solid #c4b5fd',
    }}>
      <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: '600', color: '#6c63ff' }}>
        💾 {isAr ? 'حفظ هذا العنوان؟' : 'Save this address?'}
      </p>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
        {['Home', 'Work', 'Family', 'Other'].map((l) => (
          <button key={l} onClick={() => setLabel(l)} style={{
            padding: '4px 12px', borderRadius: '999px',
            border: label === l ? '2px solid #6c63ff' : '1.5px solid #e5e7eb',
            background: label === l ? '#6c63ff' : '#fff',
            color: label === l ? '#fff' : '#374151',
            cursor: 'pointer', fontSize: '12px', fontWeight: '600', fontFamily: 'inherit',
          }}>
            {l}
          </button>
        ))}
      </div>
      <button onClick={handleSave} disabled={saving || !form.name || !form.phone || !form.address || !regionId} style={{
        padding: '8px 20px',
        background: saving ? '#9ca3af' : 'linear-gradient(135deg, #6c63ff, #e91e8c)',
        color: '#fff', border: 'none', borderRadius: '999px',
        cursor: saving ? 'not-allowed' : 'pointer',
        fontSize: '13px', fontWeight: '700', fontFamily: 'inherit',
      }}>
        {saving ? '...' : (isAr ? 'حفظ' : 'Save')}
      </button>
    </div>
  );
}
'use client';

import { useCart } from '@/lib/cartContext';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { formatPrice } from '@/lib/currency';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();
  const params = useParams();
  const lang = params.lang as string;
  const isAr = lang === 'ar';

  if (items.length === 0) {
    return (
      <main style={{ padding: '3rem 1rem', textAlign: 'center' }}>
        <p style={{ fontSize: '56px', margin: '0 0 1rem' }}>🛒</p>
        <h2 style={{ fontSize: '22px', marginBottom: '0.5rem', color: '#1a1a2e' }}>
          {isAr ? 'السلة فارغة' : 'Your cart is empty'}
        </h2>
        <p style={{ color: '#9ca3af', marginBottom: '1.5rem', fontSize: '14px' }}>
          {isAr ? 'أضف منتجات للبدء' : 'Add products to get started'}
        </p>
        <Link href={`/${lang}/products`} style={{
          display: 'inline-block', padding: '14px 32px',
          background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
          color: '#fff', borderRadius: '999px',
          textDecoration: 'none', fontWeight: '700', fontSize: '15px',
        }}>
          {isAr ? 'تسوق الآن' : 'Shop Now'}
        </Link>
      </main>
    );
  }

  return (
    <>
      <style>{`
        .cart-wrap { padding: 1rem; max-width: 700px; margin: 0 auto; }
        .cart-row { display: flex; flex-direction: column; gap: 10px; padding: 1rem; }
        .cart-row-top { display: flex; align-items: flex-start; gap: 10px; }
        .cart-row-bottom { display: flex; align-items: center; justify-content: space-between; padding-top: 10px; border-top: 1px solid #f3f4f6; }
        .cart-footer-btns { display: flex; flex-direction: column; gap: 10px; }
        @media (min-width: 600px) {
          .cart-wrap { padding: 2rem; }
          .cart-row { flex-direction: row; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; }
          .cart-row-top { flex: 1; }
          .cart-row-bottom { border-top: none; padding-top: 0; }
          .cart-footer-btns { flex-direction: row; }
        }
      `}</style>

      <main className="cart-wrap">
        <h1 style={{
          marginBottom: '1.25rem', fontSize: '26px', fontWeight: '800',
          background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          {isAr ? 'سلة التسوق' : 'Shopping Cart'}
          <span style={{ fontSize: '16px', fontWeight: '600', color: '#9ca3af', marginLeft: '8px' }}>
            ({items.reduce((s, i) => s + i.quantity, 0)} {isAr ? 'منتج' : 'items'})
          </span>
        </h1>

        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.25rem' }}>
          {items.map((item) => (
            <div key={item.id} className="cart-row" style={{
              background: '#fff', borderRadius: '16px',
              boxShadow: '0 2px 12px rgba(108,99,255,0.06)',
              border: '1px solid #f3f4f6',
            }}>
              {/* Top: image + name + price */}
              <div className="cart-row-top">
                {/* Product icon/image */}
                <div style={{
                  width: '56px', height: '56px', flexShrink: 0,
                  background: 'linear-gradient(135deg, #f8f7ff, #ede9ff)',
                  borderRadius: '12px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '26px', overflow: 'hidden',
                }}>
                  🛍️
                </div>

                {/* Name + unit price */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    margin: '0 0 4px', fontWeight: '700', fontSize: '15px',
                    color: '#1a1a2e',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {isAr ? item.name_ar : item.name_en}
                  </p>
                <p style={{ margin: 0, color: '#6c63ff', fontWeight: '600', fontSize: '14px' }}>
                  {formatPrice(item.price)} {isAr ? 'للقطعة' : 'each'}
                </p>
                </div>
              </div>

              {/* Bottom: quantity + total + remove */}
              <div className="cart-row-bottom">
                {/* Quantity controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    style={{
                      width: '36px', height: '36px',
                      border: '1.5px solid #e5e7eb', borderRadius: '10px',
                      background: '#fff', cursor: 'pointer', fontSize: '20px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#6c63ff', fontWeight: '700',
                    }}
                  >−</button>
                  <span style={{
                    minWidth: '32px', textAlign: 'center',
                    fontWeight: '800', fontSize: '17px', color: '#1a1a2e',
                  }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    style={{
                      width: '36px', height: '36px',
                      border: '1.5px solid #e5e7eb', borderRadius: '10px',
                      background: '#fff', cursor: 'pointer', fontSize: '20px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#6c63ff', fontWeight: '700',
                    }}
                  >+</button>
                </div>

                {/* Line total */}
                <p style={{
                  margin: 0, fontWeight: '800', fontSize: '16px',
                  color: '#1a1a2e',
                }}>
                  {formatPrice(item.price * item.quantity)}
                </p>

                {/* Remove button */}
                <button
                  onClick={() => removeItem(item.id)}
                  style={{
                    background: '#fef2f2', border: '1px solid #fecaca',
                    borderRadius: '10px', cursor: 'pointer',
                    color: '#ef4444', width: '36px', height: '36px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', flexShrink: 0,
                  }}
                >✕</button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary + checkout */}
        <div style={{
          background: '#fff', borderRadius: '16px', padding: '1.25rem',
          boxShadow: '0 2px 12px rgba(108,99,255,0.06)',
          border: '1px solid #f3f4f6',
        }}>
          {/* Order breakdown */}
          <div style={{ marginBottom: '1rem' }}>
            {items.map((item) => (
              <div key={item.id} style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: '13px', color: '#6b7280', marginBottom: '4px',
              }}>
                <span>
                  {isAr ? item.name_ar : item.name_en} × {item.quantity}
                </span>
                <span style={{ fontWeight: '600' }}>
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '2px solid #f3f4f6', paddingTop: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '15px', fontWeight: '500' }}>
                {isAr ? 'المجموع (بدون توصيل)' : 'Subtotal (excl. delivery)'}
              </p>
              <p style={{
                margin: 0, fontSize: '26px', fontWeight: '800',
                background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                {formatPrice(total)}
              </p>
            </div>
            <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#9ca3af' }}>
              {isAr ? '* رسوم التوصيل تُحسب عند الدفع' : '* Delivery fee calculated at checkout'}
            </p>
          </div>

          {/* Buttons */}
          <div className="cart-footer-btns">
            <Link href={`/${lang}/products`} style={{
              flex: 1, padding: '13px 16px',
              border: '1.5px solid #e5e7eb', borderRadius: '999px',
              textDecoration: 'none', color: '#374151',
              fontWeight: '600', fontSize: '14px', textAlign: 'center',
              display: 'block',
            }}>
              {isAr ? '← متابعة التسوق' : '← Keep Shopping'}
            </Link>
            <Link href={`/${lang}/checkout`} style={{
              flex: 1, padding: '13px 16px',
              background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
              color: '#fff', borderRadius: '999px',
              textDecoration: 'none', fontWeight: '800',
              fontSize: '14px', textAlign: 'center',
              boxShadow: '0 4px 15px rgba(108,99,255,0.4)',
              display: 'block',
            }}>
              {isAr ? 'إتمام الطلب ←' : 'Checkout →'}
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
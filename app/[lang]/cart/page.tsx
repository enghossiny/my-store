'use client';

import { useCart } from '@/lib/cartContext';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();
  const params = useParams();
  const lang = params.lang as string;
  const isAr = lang === 'ar';

  if (items.length === 0) {
    return (
      <main style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '56px' }}>🛒</p>
        <h2 style={{ fontSize: '22px', marginBottom: '0.5rem' }}>
          {isAr ? 'السلة فارغة' : 'Your cart is empty'}
        </h2>
        <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>
          {isAr ? 'أضف منتجات للبدء' : 'Add products to get started'}
        </p>
        <Link href={`/${lang}/products`} style={{
          display: 'inline-block', padding: '12px 28px',
          background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
          color: '#fff', borderRadius: '999px', textDecoration: 'none',
          fontWeight: '700',
        }}>
          {isAr ? 'تسوق الآن' : 'Shop Now'}
        </Link>
      </main>
    );
  }

  return (
    <>
      <style>{`
        .cart-pad { padding: 1.5rem 1rem !important; }
        .cart-item { flex-direction: column !important; gap: 12px !important; align-items: flex-start !important; }
        .cart-item-right { width: 100% !important; justify-content: space-between !important; }
        .cart-footer { flex-direction: column !important; gap: 1rem !important; }
        .cart-footer a { text-align: center !important; }
        @media (min-width: 640px) {
          .cart-item { flex-direction: row !important; align-items: center !important; }
          .cart-footer { flex-direction: row !important; }
        }
      `}</style>

      <main className="cart-pad" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{
          marginBottom: '1.5rem', fontSize: '28px', fontWeight: '800',
          background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          {isAr ? 'سلة التسوق' : 'Shopping Cart'}
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {items.map((item) => (
            <div key={item.id} className="cart-item" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1rem 1.25rem',
              background: '#fff', borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(108,99,255,0.06)',
              border: '1px solid #f3f4f6',
            }}>
              <div>
                <p style={{ margin: '0 0 4px', fontWeight: '600', fontSize: '15px' }}>
                  {isAr ? item.name_ar : item.name_en}
                </p>
                <p style={{ margin: 0, color: '#6c63ff', fontWeight: '700', fontSize: '16px' }}>
                  ${item.price}
                </p>
              </div>

              <div className="cart-item-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{
                    width: '32px', height: '32px', border: '1.5px solid #e5e7eb',
                    borderRadius: '8px', background: '#fff', cursor: 'pointer',
                    fontSize: '18px', fontWeight: '700', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>−</button>
                  <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: '700', fontSize: '16px' }}>
                    {item.quantity}
                  </span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{
                    width: '32px', height: '32px', border: '1.5px solid #e5e7eb',
                    borderRadius: '8px', background: '#fff', cursor: 'pointer',
                    fontSize: '18px', fontWeight: '700', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>+</button>
                </div>
                <p style={{ margin: 0, fontWeight: '800', fontSize: '16px', minWidth: '64px', textAlign: 'right' }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
                <button onClick={() => removeItem(item.id)} style={{
                  background: '#fef2f2', border: '1px solid #fecaca',
                  borderRadius: '8px', cursor: 'pointer',
                  color: '#ef4444', fontSize: '16px',
                  width: '32px', height: '32px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>✕</button>
              </div>
            </div>
          ))}
        </div>

        {/* Total and checkout */}
        <div style={{
          background: '#fff', borderRadius: '16px', padding: '1.25rem',
          boxShadow: '0 4px 20px rgba(108,99,255,0.06)', border: '1px solid #f3f4f6',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '15px' }}>
              {isAr ? 'المجموع' : 'Total'}
            </p>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#1a1a2e' }}>
              ${total.toFixed(2)}
            </p>
          </div>
          <div className="cart-footer" style={{ display: 'flex', gap: '1rem' }}>
            <Link href={`/${lang}/products`} style={{
              flex: 1, padding: '12px', border: '1.5px solid #e5e7eb',
              borderRadius: '999px', textDecoration: 'none',
              color: '#374151', fontWeight: '600', fontSize: '15px', textAlign: 'center',
            }}>
              {isAr ? '← متابعة التسوق' : '← Keep Shopping'}
            </Link>
            <Link href={`/${lang}/checkout`} style={{
              flex: 1, padding: '12px',
              background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
              color: '#fff', borderRadius: '999px', textDecoration: 'none',
              fontWeight: '800', fontSize: '15px', textAlign: 'center',
              boxShadow: '0 4px 15px rgba(108,99,255,0.4)',
            }}>
              {isAr ? 'إتمام الطلب ←' : 'Checkout →'}
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
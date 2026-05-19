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
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>
        {isAr ? 'سلة التسوق' : 'Shopping Cart'}
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        {items.map((item) => (
          <div key={item.id} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
          }}>
            <div>
              <p style={{ margin: '0 0 4px', fontWeight: '500' }}>
                {isAr ? item.name_ar : item.name_en}
              </p>
              <p style={{ margin: 0, color: '#16a34a', fontWeight: 'bold' }}>
                ${item.price}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Quantity controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  style={{
                    width: '28px', height: '28px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px', background: '#fff',
                    cursor: 'pointer', fontSize: '16px',
                  }}
                >−</button>
                <span style={{ minWidth: '20px', textAlign: 'center' }}>
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  style={{
                    width: '28px', height: '28px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px', background: '#fff',
                    cursor: 'pointer', fontSize: '16px',
                  }}
                >+</button>
              </div>

              <p style={{ margin: 0, fontWeight: 'bold', minWidth: '60px', textAlign: 'right' }}>
                ${(item.price * item.quantity).toFixed(2)}
              </p>

              <button
                onClick={() => removeItem(item.id)}
                style={{
                  background: 'none', border: 'none',
                  cursor: 'pointer', color: '#ef4444', fontSize: '18px',
                }}
              >✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* Total and checkout */}
      <div style={{
        borderTop: '2px solid #111',
        paddingTop: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <p style={{ margin: '0 0 4px', color: '#6b7280' }}>
            {isAr ? 'المجموع' : 'Total'}
          </p>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
            ${total.toFixed(2)}
          </p>
        </div>

        <Link href={`/${lang}/checkout`} style={{
          padding: '14px 32px',
          background: '#111',
          color: '#fff',
          borderRadius: '10px',
          textDecoration: 'none',
          fontSize: '16px',
          fontWeight: 'bold',
        }}>
          {isAr ? 'إتمام الطلب' : 'Checkout'}
        </Link>
      </div>
    </main>
  );
}
'use client';

import { useCart } from '@/lib/cartContext';

type Props = {
  product: {
    id: string;
    name_ar: string;
    name_en: string;
    price: number;
  };
  lang: string;
  disabled?: boolean;
  stock?: number;
};

export default function AddToCartButton({ product, lang, disabled, stock }: Props) {
  const { addItem, items } = useCart();
  const isAr = lang === 'ar';

  const currentQty = items.find(i => i.id === product.id)?.quantity ?? 0;
  const maxReached = stock !== undefined && currentQty >= stock;

  if (disabled) {
    return (
      <button disabled style={{
        width: '100%', padding: '16px',
        background: '#e5e7eb', color: '#9ca3af',
        border: 'none', borderRadius: '999px',
        fontSize: '16px', cursor: 'not-allowed',
        fontFamily: 'inherit', fontWeight: '700',
      }}>
        {isAr ? 'نفذ المخزون' : 'Out of Stock'}
      </button>
    );
  }

  if (maxReached) {
    return (
      <button disabled style={{
        width: '100%', padding: '16px',
        background: '#fef9c3', color: '#854d0e',
        border: '1px solid #fde68a', borderRadius: '999px',
        fontSize: '15px', cursor: 'not-allowed',
        fontFamily: 'inherit', fontWeight: '700',
      }}>
        {isAr ? `وصلت للحد الأقصى (${stock})` : `Max quantity reached (${stock})`}
      </button>
    );
  }

  return (
    <button
      onClick={() => addItem({ ...product, quantity: 1 })}
      style={{
        width: '100%', padding: '16px',
        background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
        color: '#fff', border: 'none', borderRadius: '999px',
        fontSize: '16px', fontWeight: '800',
        cursor: 'pointer', fontFamily: 'inherit',
        boxShadow: '0 6px 20px rgba(108,99,255,0.4)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
      }}
    >
      🛒 {isAr ? 'أضف إلى السلة' : 'Add to Cart'}
      {currentQty > 0 && (
        <span style={{
          marginLeft: '8px', background: 'rgba(255,255,255,0.25)',
          padding: '2px 8px', borderRadius: '999px', fontSize: '13px',
        }}>
          {currentQty} {isAr ? 'في السلة' : 'in cart'}
        </span>
      )}
    </button>
  );
}
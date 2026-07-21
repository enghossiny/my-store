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
};

export default function AddToCartButton({ product, lang, disabled }: Props) {
  const { addItem } = useCart();
  const isAr = lang === 'ar';

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
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 10px 25px rgba(108,99,255,0.5)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(108,99,255,0.4)';
      }}
    >
      🛒 {isAr ? 'أضف إلى السلة' : 'Add to Cart'}
    </button>
  );
}
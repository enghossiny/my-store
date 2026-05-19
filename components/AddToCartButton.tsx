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
        width: '100%',
        padding: '14px',
        background: '#e5e7eb',
        color: '#9ca3af',
        border: 'none',
        borderRadius: '10px',
        fontSize: '16px',
        cursor: 'not-allowed',
      }}>
        {isAr ? 'نفذ المخزون' : 'Out of Stock'}
      </button>
    );
  }

  return (
    <button
      onClick={() => addItem({ ...product, quantity: 1 })}
      style={{
        width: '100%',
        padding: '14px',
        background: '#111',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        fontSize: '16px',
        cursor: 'pointer',
      }}
    >
      {isAr ? 'أضف إلى السلة' : 'Add to Cart'}
    </button>
  );
}
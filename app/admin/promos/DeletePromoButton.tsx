'use client';

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function DeletePromoButton({ promoId }: { promoId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Delete this promo code?')) return;
    const { error } = await supabase.from('promo_codes').delete().eq('id', promoId);
    if (error) {
      alert(error.message || 'Failed to delete promo code');
      return;
    }
    router.refresh();
  };

  return (
    <button
      onClick={handleDelete}
      style={{
        padding: '5px 12px',
        background: '#fef2f2',
        color: '#ef4444',
        border: '1px solid #fecaca',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        fontFamily: 'inherit',
      }}
    >
      Delete
    </button>
  );
}
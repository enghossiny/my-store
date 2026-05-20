'use client';

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
      alert(error.message || 'Failed to delete product');
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
      }}
    >
      Delete
    </button>
  );
}
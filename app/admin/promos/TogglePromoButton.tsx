'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function TogglePromoButton({
  promoId, active,
}: {
  promoId: string;
  active: boolean;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(active);
  const [saving, setSaving] = useState(false);

  const handleToggle = async () => {
    setSaving(true);
    await supabase
      .from('promo_codes')
      .update({ active: !current })
      .eq('id', promoId);
    setCurrent(!current);
    setSaving(false);
    router.refresh();
  };

  return (
    <button
      onClick={handleToggle}
      disabled={saving}
      style={{
        padding: '4px 14px',
        borderRadius: '999px',
        border: 'none',
        cursor: saving ? 'not-allowed' : 'pointer',
        fontSize: '12px',
        fontWeight: '600',
        fontFamily: 'inherit',
        background: current ? '#f0fdf4' : '#fef2f2',
        color: current ? '#16a34a' : '#ef4444',
      }}
    >
      {current ? '✓ Active' : '✗ Inactive'}
    </button>
  );
}
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ToggleRegionButton({ regionId, active }: { regionId: string; active: boolean }) {
  const router = useRouter();
  const [current, setCurrent] = useState(active);

  const handleToggle = async () => {
    await supabase.from('delivery_regions').update({ active: !current }).eq('id', regionId);
    setCurrent(!current);
    router.refresh();
  };

  return (
    <button onClick={handleToggle} style={{
      padding: '4px 14px', borderRadius: '999px', border: 'none',
      cursor: 'pointer', fontSize: '12px', fontWeight: '600', fontFamily: 'inherit',
      background: current ? '#f0fdf4' : '#fef2f2',
      color: current ? '#16a34a' : '#ef4444',
    }}>
      {current ? '✓ Active' : '✗ Inactive'}
    </button>
  );
}
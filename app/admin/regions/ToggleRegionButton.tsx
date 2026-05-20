'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ToggleRegionButton({ regionId, active }: { regionId: string; active: boolean }) {
  const router = useRouter();
  const [current, setCurrent] = useState(active);
  const [saving, setSaving] = useState(false);

  const handleToggle = async () => {
    setSaving(true);
    const { error } = await supabase.from('delivery_regions').update({ active: !current }).eq('id', regionId);
    if (error) {
      alert(error.message || 'Failed to update region status');
      setSaving(false);
      return;
    }
    setCurrent(!current);
    setSaving(false);
    router.refresh();
  };

  return (
    <button disabled={saving} onClick={handleToggle} style={{
      padding: '4px 14px', borderRadius: '999px', border: 'none',
      cursor: saving ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: '600', fontFamily: 'inherit',
      background: current ? '#f0fdf4' : '#fef2f2',
      color: current ? '#16a34a' : '#ef4444',
      opacity: saving ? 0.7 : 1,
    }}>
      {current ? '✓ Active' : '✗ Inactive'}
    </button>
  );
}
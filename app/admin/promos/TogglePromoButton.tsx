'use client';

import { useState } from 'react';
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

    const response = await fetch(`/api/admin/promos/${promoId}`, {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !current }),
    });
    const result = await response.json();

    if (!response.ok || result.error) {
      alert(result.error || 'Failed to update promo status');
      setSaving(false);
      return;
    }

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
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const statusColor: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#16a34a',
  cancelled: '#ef4444',
};

export default function OrderStatusUpdater({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setSaving(true);
    await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
    setStatus(newStatus);
    setSaving(false);
  };

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={saving}
      style={{
        padding: '5px 10px',
        borderRadius: '8px',
        border: `1px solid ${statusColor[status]}`,
        color: statusColor[status],
        background: statusColor[status] + '15',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
      }}
    >
      {statuses.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}
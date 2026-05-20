'use client';

import { useRouter } from 'next/navigation';

export default function DeleteRegionButton({ regionId }: { regionId: string }) {
  const router = useRouter();
  const handleDelete = async () => {
    if (!confirm('Delete this region?')) return;

    const response = await fetch(`/api/admin/regions/${regionId}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    });
    const result = await response.json();

    if (!response.ok || result.error) {
      alert(result.error || 'Failed to delete region');
      return;
    }

    router.refresh();
  };
  return (
    <button onClick={handleDelete} style={{
      padding: '5px 12px', background: '#fef2f2', color: '#ef4444',
      border: '1px solid #fecaca', borderRadius: '6px',
      cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit',
    }}>
      Delete
    </button>
  );
}
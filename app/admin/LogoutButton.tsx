'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <button onClick={handleLogout} style={{
      width: '100%', padding: '8px 14px',
      background: 'rgba(239,68,68,0.15)',
      color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)',
      borderRadius: '8px', cursor: 'pointer',
      fontSize: '13px', fontWeight: '600', fontFamily: 'inherit',
      textAlign: 'left',
    }}>
      🚪 Sign Out
    </button>
  );
}
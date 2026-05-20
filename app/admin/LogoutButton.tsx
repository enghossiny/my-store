'use client';

import { useState } from 'react';

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Force full page reload to clear everything
      window.location.href = '/admin/login';
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      style={{
        width: '100%', padding: '10px 14px',
        background: 'rgba(239,68,68,0.15)',
        color: '#ef4444',
        border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: '8px',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '13px', fontWeight: '600',
        fontFamily: 'inherit', textAlign: 'left',
        display: 'flex', alignItems: 'center', gap: '8px',
        opacity: loading ? 0.7 : 1,
      }}
    >
      🚪 {loading ? 'Signing out...' : 'Sign Out'}
    </button>
  );
}
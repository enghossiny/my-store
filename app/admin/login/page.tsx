'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      setError('Invalid username or password');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      padding: '1rem',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{
          background: '#fff', borderRadius: '24px',
          padding: '2.5rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '64px', height: '64px',
              background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
              borderRadius: '18px', margin: '0 auto 1rem',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '30px',
              boxShadow: '0 8px 20px rgba(108,99,255,0.4)',
            }}>🛒</div>
            <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: '800', color: '#1a1a2e' }}>
              Admin Login
            </h1>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
              Sign in to your dashboard
            </p>
          </div>

          {/* Username */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block', marginBottom: '6px',
              fontSize: '12px', color: '#6b7280', fontWeight: '700',
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              Username
            </label>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="admin"
              style={{
                width: '100%', padding: '12px 14px',
                border: '1.5px solid #e5e7eb', borderRadius: '10px',
                fontSize: '15px', boxSizing: 'border-box',
                fontFamily: 'inherit', outline: 'none',
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block', marginBottom: '6px',
              fontSize: '12px', color: '#6b7280', fontWeight: '700',
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '12px 14px',
                border: '1.5px solid #e5e7eb', borderRadius: '10px',
                fontSize: '15px', boxSizing: 'border-box',
                fontFamily: 'inherit', outline: 'none',
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '10px 14px', background: '#fef2f2',
              border: '1px solid #fecaca', borderRadius: '8px',
              marginBottom: '1rem', color: '#ef4444',
              fontSize: '14px', textAlign: 'center',
            }}>
              ❌ {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%', padding: '14px',
              background: loading
                ? '#9ca3af'
                : 'linear-gradient(135deg, #6c63ff, #e91e8c)',
              color: '#fff', border: 'none', borderRadius: '999px',
              fontSize: '16px', fontWeight: '800',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(108,99,255,0.4)',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </div>
      </div>
    </div>
  );
}
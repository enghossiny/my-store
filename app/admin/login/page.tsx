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
    <html>
      <body style={{ margin: 0, fontFamily: 'sans-serif', background: '#f8f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '2.5rem',
            boxShadow: '0 20px 60px rgba(108,99,255,0.15)',
            border: '1px solid rgba(108,99,255,0.1)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '60px', height: '60px',
                background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
                borderRadius: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px', margin: '0 auto 1rem',
              }}>🛒</div>
              <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: '800', color: '#1a1a2e' }}>
                Admin Login
              </h1>
              <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
                Sign in to your dashboard
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>
                USERNAME
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

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>
                PASSWORD
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

            {error && (
              <p style={{
                color: '#ef4444', background: '#fef2f2',
                padding: '10px 14px', borderRadius: '8px',
                marginBottom: '1rem', fontSize: '14px', textAlign: 'center',
              }}>
                ❌ {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%', padding: '14px',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #6c63ff, #e91e8c)',
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
      </body>
    </html>
  );
}
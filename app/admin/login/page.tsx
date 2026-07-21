'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.username || !form.password) {
      setError('Please enter username and password');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        window.location.href = '/admin';
      } else {
        setError(data.error ?? 'Invalid username or password');
      }
    } catch (err) {
      setError('Connection error, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      fontFamily: 'sans-serif',
      padding: '1rem',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Card */}
        <div style={{
          background: '#fff',
          borderRadius: '24px',
          padding: '2.5rem',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '72px', height: '72px',
              background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
              borderRadius: '20px', margin: '0 auto 1rem',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '34px',
              boxShadow: '0 8px 25px rgba(108,99,255,0.5)',
            }}>🛒</div>
            <h1 style={{
              margin: '0 0 6px', fontSize: '26px',
              fontWeight: '800', color: '#1a1a2e',
            }}>
              Admin Login
            </h1>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
              Enter your credentials to continue
            </p>
          </div>

          {/* Username */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block', marginBottom: '6px',
              fontSize: '12px', color: '#6b7280',
              fontWeight: '700', textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Username
            </label>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="admin"
              autoComplete="username"
              style={{
                width: '100%', padding: '13px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px', fontSize: '15px',
                boxSizing: 'border-box', fontFamily: 'inherit',
                outline: 'none', transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#6c63ff'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block', marginBottom: '6px',
              fontSize: '12px', color: '#6b7280',
              fontWeight: '700', textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="••••••••"
              autoComplete="current-password"
              style={{
                width: '100%', padding: '13px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px', fontSize: '15px',
                boxSizing: 'border-box', fontFamily: 'inherit',
                outline: 'none', transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#6c63ff'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '12px 16px',
              background: '#fef2f2',
              border: '1.5px solid #fecaca',
              borderRadius: '10px',
              marginBottom: '1.25rem',
              color: '#ef4444',
              fontSize: '14px',
              fontWeight: '500',
              textAlign: 'center',
            }}>
              ❌ {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%', padding: '15px',
              background: loading
                ? '#9ca3af'
                : 'linear-gradient(135deg, #6c63ff, #e91e8c)',
              color: '#fff', border: 'none',
              borderRadius: '999px', fontSize: '16px',
              fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              boxShadow: loading ? 'none' : '0 6px 20px rgba(108,99,255,0.5)',
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? '⏳ Signing in...' : 'Sign In →'}
          </button>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '13px', marginTop: '1.5rem' }}>
          MALATH Admin Panel
        </p>
      </div>
    </div>
  );
}
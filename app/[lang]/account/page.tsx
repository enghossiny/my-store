'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';

export default function AccountPage() {
  const { user, loading, signOut } = useAuth();
  const params = useParams();
  const router = useRouter();
  const lang = params.lang as string;
  const isAr = lang === 'ar';

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError(isAr ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields');
      return;
    }
    setSubmitting(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    if (error) setError(isAr ? 'بيانات غير صحيحة' : 'Invalid email or password');
    setSubmitting(false);
  };

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      setError(isAr ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields');
      return;
    }
    if (form.password.length < 6) {
      setError(isAr ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }
    setSubmitting(true);
    setError('');

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { name: form.name } },
    });

    if (error) {
      setError(isAr ? 'حدث خطأ في التسجيل' : 'Registration failed');
    } else {
      // Also save to customers table
      await supabase.from('customers').insert({
        name: form.name,
        email: form.email,
      });
    }
    setSubmitting(false);
  };

    const loadOrders = async () => {
    if (!user) return;
    setLoadingOrders(true);
    const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, products(name_ar, name_en))')
        .eq('auth_id', user.id)
        .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoadingOrders(false);
    };

  // Status badge color
  const statusColor: Record<string, string> = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    shipped: '#8b5cf6',
    delivered: '#16a34a',
    cancelled: '#ef4444',
  };

  const statusLabel: Record<string, { en: string; ar: string }> = {
    pending: { en: 'Pending', ar: 'قيد الانتظار' },
    confirmed: { en: 'Confirmed', ar: 'مؤكد' },
    shipped: { en: 'Shipped', ar: 'تم الشحن' },
    delivered: { en: 'Delivered', ar: 'تم التسليم' },
    cancelled: { en: 'Cancelled', ar: 'ملغي' },
  };

  if (loading) {
    return (
      <main style={{ padding: '3rem', textAlign: 'center' }}>
        <p>{isAr ? 'جاري التحميل...' : 'Loading...'}</p>
      </main>
    );
  }

  // Logged in view
  if (user) {
    return (
      <main style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}>
          <div>
            <h1 style={{ margin: '0 0 4px' }}>
              {isAr ? 'حسابي' : 'My Account'}
            </h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
              {user.email}
            </p>
          </div>
          <button
            onClick={signOut}
            style={{
              padding: '8px 20px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              background: '#fff',
              cursor: 'pointer',
              color: '#ef4444',
            }}
          >
            {isAr ? 'تسجيل الخروج' : 'Sign Out'}
          </button>
        </div>

        {/* Load orders button */}
        {orders.length === 0 && (
          <button
            onClick={loadOrders}
            disabled={loadingOrders}
            style={{
              padding: '10px 24px',
              background: '#111',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginBottom: '1.5rem',
            }}
          >
            {loadingOrders
              ? (isAr ? 'جاري التحميل...' : 'Loading...')
              : (isAr ? 'عرض طلباتي' : 'View My Orders')}
          </button>
        )}

        {/* Orders list */}
        {orders.length > 0 && (
          <div>
            <h2 style={{ marginBottom: '1rem' }}>
              {isAr ? 'طلباتي' : 'My Orders'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {orders.map((order) => (
                <div key={order.id} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}>
                  {/* Order header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                  }}>
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: '13px', color: '#6b7280' }}>
                        {isAr ? 'رقم الطلب' : 'Order ID'}
                      </p>
                      <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '12px' }}>
                        {order.id.slice(0, 8)}...
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '999px',
                        background: statusColor[order.status] + '20',
                        color: statusColor[order.status],
                        fontSize: '13px',
                        fontWeight: '500',
                      }}>
                        {isAr
                          ? statusLabel[order.status]?.ar
                          : statusLabel[order.status]?.en}
                      </span>
                    </div>
                  </div>

                  {/* Order items */}
                  <div style={{ padding: '12px 16px' }}>
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '14px',
                        padding: '4px 0',
                      }}>
                        <span>
                          {isAr
                            ? item.products?.name_ar
                            : item.products?.name_en} x{item.quantity}
                        </span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div style={{
                      borderTop: '1px solid #e5e7eb',
                      marginTop: '8px',
                      paddingTop: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontWeight: 'bold',
                    }}>
                      <span>{isAr ? 'المجموع' : 'Total'}</span>
                      <span>${order.total}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    );
  }

  // Logged out view — login/register form
  return (
    <main style={{ padding: '2rem', maxWidth: '420px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>
        {mode === 'login'
          ? (isAr ? 'تسجيل الدخول' : 'Sign In')
          : (isAr ? 'إنشاء حساب' : 'Create Account')}
      </h1>

      {/* Toggle tabs */}
      <div style={{
        display: 'flex',
        marginBottom: '2rem',
        border: '1px solid #e5e7eb',
        borderRadius: '10px',
        overflow: 'hidden',
      }}>
        {(['login', 'register'] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(''); }}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              background: mode === m ? '#111' : '#fff',
              color: mode === m ? '#fff' : '#374151',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: mode === m ? 'bold' : 'normal',
            }}
          >
            {m === 'login'
              ? (isAr ? 'دخول' : 'Sign In')
              : (isAr ? 'تسجيل' : 'Register')}
          </button>
        ))}
      </div>

      {/* Name field (register only) */}
      {mode === 'register' && (
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>
            {isAr ? 'الاسم الكامل' : 'Full Name'}
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder={isAr ? 'أدخل اسمك' : 'Enter your name'}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '15px',
              boxSizing: 'border-box',
            }}
          />
        </div>
      )}

      {/* Email */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>
          {isAr ? 'البريد الإلكتروني' : 'Email'}
        </label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder={isAr ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '15px',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Password */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>
          {isAr ? 'كلمة المرور' : 'Password'}
        </label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder={isAr ? 'أدخل كلمة المرور' : 'Enter your password'}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '15px',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Error */}
      {error && (
        <p style={{
          color: '#ef4444',
          background: '#fef2f2',
          padding: '10px 14px',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '14px',
        }}>
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        onClick={mode === 'login' ? handleLogin : handleRegister}
        disabled={submitting}
        style={{
          width: '100%',
          padding: '14px',
          background: submitting ? '#9ca3af' : '#111',
          color: '#fff',
          border: 'none',
          borderRadius: '10px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: submitting ? 'not-allowed' : 'pointer',
        }}
      >
        {submitting
          ? (isAr ? 'جاري التحميل...' : 'Loading...')
          : mode === 'login'
            ? (isAr ? 'دخول' : 'Sign In')
            : (isAr ? 'إنشاء حساب' : 'Create Account')}
      </button>
    </main>
  );
}
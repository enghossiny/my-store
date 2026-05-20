'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type Order = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  payment_method: string;
  region_name: string;
  delivery_fee: number;
  discount: number;
  promo_code: string | null;
  order_items: {
    quantity: number;
    price: number;
    products: { name_en: string; name_ar: string } | null;
  }[];
};

type Address = {
  id: string;
  label: string;
  name: string;
  phone: string;
  address: string;
  region_name_en: string | null;
  region_name_ar: string | null;
  delivery_fee: number;
  is_default: boolean;
};

type Region = {
  id: string;
  name_en: string;
  name_ar: string;
  delivery_fee: number;
};

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '').split(',').map(e => e.trim());

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

type Tab = 'overview' | 'orders' | 'addresses' | 'password';

export default function AccountPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const params = useParams();
  const router = useRouter();
  const lang = params.lang as string;
  const isAr = lang === 'ar';
  const [tab, setTab] = useState<Tab>('overview');

  if (authLoading) {
    return (
      <main style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '1rem' }}>⏳</div>
        <p style={{ color: '#9ca3af' }}>{isAr ? 'جاري التحميل...' : 'Loading...'}</p>
      </main>
    );
  }

  if (!user) return <AuthForms lang={lang} />;

  const isAdmin = ADMIN_EMAILS.includes(user.email ?? '');

  return (
    <>
      <style>{`
        .account-layout { flex-direction: column !important; }
        .account-sidebar { width: 100% !important; }
        @media (min-width: 768px) {
          .account-layout { flex-direction: row !important; }
          .account-sidebar { width: 260px !important; }
        }
      `}</style>

      <main style={{ padding: '1.5rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div className="account-layout" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>

          {/* Sidebar */}
          <aside className="account-sidebar" style={{ width: '260px', flexShrink: 0 }}>
            {/* Profile card */}
            <div style={{
              background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
              borderRadius: '20px', padding: '1.5rem',
              marginBottom: '1rem', textAlign: 'center',
              boxShadow: '0 8px 30px rgba(108,99,255,0.3)',
            }}>
              <div style={{
                width: '64px', height: '64px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '999px', margin: '0 auto 12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px', fontWeight: '800', color: '#fff',
                border: '3px solid rgba(255,255,255,0.4)',
              }}>
                {user.email?.[0].toUpperCase()}
              </div>
              <p style={{ margin: '0 0 4px', fontWeight: '700', color: '#fff', fontSize: '16px' }}>
                {user.user_metadata?.name ?? (isAr ? 'مستخدم' : 'User')}
              </p>
              <p style={{ margin: '0 0 12px', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                {user.email}
              </p>
              {isAdmin && (
                <Link href="/admin" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '6px 16px', background: '#ffdd00',
                  color: '#1a1a2e', borderRadius: '999px',
                  textDecoration: 'none', fontWeight: '800', fontSize: '13px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}>
                  ⚡ {isAr ? 'لوحة الإدارة' : 'Admin Dashboard'}
                </Link>
              )}
            </div>

            {/* Nav tabs */}
            <div style={{
              background: '#fff', borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              border: '1px solid #f3f4f6', overflow: 'hidden',
              marginBottom: '1rem',
            }}>
              {[
                { key: 'overview', icon: '🏠', label: isAr ? 'نظرة عامة' : 'Overview' },
                { key: 'orders', icon: '📦', label: isAr ? 'طلباتي' : 'My Orders' },
                { key: 'addresses', icon: '📍', label: isAr ? 'عناويني' : 'My Addresses' },
                { key: 'password', icon: '🔒', label: isAr ? 'كلمة المرور' : 'Password' },
              ].map((item, i, arr) => (
                <button
                  key={item.key}
                  onClick={() => setTab(item.key as Tab)}
                  style={{
                    width: '100%', padding: '14px 16px',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: tab === item.key ? '#f8f7ff' : '#fff',
                    border: 'none',
                    borderBottom: i < arr.length - 1 ? '1px solid #f3f4f6' : 'none',
                    borderRight: tab === item.key ? '3px solid #6c63ff' : '3px solid transparent',
                    cursor: 'pointer', textAlign: isAr ? 'right' : 'left',
                    color: tab === item.key ? '#6c63ff' : '#374151',
                    fontWeight: tab === item.key ? '700' : '500',
                    fontSize: '14px', fontFamily: 'inherit',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>

            {/* Sign out */}
            <button
              onClick={async () => { await signOut(); router.push(`/${lang}`); }}
              style={{
                width: '100%', padding: '12px',
                background: '#fff', color: '#ef4444',
                border: '1.5px solid #fecaca', borderRadius: '12px',
                cursor: 'pointer', fontSize: '14px', fontWeight: '700',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px',
              }}
            >
              🚪 {isAr ? 'تسجيل الخروج' : 'Sign Out'}
            </button>
          </aside>

          {/* Main content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {tab === 'overview' && <OverviewTab user={user} lang={lang} isAdmin={isAdmin} setTab={setTab} />}
            {tab === 'orders' && <OrdersTab lang={lang} userId={user.id} />}
            {tab === 'addresses' && <AddressesTab lang={lang} userId={user.id} />}
            {tab === 'password' && <PasswordTab lang={lang} />}
          </div>

        </div>
      </main>
    </>
  );
}

// ─── OVERVIEW TAB ──────────────────────────────────────────────────────────

function OverviewTab({ user, lang, isAdmin, setTab }: {
  user: any; lang: string; isAdmin: boolean; setTab: (t: Tab) => void;
}) {
  const isAr = lang === 'ar';
  const [stats, setStats] = useState({ total: 0, delivered: 0, pending: 0, spent: 0 });

  useEffect(() => {
    supabase.from('orders').select('status, total').eq('auth_id', user.id).then(({ data }) => {
      if (!data) return;
      setStats({
        total: data.length,
        delivered: data.filter(o => o.status === 'delivered').length,
        pending: data.filter(o => o.status === 'pending').length,
        spent: data.reduce((s, o) => s + Number(o.total), 0),
      });
    });
  }, [user.id]);

  return (
    <div>
      <h2 style={{ margin: '0 0 1.5rem', fontSize: '24px', fontWeight: '800' }}>
        {isAr ? `مرحباً، ${user.user_metadata?.name ?? 'مستخدم'} 👋` : `Welcome back, ${user.user_metadata?.name ?? 'User'} 👋`}
      </h2>

      {/* Admin banner */}
      {isAdmin && (
        <Link href="/admin" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.25rem', background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
          borderRadius: '16px', textDecoration: 'none', marginBottom: '1.5rem',
          boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '28px' }}>⚡</div>
            <div>
              <p style={{ margin: '0 0 2px', fontWeight: '800', color: '#fff', fontSize: '15px' }}>
                {isAr ? 'لوحة تحكم الإدارة' : 'Admin Dashboard'}
              </p>
              <p style={{ margin: 0, color: '#9ca3af', fontSize: '13px' }}>
                {isAr ? 'إدارة المنتجات والطلبات والعملاء' : 'Manage products, orders and customers'}
              </p>
            </div>
          </div>
          <span style={{
            padding: '8px 18px', background: '#ffdd00',
            color: '#1a1a2e', borderRadius: '999px',
            fontWeight: '800', fontSize: '13px',
          }}>
            {isAr ? 'فتح ←' : 'Open →'}
          </span>
        </Link>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: isAr ? 'إجمالي الطلبات' : 'Total Orders', value: stats.total, icon: '📦', color: '#6c63ff' },
          { label: isAr ? 'تم التسليم' : 'Delivered', value: stats.delivered, icon: '✅', color: '#16a34a' },
          { label: isAr ? 'قيد الانتظار' : 'Pending', value: stats.pending, icon: '⏳', color: '#f59e0b' },
          { label: isAr ? 'إجمالي الإنفاق' : 'Total Spent', value: `$${stats.spent.toFixed(2)}`, icon: '💰', color: '#e91e8c' },
        ].map((s) => (
          <div key={s.label} style={{
            background: '#fff', borderRadius: '16px', padding: '1.25rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <div style={{
              width: '44px', height: '44px', background: s.color + '15',
              borderRadius: '12px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '22px', flexShrink: 0,
            }}>{s.icon}</div>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '22px', fontWeight: '800', color: '#1a1a2e' }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '1.25rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
      }}>
        <p style={{ margin: '0 0 1rem', fontWeight: '700', fontSize: '15px' }}>
          {isAr ? 'الإجراءات السريعة' : 'Quick Actions'}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          {[
            { icon: '📦', label: isAr ? 'عرض الطلبات' : 'View Orders', tab: 'orders' as Tab },
            { icon: '📍', label: isAr ? 'إدارة العناوين' : 'Manage Addresses', tab: 'addresses' as Tab },
            { icon: '🔒', label: isAr ? 'تغيير كلمة المرور' : 'Change Password', tab: 'password' as Tab },
          ].map((a) => (
            <button key={a.tab} onClick={() => setTab(a.tab)} style={{
              padding: '12px', background: '#f8f7ff',
              border: '1.5px solid #e5e7eb', borderRadius: '12px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
              fontSize: '14px', fontWeight: '600', color: '#374151', fontFamily: 'inherit',
            }}>
              <span style={{ fontSize: '20px' }}>{a.icon}</span>
              {a.label}
            </button>
          ))}
          <Link href={`/${lang}/products`} style={{
            padding: '12px', background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
            borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px',
            fontSize: '14px', fontWeight: '600', color: '#fff', textDecoration: 'none',
          }}>
            <span style={{ fontSize: '20px' }}>🛍️</span>
            {isAr ? 'تسوق الآن' : 'Shop Now'}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── ORDERS TAB ─────────────────────────────────────────────────────────────

function OrdersTab({ lang, userId }: { lang: string; userId: string }) {
  const isAr = lang === 'ar';
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('orders')
      .select('*, order_items(quantity, price, products(name_en, name_ar))')
      .eq('auth_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setOrders(data ?? []); setLoading(false); });
  }, [userId]);

  if (loading) return <LoadingSpinner />;

  if (orders.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#fff', borderRadius: '20px', border: '2px dashed #e5e7eb' }}>
        <p style={{ fontSize: '48px', margin: '0 0 1rem' }}>📭</p>
        <h3 style={{ margin: '0 0 8px' }}>{isAr ? 'لا توجد طلبات بعد' : 'No orders yet'}</h3>
        <p style={{ color: '#9ca3af', margin: '0 0 1.5rem' }}>{isAr ? 'ابدأ التسوق الآن!' : 'Start shopping now!'}</p>
        <Link href={`/${lang}/products`} style={{
          padding: '12px 28px', background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
          color: '#fff', borderRadius: '999px', textDecoration: 'none', fontWeight: '700',
        }}>
          {isAr ? 'تسوق الآن' : 'Shop Now'}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ margin: '0 0 1.5rem', fontSize: '22px', fontWeight: '800' }}>
        {isAr ? 'طلباتي' : 'My Orders'} ({orders.length})
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {orders.map((order) => (
          <div key={order.id} style={{
            background: '#fff', borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            border: '1px solid #f3f4f6', overflow: 'hidden',
          }}>
            {/* Order header */}
            <div
              onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              style={{
                padding: '1rem 1.25rem', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', flexWrap: 'wrap', gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px', height: '42px',
                  background: statusColor[order.status] + '20',
                  borderRadius: '12px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                }}>
                  {order.status === 'pending' ? '⏳'
                    : order.status === 'confirmed' ? '✅'
                    : order.status === 'shipped' ? '🚚'
                    : order.status === 'delivered' ? '📦'
                    : '❌'}
                </div>
                <div>
                  <p style={{ margin: '0 0 2px', fontWeight: '700', fontSize: '14px' }}>
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                    {new Date(order.created_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '700',
                  background: statusColor[order.status] + '20',
                  color: statusColor[order.status],
                }}>
                  {isAr ? statusLabel[order.status]?.ar : statusLabel[order.status]?.en}
                </span>
                <span style={{ fontWeight: '800', fontSize: '18px', color: '#1a1a2e' }}>
                  ${order.total}
                </span>
                <span style={{ color: '#9ca3af', fontSize: '18px' }}>
                  {expanded === order.id ? '▲' : '▼'}
                </span>
              </div>
            </div>

            {/* Expanded order details */}
            {expanded === order.id && (
              <div style={{ borderTop: '1px solid #f3f4f6', padding: '1rem 1.25rem', background: '#fafafa' }}>

                {/* Items */}
                <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>
                  {isAr ? 'المنتجات' : 'Items'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1rem' }}>
                  {order.order_items?.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span style={{ color: '#374151' }}>
                        {isAr ? item.products?.name_ar : item.products?.name_en} ×{item.quantity}
                      </span>
                      <span style={{ fontWeight: '700' }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bill breakdown */}
                <div style={{ background: '#fff', borderRadius: '10px', padding: '10px 14px', border: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                    <span>{isAr ? 'رسوم التوصيل' : 'Delivery fee'} {order.region_name && `(${order.region_name})`}</span>
                    <span>${order.delivery_fee ?? 0}</span>
                  </div>
                  {order.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#16a34a', marginBottom: '4px' }}>
                      <span>🎟️ {order.promo_code}</span>
                      <span>− ${order.discount}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '15px', paddingTop: '8px', borderTop: '1px solid #f3f4f6', marginTop: '4px' }}>
                    <span>{isAr ? 'المجموع' : 'Total'}</span>
                    <span style={{
                      background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                      ${order.total}
                    </span>
                  </div>
                </div>

                {/* Payment method */}
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                    {isAr ? 'طريقة الدفع:' : 'Payment:'}
                  </span>
                  <span style={{
                    fontSize: '12px', fontWeight: '700', padding: '2px 10px', borderRadius: '999px',
                    background: order.payment_method === 'cod' ? '#f0fdf4' : order.payment_method === 'instapay' ? '#eff6ff' : '#fdf4ff',
                    color: order.payment_method === 'cod' ? '#16a34a' : order.payment_method === 'instapay' ? '#3b82f6' : '#9333ea',
                  }}>
                    {order.payment_method === 'cod' ? (isAr ? 'الدفع عند الاستلام' : 'Cash on Delivery')
                      : order.payment_method === 'instapay' ? 'InstaPay'
                      : (isAr ? 'محفظة إلكترونية' : 'Mobile Wallet')}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ADDRESSES TAB ──────────────────────────────────────────────────────────

function AddressesTab({ lang, userId }: { lang: string; userId: string }) {
  const isAr = lang === 'ar';
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState({ label: 'Home', name: '', phone: '', address: '', region_id: '' });

  useEffect(() => {
    Promise.all([
      supabase.from('customer_addresses').select('*').eq('auth_id', userId).order('is_default', { ascending: false }),
      supabase.from('delivery_regions').select('*').eq('active', true).order('delivery_fee'),
    ]).then(([{ data: addrs }, { data: regs }]) => {
      setAddresses(addrs ?? []);
      setRegions(regs ?? []);
      setLoading(false);
    });
  }, [userId]);

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.address || !form.region_id) return;
    setSaving(true);
    const region = regions.find(r => r.id === form.region_id);
    const { data, error } = await supabase.from('customer_addresses').insert({
      auth_id: userId,
      label: form.label,
      name: form.name,
      phone: form.phone,
      address: form.address,
      region_id: form.region_id,
      region_name_en: region?.name_en,
      region_name_ar: region?.name_ar,
      delivery_fee: region?.delivery_fee ?? 0,
      is_default: addresses.length === 0,
    }).select().single();
    if (!error && data) {
      setAddresses(prev => [data, ...prev]);
      setShowForm(false);
      setForm({ label: 'Home', name: '', phone: '', address: '', region_id: '' });
    }
    setSaving(false);
  };

  const handleSetDefault = async (id: string) => {
    await supabase.from('customer_addresses').update({ is_default: false }).eq('auth_id', userId);
    await supabase.from('customer_addresses').update({ is_default: true }).eq('id', id);
    setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id })));
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isAr ? 'حذف هذا العنوان؟' : 'Delete this address?')) return;
    setDeleting(id);
    await supabase.from('customer_addresses').delete().eq('id', id);
    setAddresses(prev => prev.filter(a => a.id !== id));
    setDeleting(null);
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    border: '1.5px solid #e5e7eb', borderRadius: '10px',
    fontSize: '14px', boxSizing: 'border-box' as const,
    fontFamily: 'inherit', outline: 'none', background: '#fff',
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800' }}>
          {isAr ? 'عناويني' : 'My Addresses'} ({addresses.length})
        </h2>
        <button onClick={() => setShowForm(!showForm)} style={{
          padding: '10px 20px',
          background: showForm ? '#f3f4f6' : 'linear-gradient(135deg, #6c63ff, #e91e8c)',
          color: showForm ? '#374151' : '#fff',
          border: 'none', borderRadius: '999px',
          cursor: 'pointer', fontSize: '14px', fontWeight: '700', fontFamily: 'inherit',
        }}>
          {showForm ? (isAr ? '✕ إلغاء' : '✕ Cancel') : (isAr ? '+ إضافة عنوان' : '+ Add Address')}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{
          background: '#fff', borderRadius: '16px', padding: '1.5rem',
          boxShadow: '0 4px 20px rgba(108,99,255,0.08)',
          border: '2px solid #c4b5fd', marginBottom: '1.5rem',
        }}>
          <h3 style={{ margin: '0 0 1.25rem', fontSize: '16px', fontWeight: '700', color: '#6c63ff' }}>
            {isAr ? 'عنوان جديد' : 'New Address'}
          </h3>

          {/* Label */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
              {isAr ? 'التصنيف' : 'LABEL'}
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['Home', 'Work', 'Family', 'Other'].map((l) => (
                <button key={l} onClick={() => setForm({ ...form, label: l })} style={{
                  padding: '6px 14px', borderRadius: '999px',
                  border: form.label === l ? '2px solid #6c63ff' : '1.5px solid #e5e7eb',
                  background: form.label === l ? '#6c63ff' : '#fff',
                  color: form.label === l ? '#fff' : '#374151',
                  cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit',
                }}>
                  {l === 'Home' ? '🏠' : l === 'Work' ? '💼' : l === 'Family' ? '👨‍👩‍👧' : '📍'} {l}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>{isAr ? 'الاسم *' : 'NAME *'}</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={isAr ? 'الاسم الكامل' : 'Full name'} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>{isAr ? 'الهاتف *' : 'PHONE *'}</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={isAr ? 'رقم الهاتف' : 'Phone number'} style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>{isAr ? 'منطقة التوصيل *' : 'DELIVERY REGION *'}</label>
            <select value={form.region_id} onChange={(e) => setForm({ ...form, region_id: e.target.value })} style={inputStyle}>
              <option value="">{isAr ? 'اختر المنطقة' : 'Select region'}</option>
              {regions.map(r => (
                <option key={r.id} value={r.id}>{isAr ? r.name_ar : r.name_en} — ${r.delivery_fee}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>{isAr ? 'العنوان التفصيلي *' : 'FULL ADDRESS *'}</label>
            <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder={isAr ? 'الشارع، المبنى، الطابق...' : 'Street, building, floor...'} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <button onClick={handleSave} disabled={saving || !form.name || !form.phone || !form.address || !form.region_id} style={{
            padding: '12px 28px',
            background: saving ? '#9ca3af' : 'linear-gradient(135deg, #6c63ff, #e91e8c)',
            color: '#fff', border: 'none', borderRadius: '999px',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: '14px', fontWeight: '700', fontFamily: 'inherit',
          }}>
            {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? '💾 حفظ العنوان' : '💾 Save Address')}
          </button>
        </div>
      )}

      {/* Addresses list */}
      {addresses.length === 0 && !showForm ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#fff', borderRadius: '20px', border: '2px dashed #e5e7eb' }}>
          <p style={{ fontSize: '48px', margin: '0 0 1rem' }}>📍</p>
          <h3 style={{ margin: '0 0 8px' }}>{isAr ? 'لا توجد عناوين محفوظة' : 'No saved addresses'}</h3>
          <p style={{ color: '#9ca3af', margin: 0 }}>{isAr ? 'أضف عنواناً للتوصيل السريع' : 'Add an address for faster checkout'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {addresses.map((addr) => (
            <div key={addr.id} style={{
              background: '#fff', borderRadius: '16px', padding: '1.25rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              border: addr.is_default ? '2px solid #6c63ff' : '1px solid #f3f4f6',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '4px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: '700',
                    background: addr.is_default ? '#6c63ff' : '#f3f4f6',
                    color: addr.is_default ? '#fff' : '#374151',
                  }}>
                    {addr.label === 'Home' ? '🏠' : addr.label === 'Work' ? '💼' : addr.label === 'Family' ? '👨‍👩‍👧' : '📍'} {addr.label}
                  </span>
                  {addr.is_default && (
                    <span style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700', background: '#fef9c3', color: '#854d0e' }}>
                      ⭐ {isAr ? 'الافتراضي' : 'Default'}
                    </span>
                  )}
                </div>
              </div>

              <p style={{ margin: '0 0 4px', fontWeight: '700', fontSize: '15px' }}>
                {addr.name} — {addr.phone}
              </p>
              <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#374151' }}>{addr.address}</p>
              {addr.region_name_en && (
                <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#6c63ff', fontWeight: '600' }}>
                  🚚 {isAr ? addr.region_name_ar : addr.region_name_en} — ${addr.delivery_fee}
                </p>
              )}

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid #f3f4f6' }}>
                {!addr.is_default && (
                  <button onClick={() => handleSetDefault(addr.id)} style={{
                    padding: '6px 14px', background: '#fef9c3', color: '#854d0e',
                    border: '1px solid #fde68a', borderRadius: '999px',
                    cursor: 'pointer', fontSize: '12px', fontWeight: '600', fontFamily: 'inherit',
                  }}>
                    ⭐ {isAr ? 'تعيين افتراضي' : 'Set as default'}
                  </button>
                )}
                <button onClick={() => handleDelete(addr.id)} disabled={deleting === addr.id} style={{
                  padding: '6px 14px', background: '#fef2f2', color: '#ef4444',
                  border: '1px solid #fecaca', borderRadius: '999px',
                  cursor: 'pointer', fontSize: '12px', fontWeight: '600', fontFamily: 'inherit',
                }}>
                  {deleting === addr.id ? '...' : (isAr ? '🗑️ حذف' : '🗑️ Delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PASSWORD TAB ────────────────────────────────────────────────────────────

function PasswordTab({ lang }: { lang: string }) {
  const isAr = lang === 'ar';
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);

  const handleChange = async () => {
    if (!form.password || !form.confirm) {
      setError(isAr ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields');
      return;
    }
    if (form.password.length < 6) {
      setError(isAr ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirm) {
      setError(isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    const { error: updateError } = await supabase.auth.updateUser({ password: form.password });
    if (updateError) {
      setError(isAr ? 'فشل تغيير كلمة المرور' : 'Failed to update password');
    } else {
      setSuccess(true);
      setForm({ password: '', confirm: '' });
      setTimeout(() => setSuccess(false), 4000);
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    border: '1.5px solid #e5e7eb', borderRadius: '10px',
    fontSize: '15px', boxSizing: 'border-box' as const,
    fontFamily: 'inherit', outline: 'none', background: '#fff',
  };

  return (
    <div>
      <h2 style={{ margin: '0 0 1.5rem', fontSize: '22px', fontWeight: '800' }}>
        {isAr ? 'تغيير كلمة المرور' : 'Change Password'}
      </h2>

      <div style={{
        background: '#fff', borderRadius: '16px', padding: '1.5rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
        maxWidth: '440px',
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>
            {isAr ? 'كلمة المرور الجديدة' : 'NEW PASSWORD'}
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={show ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              style={inputStyle}
            />
            <button onClick={() => setShow(!show)} style={{
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '16px',
            }}>
              {show ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>
            {isAr ? 'تأكيد كلمة المرور' : 'CONFIRM PASSWORD'}
          </label>
          <input
            type={show ? 'text' : 'password'}
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            placeholder="••••••••"
            style={{
              ...inputStyle,
              border: form.confirm && form.password !== form.confirm
                ? '1.5px solid #ef4444'
                : form.confirm && form.password === form.confirm
                  ? '1.5px solid #16a34a'
                  : '1.5px solid #e5e7eb',
            }}
          />
          {form.confirm && form.password !== form.confirm && (
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#ef4444' }}>
              ❌ {isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match'}
            </p>
          )}
          {form.confirm && form.password === form.confirm && (
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#16a34a' }}>
              ✅ {isAr ? 'كلمتا المرور متطابقتان' : 'Passwords match'}
            </p>
          )}
        </div>

        {/* Password strength indicator */}
        {form.password && (
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
              {isAr ? 'قوة كلمة المرور:' : 'Password strength:'}
            </p>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3, 4].map((level) => {
                const strength = form.password.length >= 6
                  ? form.password.length >= 8
                    ? /[A-Z]/.test(form.password) && /[0-9]/.test(form.password)
                      ? 4 : 3
                    : 2
                  : 1;
                return (
                  <div key={level} style={{
                    flex: 1, height: '4px', borderRadius: '999px',
                    background: level <= strength
                      ? strength === 1 ? '#ef4444' : strength === 2 ? '#f59e0b' : strength === 3 ? '#3b82f6' : '#16a34a'
                      : '#e5e7eb',
                    transition: 'background 0.3s',
                  }} />
                );
              })}
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#9ca3af' }}>
              {form.password.length < 6 ? (isAr ? 'ضعيفة جداً' : 'Too weak')
                : form.password.length < 8 ? (isAr ? 'ضعيفة' : 'Weak')
                : /[A-Z]/.test(form.password) && /[0-9]/.test(form.password) ? (isAr ? 'قوية جداً' : 'Very strong')
                : (isAr ? 'متوسطة' : 'Medium')}
            </p>
          </div>
        )}

        {error && (
          <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', marginBottom: '1rem', color: '#ef4444', fontSize: '14px' }}>
            ❌ {error}
          </div>
        )}

        {success && (
          <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', marginBottom: '1rem', color: '#16a34a', fontSize: '14px', fontWeight: '600' }}>
            ✅ {isAr ? 'تم تغيير كلمة المرور بنجاح!' : 'Password updated successfully!'}
          </div>
        )}

        <button
          onClick={handleChange}
          disabled={loading || form.password !== form.confirm || form.password.length < 6}
          style={{
            width: '100%', padding: '14px',
            background: loading || form.password !== form.confirm || form.password.length < 6
              ? '#e5e7eb' : 'linear-gradient(135deg, #6c63ff, #e91e8c)',
            color: loading || form.password !== form.confirm || form.password.length < 6 ? '#9ca3af' : '#fff',
            border: 'none', borderRadius: '999px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '15px', fontWeight: '800', fontFamily: 'inherit',
          }}
        >
          {loading ? (isAr ? 'جاري التحديث...' : 'Updating...') : (isAr ? '🔒 تغيير كلمة المرور' : '🔒 Update Password')}
        </button>
      </div>
    </div>
  );
}

// ─── AUTH FORMS ──────────────────────────────────────────────────────────────

function AuthForms({ lang }: { lang: string }) {
  const isAr = lang === 'ar';
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [show, setShow] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) { setError(isAr ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields'); return; }
    setSubmitting(true); setError('');
    const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
    if (error) setError(isAr ? 'بيانات غير صحيحة' : 'Invalid email or password');
    setSubmitting(false);
  };

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) { setError(isAr ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields'); return; }
    if (form.password.length < 6) { setError(isAr ? 'كلمة المرور 6 أحرف على الأقل' : 'Password must be at least 6 characters'); return; }
    setSubmitting(true); setError('');
    const { error } = await supabase.auth.signUp({ email: form.email, password: form.password, options: { data: { name: form.name } } });
    if (error) setError(isAr ? 'حدث خطأ في التسجيل' : 'Registration failed');
    else await supabase.from('customers').insert({ name: form.name, email: form.email });
    setSubmitting(false);
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    border: '1.5px solid #e5e7eb', borderRadius: '10px',
    fontSize: '15px', boxSizing: 'border-box' as const,
    fontFamily: 'inherit', outline: 'none',
  };

  return (
    <main style={{ padding: '2rem 1rem', maxWidth: '440px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          width: '64px', height: '64px',
          background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
          borderRadius: '20px', margin: '0 auto 1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px',
        }}>👤</div>
        <h1 style={{ margin: '0 0 4px', fontSize: '26px', fontWeight: '800' }}>
          {mode === 'login' ? (isAr ? 'تسجيل الدخول' : 'Sign In') : (isAr ? 'إنشاء حساب' : 'Create Account')}
        </h1>
        <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
          {mode === 'login'
            ? (isAr ? 'أدخل بياناتك للوصول إلى حسابك' : 'Enter your details to access your account')
            : (isAr ? 'أنشئ حساباً للتسوق بسهولة' : 'Create an account for easier shopping')}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', marginBottom: '1.5rem', border: '1.5px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', background: '#f9fafb' }}>
        {(['login', 'register'] as const).map((m) => (
          <button key={m} onClick={() => { setMode(m); setError(''); }} style={{
            flex: 1, padding: '12px', border: 'none',
            background: mode === m ? '#fff' : 'transparent',
            color: mode === m ? '#6c63ff' : '#9ca3af',
            cursor: 'pointer', fontSize: '14px', fontWeight: '700', fontFamily: 'inherit',
            boxShadow: mode === m ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            borderRadius: mode === m ? '10px' : '0',
            margin: mode === m ? '3px' : '0', transition: 'all 0.2s',
          }}>
            {m === 'login' ? (isAr ? '🔑 دخول' : '🔑 Sign In') : (isAr ? '✨ تسجيل' : '✨ Register')}
          </button>
        ))}
      </div>

      <div style={{
        background: '#fff', borderRadius: '20px', padding: '1.5rem',
        boxShadow: '0 8px 30px rgba(108,99,255,0.1)',
        border: '1px solid rgba(108,99,255,0.1)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                {isAr ? 'الاسم الكامل' : 'FULL NAME'}
              </label>
              <input name="name" value={form.name} onChange={handleChange}
                placeholder={isAr ? 'أدخل اسمك' : 'Enter your name'} style={inputStyle} />
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
              {isAr ? 'البريد الإلكتروني' : 'EMAIL'}
            </label>
            <input name="email" type="email" value={form.email} onChange={handleChange}
              placeholder={isAr ? 'أدخل بريدك الإلكتروني' : 'Enter your email'} style={inputStyle} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
              {isAr ? 'كلمة المرور' : 'PASSWORD'}
            </label>
            <div style={{ position: 'relative' }}>
              <input name="password" type={show ? 'text' : 'password'} value={form.password} onChange={handleChange}
                onKeyDown={(e) => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleRegister())}
                placeholder="••••••••" style={inputStyle} />
              <button onClick={() => setShow(!show)} style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '16px',
              }}>
                {show ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', margin: '1rem 0 0', color: '#ef4444', fontSize: '14px' }}>
            ❌ {error}
          </div>
        )}

        <button
          onClick={mode === 'login' ? handleLogin : handleRegister}
          disabled={submitting}
          style={{
            width: '100%', padding: '14px', marginTop: '1.25rem',
            background: submitting ? '#9ca3af' : 'linear-gradient(135deg, #6c63ff, #e91e8c)',
            color: '#fff', border: 'none', borderRadius: '999px',
            fontSize: '16px', fontWeight: '800',
            cursor: submitting ? 'not-allowed' : 'pointer',
            boxShadow: submitting ? 'none' : '0 4px 20px rgba(108,99,255,0.4)',
            fontFamily: 'inherit',
          }}
        >
          {submitting ? (isAr ? 'جاري التحميل...' : 'Loading...')
            : mode === 'login' ? (isAr ? 'دخول ←' : 'Sign In →')
            : (isAr ? 'إنشاء حساب ←' : 'Create Account →')}
        </button>
      </div>
    </main>
  );
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <div style={{ padding: '3rem', textAlign: 'center' }}>
      <div style={{ fontSize: '32px', marginBottom: '1rem' }}>⏳</div>
      <p style={{ color: '#9ca3af' }}>Loading...</p>
    </div>
  );
}
import Link from 'next/link';
import LogoutButton from './LogoutButton';

const isAdminConfigured = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      fontFamily: 'Poppins, sans-serif',
      background: '#f8f7ff', color: '#1a1a2e',
    }}>

      {/* Sidebar */}
      <aside style={{
        width: '240px', flexShrink: 0,
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
        boxShadow: '4px 0 20px rgba(0,0,0,0.2)',
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px',
              background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
              borderRadius: '12px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '20px',
            }}>🛒</div>
            <div>
              <p style={{ margin: 0, fontWeight: '800', fontSize: '16px', color: '#fff' }}>
                MyStore
              </p>
              <p style={{ margin: 0, fontSize: '11px', color: '#6c63ff' }}>
                Admin Panel
              </p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {[
            { href: '/admin', label: 'Overview', icon: '📊' },
            { href: '/admin/orders', label: 'Orders', icon: '📦' },
            { href: '/admin/products', label: 'Products', icon: '🛍️' },
            { href: '/admin/customers', label: 'Customers', icon: '👥' },
            { href: '/admin/promos', label: 'Promo Codes', icon: '🎟️' },
            { href: '/admin/regions', label: 'Delivery Regions', icon: '🚚' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 1.5rem',
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none', fontSize: '14px', fontWeight: '500',
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
        }}>
          <Link href="/en" style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            color: 'rgba(255,255,255,0.5)',
            textDecoration: 'none', fontSize: '13px', marginBottom: '12px',
          }}>
            ← View Store
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
        {/* Top bar */}
        <div style={{
          background: '#fff', padding: '1rem 2rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric',
              month: 'long', day: 'numeric',
            })}
          </p>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
            borderRadius: '999px', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: '800', fontSize: '14px',
          }}>A</div>
        </div>

        <div style={{ padding: '2rem' }}>
          {!isAdminConfigured && (
            <div style={{
              marginBottom: '1rem', padding: '12px', borderRadius: '10px',
              background: '#fff7ed', color: '#92400e', border: '1px solid #ffedd5'
            }}>
              <strong>Admin configuration missing:</strong> SUPABASE_SERVICE_ROLE_KEY is not set. Admin API features may fail in production. Add the service role key to your host environment (do NOT commit it to git).
            </div>
          )}

          {children}
        </div>
      </main>
    </div>
  );
}
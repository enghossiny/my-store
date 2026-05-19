import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'sans-serif', background: '#f9fafb' }}>
        <div style={{ display: 'flex', minHeight: '100vh' }}>

          {/* Sidebar */}
          <aside style={{
            width: '220px',
            background: '#111',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem 0',
            flexShrink: 0,
          }}>
            <div style={{ padding: '0 1.5rem 1.5rem', borderBottom: '1px solid #333' }}>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '18px' }}>🛒 Admin</p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#9ca3af' }}>Store Dashboard</p>
            </div>

            <nav style={{ padding: '1rem 0', flex: 1 }}>
              {[
                { href: '/admin', label: 'Overview', icon: '📊' },
                { href: '/admin/orders', label: 'Orders', icon: '📦' },
                { href: '/admin/products', label: 'Products', icon: '🛍️' },
                { href: '/admin/customers', label: 'Customers', icon: '👥' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 1.5rem',
                    color: '#d1d5db',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'background 0.15s',
                  }}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>

            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #333' }}>
              <Link href="/en" style={{
                fontSize: '13px',
                color: '#9ca3af',
                textDecoration: 'none',
              }}>
                ← Back to Store
              </Link>
            </div>
          </aside>

          {/* Main content */}
          <main style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
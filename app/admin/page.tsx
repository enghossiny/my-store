import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const [
    { count: totalOrders },
    { count: totalProducts },
    { count: totalCustomers },
    { data: allOrders },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('total, status, created_at'),
    supabase.from('orders')
      .select('id, total, status, phone, address, created_at')
      .order('created_at', { ascending: false })
      .limit(8),
  ]);

  const totalRevenue = allOrders?.reduce((sum, o) => sum + Number(o.total), 0) ?? 0;
  const deliveredRevenue = allOrders?.filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + Number(o.total), 0) ?? 0;
  const pendingOrders = allOrders?.filter(o => o.status === 'pending').length ?? 0;
  const cancelledOrders = allOrders?.filter(o => o.status === 'cancelled').length ?? 0;

  const statusColor: Record<string, string> = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    shipped: '#8b5cf6',
    delivered: '#16a34a',
    cancelled: '#ef4444',
  };

  const stats = [
    { label: 'Total Revenue', value: `EGP ${totalRevenue.toFixed(2)}`, icon: '💰', color: '#6c63ff', sub: `EGP ${deliveredRevenue.toFixed(2)} delivered` },
    { label: 'Total Orders', value: totalOrders ?? 0, icon: '📦', color: '#e91e8c', sub: `${pendingOrders} pending` },
    { label: 'Products', value: totalProducts ?? 0, icon: '🛍️', color: '#00c9a7', sub: 'in store' },
    { label: 'Customers', value: totalCustomers ?? 0, icon: '👥', color: '#f59e0b', sub: `${cancelledOrders} cancelled orders` },
  ];

  // Orders by status breakdown
  const statusBreakdown = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => ({
    status: s,
    count: allOrders?.filter(o => o.status === s).length ?? 0,
    revenue: allOrders?.filter(o => o.status === s).reduce((sum, o) => sum + Number(o.total), 0) ?? 0,
  }));

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: '800' }}>Dashboard</h1>
        <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>Welcome back! Here's what's happening.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
        {stats.map((stat) => (
          <div key={stat.label} style={{
            background: '#fff', borderRadius: '16px', padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            border: '1px solid #f3f4f6',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: stat.color + '20',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px',
              }}>
                {stat.icon}
              </div>
            </div>
            <p style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: '800', color: '#1a1a2e' }}>
              {stat.value}
            </p>
            <p style={{ margin: '0 0 2px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
              {stat.label}
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: stat.color, fontWeight: '600' }}>
              {stat.sub}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>

        {/* Status breakdown */}
        <div style={{
          background: '#fff', borderRadius: '16px', padding: '1.5rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
        }}>
          <h2 style={{ margin: '0 0 1.5rem', fontSize: '16px', fontWeight: '700' }}>
            Orders by Status
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {statusBreakdown.map((s) => (
              <div key={s.status}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', textTransform: 'capitalize', color: statusColor[s.status] }}>
                    {s.status}
                  </span>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>
                    {s.count} orders — EGP {s.revenue.toFixed(2)}
                  </span>
                </div>
                <div style={{ background: '#f3f4f6', borderRadius: '999px', height: '6px' }}>
                  <div style={{
                    background: statusColor[s.status],
                    height: '6px', borderRadius: '999px',
                    width: `${totalOrders ? (s.count / totalOrders) * 100 : 0}%`,
                    transition: 'width 0.5s',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue summary */}
        <div style={{
          background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
          borderRadius: '16px', padding: '1.5rem',
          boxShadow: '0 4px 20px rgba(108,99,255,0.3)',
        }}>
          <h2 style={{ margin: '0 0 1.5rem', fontSize: '16px', fontWeight: '700', color: '#fff' }}>
            Revenue Summary
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Total Revenue (all orders)', value: `EGP ${totalRevenue.toFixed(2)}` },
              { label: 'Confirmed Revenue', value: `EGP ${allOrders?.filter(o => ['confirmed', 'shipped', 'delivered'].includes(o.status)).reduce((s, o) => s + Number(o.total), 0).toFixed(2)}` },
              { label: 'Delivered Revenue', value: `EGP ${deliveredRevenue.toFixed(2)}` },
              { label: 'Average Order Value', value: `EGP ${totalOrders ? (totalRevenue / totalOrders).toFixed(2) : '0.00'}` },
            ].map((item) => (
              <div key={item.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', background: 'rgba(255,255,255,0.12)',
                borderRadius: '10px',
              }}>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>{item.label}</span>
                <span style={{ fontSize: '16px', fontWeight: '800', color: '#fff' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Recent Orders</h2>
          <a href="/admin/orders" style={{ fontSize: '13px', color: '#6c63ff', textDecoration: 'none', fontWeight: '600' }}>
            View all →
          </a>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              {['Order ID', 'Phone', 'Address', 'Total', 'Status', 'Date'].map((h) => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', color: '#9ca3af', fontWeight: '600', borderBottom: '1px solid #f3f4f6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentOrders?.map((order) => (
              <tr key={order.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '13px', color: '#6b7280' }}>
                  {order.id.slice(0, 8)}...
                </td>
                <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>{order.phone}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280', maxWidth: '160px' }}>
                  <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {order.address}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontWeight: '700', color: '#1a1a2e' }}>EGP {order.total}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '600',
                    background: statusColor[order.status] + '20',
                    color: statusColor[order.status],
                  }}>
                    {order.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#9ca3af' }}>
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
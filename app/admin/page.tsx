import { supabase } from '@/lib/supabase';

export default async function AdminPage() {
  const [
    { count: totalOrders },
    { count: totalProducts },
    { count: totalCustomers },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('orders')
      .select('id, total, status, phone, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const { data: revenueData } = await supabase
    .from('orders')
    .select('total')
    .eq('status', 'delivered');

  const totalRevenue = revenueData?.reduce((sum, o) => sum + Number(o.total), 0) ?? 0;

  const statusColor: Record<string, string> = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    shipped: '#8b5cf6',
    delivered: '#16a34a',
    cancelled: '#ef4444',
  };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Dashboard Overview</h1>

      {/* Stat cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        marginBottom: '2.5rem',
      }}>
        {[
          { label: 'Total Orders', value: totalOrders ?? 0, icon: '📦' },
          { label: 'Total Products', value: totalProducts ?? 0, icon: '🛍️' },
          { label: 'Total Customers', value: totalCustomers ?? 0, icon: '👥' },
          { label: 'Revenue (Delivered)', value: `LE ${totalRevenue.toFixed(2)}`, icon: '💰' },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '1.25rem',
          }}>
            <p style={{ margin: '0 0 8px', fontSize: '24px' }}>{stat.icon}</p>
            <p style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 'bold' }}>
              {stat.value}
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ margin: 0, fontSize: '16px' }}>Recent Orders</h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Order ID', 'Phone', 'Total', 'Status', 'Date'].map((h) => (
                <th key={h} style={{
                  padding: '10px 16px',
                  textAlign: 'left',
                  fontSize: '13px',
                  color: '#6b7280',
                  fontWeight: '500',
                  borderBottom: '1px solid #e5e7eb',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentOrders?.map((order) => (
              <tr key={order.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '13px' }}>
                  {order.id.slice(0, 8)}...
                </td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{order.phone}</td>
                <td style={{ padding: '12px 16px', fontWeight: '500' }}>${order.total}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: '500',
                    background: statusColor[order.status] + '20',
                    color: statusColor[order.status],
                  }}>
                    {order.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>
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
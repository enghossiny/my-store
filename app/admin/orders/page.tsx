import { supabase } from '@/lib/supabase';
import OrderStatusUpdater from './OrderStatusUpdater';

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const filters = await searchParams;

  let query = supabase
    .from('orders')
    .select('*, order_items(quantity, price, products(name_en, name_ar))')
    .order('created_at', { ascending: false });

  if (filters.status) query = query.eq('status', filters.status);

  const { data: orders } = await query;

  const statusColor: Record<string, string> = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    shipped: '#8b5cf6',
    delivered: '#16a34a',
    cancelled: '#ef4444',
  };

  const counts = {
    all: orders?.length ?? 0,
    pending: orders?.filter(o => o.status === 'pending').length ?? 0,
    confirmed: orders?.filter(o => o.status === 'confirmed').length ?? 0,
    shipped: orders?.filter(o => o.status === 'shipped').length ?? 0,
    delivered: orders?.filter(o => o.status === 'delivered').length ?? 0,
    cancelled: orders?.filter(o => o.status === 'cancelled').length ?? 0,
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: '800' }}>Orders</h1>
        <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>{counts.all} total orders</p>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { key: '', label: 'All', count: counts.all },
          { key: 'pending', label: 'Pending', count: counts.pending },
          { key: 'confirmed', label: 'Confirmed', count: counts.confirmed },
          { key: 'shipped', label: 'Shipped', count: counts.shipped },
          { key: 'delivered', label: 'Delivered', count: counts.delivered },
          { key: 'cancelled', label: 'Cancelled', count: counts.cancelled },
        ].map((tab) => (
          <a key={tab.key} href={tab.key ? `/admin/orders?status=${tab.key}` : '/admin/orders'} style={{
            padding: '8px 16px',
            borderRadius: '999px',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: filters.status === tab.key || (!filters.status && !tab.key)
              ? 'linear-gradient(135deg, #6c63ff, #e91e8c)'
              : '#fff',
            color: filters.status === tab.key || (!filters.status && !tab.key) ? '#fff' : '#6b7280',
            border: '1px solid #e5e7eb',
            boxShadow: filters.status === tab.key || (!filters.status && !tab.key)
              ? '0 4px 12px rgba(108,99,255,0.3)' : 'none',
          }}>
            {tab.label}
            <span style={{
              background: filters.status === tab.key || (!filters.status && !tab.key)
                ? 'rgba(255,255,255,0.3)' : '#f3f4f6',
              padding: '1px 7px',
              borderRadius: '999px',
              fontSize: '11px',
            }}>
              {tab.count}
            </span>
          </a>
        ))}
      </div>

      {/* Orders list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {orders?.map((order) => (
          <div key={order.id} style={{
            background: '#fff', borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            border: '1px solid #f3f4f6', overflow: 'hidden',
          }}>
            {/* Order header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto',
              gap: '1rem', padding: '1.25rem 1.5rem',
              background: '#fafafa', borderBottom: '1px solid #f3f4f6',
              alignItems: 'center',
            }}>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Order ID
                </p>
                <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '13px', fontWeight: '600' }}>
                  {order.id.slice(0, 12)}...
                </p>
              </div>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Customer
                </p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>{order.phone}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Total
                </p>
                <p style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#6c63ff' }}>
                  ${order.total}
                </p>
              </div>
              <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
            </div>

            {/* Order body */}
            <div style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>
                    Delivery Address
                  </p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#374151' }}>{order.address}</p>
                </div>
                {order.notes && (
                  <div>
                    <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>
                      Notes
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', color: '#374151' }}>{order.notes}</p>
                  </div>
                )}
              </div>

              {/* Payment info */}
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{
                  padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '700',
                  background: order.payment_method === 'cod' ? '#f0fdf4' : order.payment_method === 'instapay' ? '#eff6ff' : '#fdf4ff',
                  color: order.payment_method === 'cod' ? '#16a34a' : order.payment_method === 'instapay' ? '#3b82f6' : '#9333ea',
                }}>
                  {order.payment_method === 'cod' ? '💵 Cash on Delivery'
                    : order.payment_method === 'instapay' ? `📲 InstaPay`
                    : '📱 Mobile Wallet'}
                </span>
                {order.payment_reference && (
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>
                    Ref: <strong>{order.payment_reference}</strong>
                  </span>
                )}
                {order.region_name && (
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>
                    🚚 {order.region_name} — ${order.delivery_fee}
                  </span>
                )}
                {order.promo_code && (
                  <span style={{ fontSize: '13px', color: '#16a34a', fontWeight: '600' }}>
                    🎟️ {order.promo_code} — saved ${order.discount}
                  </span>
                )}
              </div>


              {/* Items */}
              <div>
                <p style={{ margin: '0 0 8px', fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>
                  Items
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {order.order_items?.map((item: any, i: number) => (
                    <div key={i} style={{
                      padding: '6px 14px', background: '#f8f7ff',
                      borderRadius: '999px', fontSize: '13px', fontWeight: '500',
                      border: '1px solid #e5e7eb', color: '#374151',
                    }}>
                      {item.products?.name_en} ×{item.quantity}
                      <span style={{ color: '#6c63ff', marginLeft: '6px', fontWeight: '700' }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
                {order.promo_code && (
                  <span style={{ fontSize: '13px', color: '#16a34a', fontWeight: '600' }}>
                    🎟️ {order.promo_code} — saved ${order.discount}
                  </span>
                )}
                <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: 'auto' }}>
                  {new Date(order.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}

        {orders?.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '16px' }}>
            <p style={{ fontSize: '48px', margin: '0 0 1rem' }}>📭</p>
            <p style={{ color: '#9ca3af', fontSize: '16px' }}>No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}
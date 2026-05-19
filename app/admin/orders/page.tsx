import { supabase } from '@/lib/supabase';
import OrderStatusUpdater from './OrderStatusUpdater';

export default async function AdminOrdersPage() {
  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(quantity, price, products(name_en))')
    .order('created_at', { ascending: false });

  const statusColor: Record<string, string> = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    shipped: '#8b5cf6',
    delivered: '#16a34a',
    cancelled: '#ef4444',
  };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Orders</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {orders?.map((order) => (
          <div key={order.id} style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            {/* Order header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
              gap: '1rem',
              padding: '1rem 1.5rem',
              background: '#f9fafb',
              borderBottom: '1px solid #e5e7eb',
              alignItems: 'center',
            }}>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#6b7280' }}>Order ID</p>
                <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '13px' }}>
                  {order.id.slice(0, 8)}...
                </p>
              </div>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#6b7280' }}>Phone</p>
                <p style={{ margin: 0, fontSize: '14px' }}>{order.phone}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#6b7280' }}>Total</p>
                <p style={{ margin: 0, fontWeight: 'bold' }}>${order.total}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#6b7280' }}>Status</p>
                <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
              </div>
            </div>

            {/* Order items */}
            <div style={{ padding: '1rem 1.5rem' }}>
              <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#6b7280' }}>
                Address: {order.address}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {order.order_items?.map((item: any, i: number) => (
                  <span key={i} style={{
                    padding: '4px 12px',
                    background: '#f3f4f6',
                    borderRadius: '999px',
                    fontSize: '13px',
                  }}>
                    {item.products?.name_en} x{item.quantity}
                  </span>
                ))}
              </div>
              {order.notes && (
                <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#6b7280' }}>
                  Note: {order.notes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
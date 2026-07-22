import { supabaseAdmin } from '@/lib/supabaseAdmin';

const supabase = supabaseAdmin;
import OrderStatusUpdater from './OrderStatusUpdater';
import { formatPrice } from '@/lib/currency';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const filters = await searchParams;

  // Get ALL orders for correct counts — separate from filtered results
  const { data: allOrders } = await supabase
    .from('orders')
    .select('id, status');

  const typedAllOrders = (allOrders ?? []) as Array<{ id: string; status: string }>;

  // Count by status from ALL orders
  const counts = {
    all: typedAllOrders.length,
    pending: typedAllOrders.filter((o) => o.status === 'pending').length,
    confirmed: typedAllOrders.filter((o) => o.status === 'confirmed').length,
    shipped: typedAllOrders.filter((o) => o.status === 'shipped').length,
    delivered: typedAllOrders.filter((o) => o.status === 'delivered').length,
    cancelled: typedAllOrders.filter((o) => o.status === 'cancelled').length,
  };

  // Now fetch filtered orders with full data
  let query = supabase
    .from('orders')
    .select('*, order_items(quantity, price, products(name_en, name_ar))')
    .order('created_at', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { data: orders } = await query;
  const typedOrders = (orders ?? []) as Array<{
    id: string;
    status: string;
    phone: string;
    address: string;
    notes?: string | null;
    total: number;
    payment_method?: string;
    payment_reference?: string | null;
    region_name?: string | null;
    promo_code?: string | null;
    discount?: number | null;
    delivery_fee: number;
    order_items?: Array<{
      quantity: number;
      price: number;
      products?: { name_en?: string | null; name_ar?: string | null } | null;
    }>;
    created_at: string;
  }>;

  const statusColor: Record<string, string> = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    shipped: '#8b5cf6',
    delivered: '#16a34a',
    cancelled: '#ef4444',
  };

  const tabs = [
    { key: '', label: 'All', count: counts.all },
    { key: 'pending', label: 'Pending', count: counts.pending },
    { key: 'confirmed', label: 'Confirmed', count: counts.confirmed },
    { key: 'shipped', label: 'Shipped', count: counts.shipped },
    { key: 'delivered', label: 'Delivered', count: counts.delivered },
    { key: 'cancelled', label: 'Cancelled', count: counts.cancelled },
  ];

  const currentStatus = filters.status ?? '';

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: '800' }}>Orders</h1>
        <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
          {counts.all} total orders
          {filters.status && (
            <span style={{ color: '#6c63ff', fontWeight: '600' }}>
              {' '}— showing {typedOrders.length} {filters.status}
            </span>
          )}
        </p>
      </div>

      {/* Status filter tabs */}
      <div style={{
        display: 'flex', gap: '8px', marginBottom: '1.5rem',
        flexWrap: 'wrap',
      }}>
        {tabs.map((tab) => {
          const isActive = currentStatus === tab.key;
          return (
            <a
              key={tab.key}
              href={tab.key ? `/admin/orders?status=${tab.key}` : '/admin/orders'}
              style={{
                padding: '8px 16px', borderRadius: '999px',
                textDecoration: 'none', fontSize: '13px', fontWeight: '600',
                display: 'flex', alignItems: 'center', gap: '6px',
                background: isActive
                  ? 'linear-gradient(135deg, #6c63ff, #e91e8c)'
                  : '#fff',
                color: isActive ? '#fff' : '#6b7280',
                border: isActive ? 'none' : '1px solid #e5e7eb',
                boxShadow: isActive ? '0 4px 12px rgba(108,99,255,0.3)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
              <span style={{
                padding: '2px 8px', borderRadius: '999px',
                fontSize: '11px', fontWeight: '800',
                background: isActive ? 'rgba(255,255,255,0.25)' : '#f3f4f6',
                color: isActive ? '#fff' : '#374151',
                minWidth: '20px', textAlign: 'center',
              }}>
                {tab.count}
              </span>
            </a>
          );
        })}
      </div>

      {/* Orders list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {typedOrders.length > 0 ? typedOrders.map((order) => (
          <div key={order.id} style={{
            background: '#fff', borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            border: '1px solid #f3f4f6', overflow: 'hidden',
          }}>
            {/* Order header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr auto',
              gap: '1rem', padding: '1.25rem 1.5rem',
              background: '#fafafa',
              borderBottom: '1px solid #f3f4f6',
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
                  Phone
                </p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
                  {order.phone}
                </p>
              </div>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Total
                </p>
                <p style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#6c63ff' }}>
                  {formatPrice(order.total)}
                </p>
              </div>
              <OrderStatusUpdater
                orderId={order.id}
                currentStatus={order.status}
              />
            </div>

            {/* Order body */}
            <div style={{ padding: '1.25rem 1.5rem' }}>
              {/* Address + Notes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>
                    Delivery Address
                  </p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#374151' }}>
                    {order.address}
                  </p>
                </div>
                {order.notes && (
                  <div>
                    <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>
                      Notes
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', color: '#374151' }}>
                      {order.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Items */}
              <div style={{ marginBottom: '12px' }}>
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
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer row */}
              <div style={{
                display: 'flex', gap: '10px', flexWrap: 'wrap',
                alignItems: 'center', paddingTop: '12px',
                borderTop: '1px solid #f3f4f6',
              }}>
                {/* Payment method */}
                <span style={{
                  padding: '4px 12px', borderRadius: '999px',
                  fontSize: '12px', fontWeight: '700',
                  background: order.payment_method === 'cod' ? '#f0fdf4'
                    : order.payment_method === 'instapay' ? '#eff6ff'
                    : '#fdf4ff',
                  color: order.payment_method === 'cod' ? '#16a34a'
                    : order.payment_method === 'instapay' ? '#3b82f6'
                    : '#9333ea',
                }}>
                  {order.payment_method === 'cod' ? '💵 Cash on Delivery'
                    : order.payment_method === 'instapay' ? '📲 InstaPay'
                    : '📱 Mobile Wallet'}
                </span>

                {/* Payment reference */}
                {order.payment_reference && (
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>
                    Ref: <strong>{order.payment_reference}</strong>
                  </span>
                )}

                {/* Region */}
                {order.region_name && (
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>
                    🚚 {order.region_name}
                    {order.delivery_fee > 0 && ` — ${formatPrice(order.delivery_fee)}`}
                  </span>
                )}

                {/* Promo */}
                {order.promo_code && (
                  <span style={{ fontSize: '13px', color: '#16a34a', fontWeight: '600' }}>
                    🎟️ {order.promo_code} — saved {formatPrice(order.discount ?? 0)}
                  </span>
                )}

                {/* Date */}
                <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: 'auto' }}>
                  {new Date(order.created_at).toLocaleString('en-US', {
                    year: 'numeric', month: 'short',
                    day: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>
        )) : (
          <div style={{
            textAlign: 'center', padding: '4rem',
            background: '#fff', borderRadius: '16px',
            border: '2px dashed #e5e7eb',
          }}>
            <p style={{ fontSize: '48px', margin: '0 0 1rem' }}>📭</p>
            <p style={{ color: '#9ca3af', fontSize: '16px', margin: 0 }}>
              No {filters.status ?? ''} orders found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
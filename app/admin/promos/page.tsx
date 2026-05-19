import { supabase } from '@/lib/supabase';
import PromoForm from './PromoForm';
import DeletePromoButton from './DeletePromoButton';
import TogglePromoButton from './TogglePromoButton';

export default async function AdminPromosPage() {
  const { data: promos } = await supabase
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Promo Codes</h1>

      {/* Add promo form */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
      }}>
        <h2 style={{ margin: '0 0 1.5rem', fontSize: '16px' }}>Create New Promo Code</h2>
        <PromoForm />
      </div>

      {/* Promos table */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Code', 'Type', 'Value', 'Min Order', 'Uses', 'Status', 'Actions'].map((h) => (
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
            {promos?.map((promo) => (
              <tr key={promo.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px 16px', fontWeight: '700', letterSpacing: '1px' }}>
                  {promo.code}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>
                  {promo.discount_type}
                </td>
                <td style={{ padding: '12px 16px', fontWeight: '600', color: '#6c63ff' }}>
                  {promo.discount_type === 'percentage'
                    ? `${promo.discount_value}%`
                    : `$${promo.discount_value}`}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                  ${promo.min_order_amount}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                  {promo.used_count}
                  {promo.max_uses ? ` / ${promo.max_uses}` : ' / ∞'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <TogglePromoButton
                    promoId={promo.id}
                    active={promo.active}
                  />
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <DeletePromoButton promoId={promo.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
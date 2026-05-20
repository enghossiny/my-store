import { supabase } from '@/lib/supabase';
import PromoForm from './PromoForm';
import DeletePromoButton from './DeletePromoButton';
import TogglePromoButton from './TogglePromoButton';

export default async function AdminPromosPage() {
  const { data: promos } = await supabase
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false });

  const activeCount = promos?.filter(p => p.active).length ?? 0;
  const totalUses = promos?.reduce((s, p) => s + p.used_count, 0) ?? 0;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: '800' }}>Promo Codes</h1>
        <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
          {activeCount} active codes — {totalUses} total uses
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Codes', value: promos?.length ?? 0, icon: '🎟️', color: '#6c63ff' },
          { label: 'Active Codes', value: activeCount, icon: '✅', color: '#16a34a' },
          { label: 'Total Uses', value: totalUses, icon: '🔢', color: '#e91e8c' },
        ].map((s) => (
          <div key={s.label} style={{
            background: '#fff', borderRadius: '16px', padding: '1.25rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
            display: 'flex', alignItems: 'center', gap: '1rem',
          }}>
            <div style={{
              width: '48px', height: '48px', background: s.color + '20',
              borderRadius: '12px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '24px', flexShrink: 0,
            }}>{s.icon}</div>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '24px', fontWeight: '800', color: '#1a1a2e' }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af', fontWeight: '500' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Create form */}
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '1.5rem',
        marginBottom: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid #f3f4f6',
      }}>
        <h2 style={{ margin: '0 0 1.5rem', fontSize: '18px', fontWeight: '700' }}>
          ➕ Create New Promo Code
        </h2>
        <PromoForm />
      </div>

      {/* Promos list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {promos?.map((promo) => (
          <div key={promo.id} style={{
            background: '#fff', borderRadius: '14px', padding: '1.25rem 1.5rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
            display: 'flex', alignItems: 'center', gap: '1.5rem',
            opacity: promo.active ? 1 : 0.6,
          }}>
            {/* Code */}
            <div style={{
              background: 'linear-gradient(135deg, #6c63ff20, #e91e8c20)',
              border: '1px dashed #c4b5fd',
              borderRadius: '10px', padding: '8px 16px',
              fontFamily: 'monospace', fontSize: '16px', fontWeight: '800',
              color: '#6c63ff', letterSpacing: '2px', flexShrink: 0,
            }}>
              {promo.code}
            </div>

            {/* Details */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '3px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: '700',
                  background: promo.discount_type === 'percentage' ? '#f0fdf4' : '#eff6ff',
                  color: promo.discount_type === 'percentage' ? '#16a34a' : '#3b82f6',
                }}>
                  {promo.discount_type === 'percentage' ? `${promo.discount_value}% off` : `$${promo.discount_value} off`}
                </span>
                {promo.min_order_amount > 0 && (
                  <span style={{ padding: '3px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: '600', background: '#f3f4f6', color: '#6b7280' }}>
                    Min: ${promo.min_order_amount}
                  </span>
                )}
                <span style={{ padding: '3px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: '600', background: '#f3f4f6', color: '#6b7280' }}>
                  {promo.used_count}{promo.max_uses ? `/${promo.max_uses}` : ''} uses
                </span>
                {promo.expires_at && (
                  <span style={{ padding: '3px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: '600', background: '#fef2f2', color: '#ef4444' }}>
                    Expires: {new Date(promo.expires_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <TogglePromoButton promoId={promo.id} active={promo.active} />
              <DeletePromoButton promoId={promo.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
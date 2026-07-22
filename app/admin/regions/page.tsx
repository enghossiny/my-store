import { supabaseAdmin } from '@/lib/supabaseAdmin';

const supabase = supabaseAdmin;
import RegionForm from './RegionForm';
import DeleteRegionButton from './DeleteRegionButton';
import ToggleRegionButton from './ToggleRegionButton';
import EditRegionButton from './EditRegionButton';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function AdminRegionsPage() {
  const { data: regions } = await supabase
    .from('delivery_regions')
    .select('*')
    .order('delivery_fee', { ascending: true });

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: '800' }}>
          Delivery Regions
        </h1>
        <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
          {regions?.length ?? 0} regions — manage delivery fees
        </p>
      </div>

      {/* Add region form */}
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '1.5rem',
        marginBottom: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid #f3f4f6',
      }}>
        <h2 style={{ margin: '0 0 1.5rem', fontSize: '18px', fontWeight: '700' }}>
          ➕ Add New Region
        </h2>
        <RegionForm />
      </div>

      {/* Regions list */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid #f3f4f6', overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              {['Region (EN)', 'Region (AR)', 'Delivery Fee', 'Status', 'Actions'].map((h) => (
                <th key={h} style={{
                  padding: '12px 16px', textAlign: 'left',
                  fontSize: '12px', color: '#9ca3af', fontWeight: '600',
                  borderBottom: '1px solid #f3f4f6',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {regions?.map((region) => (
              <tr key={region.id} style={{
                borderBottom: '1px solid #f9f9f9',
                opacity: region.active ? 1 : 0.5,
              }}>
                <td style={{ padding: '14px 16px', fontWeight: '600', fontSize: '15px' }}>
                  {region.name_en}
                </td>
                <td style={{ padding: '14px 16px', fontSize: '15px', direction: 'rtl', textAlign: 'left' }}>
                  {region.name_ar}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    fontSize: '16px', fontWeight: '800',
                    background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>
                    {formatPrice(region.delivery_fee)}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <ToggleRegionButton regionId={region.id} active={region.active} />
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <EditRegionButton region={region} />
                    <DeleteRegionButton regionId={region.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
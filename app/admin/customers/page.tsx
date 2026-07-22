import { supabaseAdmin } from '@/lib/supabaseAdmin';

const supabase = supabaseAdmin;

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const { data: customers } = await supabase
    .from('customers')
    .select('*, orders(id)')
    .order('created_at', { ascending: false });

  const typedCustomers = (customers ?? []) as Array<{
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    created_at: string;
    orders?: Array<{ id: string }>;
  }>;

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Customers</h1>

      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Name', 'Email', 'Phone', 'Address', 'Orders', 'Joined'].map((h) => (
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
            {typedCustomers.map((customer) => (
              <tr key={customer.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px 16px', fontWeight: '500' }}>{customer.name}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6b7280' }}>
                  {customer.email ?? '—'}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{customer.phone ?? '—'}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280', maxWidth: '200px' }}>
                  <span style={{
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {customer.address ?? '—'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '3px 10px',
                    background: '#f3f4f6',
                    borderRadius: '999px',
                    fontSize: '13px',
                    fontWeight: '500',
                  }}>
                    {customer.orders?.length ?? 0}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>
                  {new Date(customer.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {typedCustomers.length === 0 && (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
            No customers yet
          </p>
        )}
      </div>
    </div>
  );
}
export default async function DebugPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Environment Check</h1>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr style={{ background: '#f3f4f6' }}>
            <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid #e5e7eb' }}>Variable</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid #e5e7eb' }}>Status</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid #e5e7eb' }}>Preview</th>
          </tr>
        </thead>
        <tbody>
          {[
            { key: 'NEXT_PUBLIC_SUPABASE_URL', val: process.env.NEXT_PUBLIC_SUPABASE_URL },
            { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', val: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
            { key: 'ADMIN_USERNAME', val: process.env.ADMIN_USERNAME },
            { key: 'ADMIN_PASSWORD', val: process.env.ADMIN_PASSWORD },
            { key: 'NEXT_PUBLIC_SITE_URL', val: process.env.NEXT_PUBLIC_SITE_URL },
            { key: 'TELEGRAM_BOT_TOKEN', val: process.env.TELEGRAM_BOT_TOKEN },
            { key: 'TELEGRAM_CHAT_ID', val: process.env.TELEGRAM_CHAT_ID },
            { key: 'NEXT_PUBLIC_ADMIN_EMAILS', val: process.env.NEXT_PUBLIC_ADMIN_EMAILS },
            { key: 'NEXT_PUBLIC_INSTAPAY_ACCOUNT', val: process.env.NEXT_PUBLIC_INSTAPAY_ACCOUNT },
            { key: 'NEXT_PUBLIC_WALLET_NUMBER', val: process.env.NEXT_PUBLIC_WALLET_NUMBER },
          ].map((item) => (
            <tr key={item.key}>
              <td style={{ padding: '8px 12px', border: '1px solid #e5e7eb', fontWeight: 'bold' }}>
                {item.key}
              </td>
              <td style={{ padding: '8px 12px', border: '1px solid #e5e7eb' }}>
                <span style={{
                  padding: '2px 10px', borderRadius: '999px', fontSize: '12px',
                  background: item.val ? '#f0fdf4' : '#fef2f2',
                  color: item.val ? '#16a34a' : '#ef4444',
                  fontWeight: '700',
                }}>
                  {item.val ? '✓ Set' : '✗ Missing'}
                </span>
              </td>
              <td style={{ padding: '8px 12px', border: '1px solid #e5e7eb', color: '#6b7280', fontSize: '13px' }}>
                {item.val
                  ? item.key.includes('KEY') || item.key.includes('PASSWORD') || item.key.includes('TOKEN')
                    ? item.val.slice(0, 8) + '••••••••'
                    : item.val.slice(0, 40)
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
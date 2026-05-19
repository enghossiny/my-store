import { supabase } from '@/lib/supabase';

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  const { data, error } = await supabase
    .from('products')
    .select('*');

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Debug Test</h1>
      <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
      <p><strong>Error:</strong> {error ? JSON.stringify(error) : 'none'}</p>
      <p><strong>Products count:</strong> {data?.length ?? 0}</p>
      <pre style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '8px', fontSize: '12px' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  );
}
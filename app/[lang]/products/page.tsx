import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const isAr = lang === 'ar';

  const { data: categories } = await supabase
    .from('categories')
    .select('*');

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>
        {isAr ? 'جميع المنتجات' : 'All Products'}
      </h1>

      {/* Categories filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <span style={{
          padding: '6px 16px',
          borderRadius: '999px',
          background: '#111',
          color: '#fff',
          fontSize: '14px',
          cursor: 'pointer',
        }}>
          {isAr ? 'الكل' : 'All'}
        </span>
        {categories?.map((cat) => (
          <span key={cat.id} style={{
            padding: '6px 16px',
            borderRadius: '999px',
            background: '#f3f4f6',
            fontSize: '14px',
            cursor: 'pointer',
          }}>
            {isAr ? cat.name_ar : cat.name_en}
          </span>
        ))}
      </div>

      {/* Products grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '1.5rem',
      }}>
        {products?.map((product) => (
          <ProductCard key={product.id} product={product} lang={lang} />
        ))}
      </div>

      {products?.length === 0 && (
        <p style={{ color: '#6b7280' }}>
          {isAr ? 'لا توجد منتجات' : 'No products found'}
        </p>
      )}
    </main>
  );
}
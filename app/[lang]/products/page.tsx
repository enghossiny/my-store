import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import { Suspense } from 'react';
import ProductSearch from '@/components/ProductSearch';

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{
    search?: string; category?: string;
    sort?: string; min?: string; max?: string;
  }>;
};

export default async function ProductsPage({ params, searchParams }: Props) {
  const { lang } = await params;
  const filters = await searchParams;
  const isAr = lang === 'ar';

  const { data: categories } = await supabase.from('categories').select('*');

  let query = supabase.from('products').select('*');
  if (filters.search) query = query.or(`name_en.ilike.%${filters.search}%,name_ar.ilike.%${filters.search}%`);
  if (filters.category) query = query.eq('category_id', filters.category);
  if (filters.min) query = query.gte('price', parseFloat(filters.min));
  if (filters.max) query = query.lte('price', parseFloat(filters.max));
  switch (filters.sort) {
    case 'price_asc': query = query.order('price', { ascending: true }); break;
    case 'price_desc': query = query.order('price', { ascending: false }); break;
    case 'name_asc': query = query.order(isAr ? 'name_ar' : 'name_en', { ascending: true }); break;
    default: query = query.order('created_at', { ascending: false });
  }

  const { data: products } = await query;

  return (
    <>
      <style>{`
        .products-pad { padding: 1.5rem 1rem !important; }
        .products-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 0.75rem !important; }
        @media (min-width: 640px) {
          .products-grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)) !important; gap: 1.25rem !important; }
        }
      `}</style>

      <main className="products-pad" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{
            fontSize: '28px', fontWeight: '800', margin: '0 0 4px',
            background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            {isAr ? '🛍️ جميع المنتجات' : '🛍️ All Products'}
          </h1>
          <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
            {products?.length ?? 0} {isAr ? 'منتج' : 'products'}
          </p>
        </div>

        <Suspense>
          <ProductSearch
            categories={categories ?? []}
            lang={lang}
            totalCount={products?.length ?? 0}
          />
        </Suspense>

        {products && products.length > 0 ? (
          <div className="products-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1.25rem',
          }}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} lang={lang} />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center', padding: '3rem 1rem',
            background: '#fff', borderRadius: '20px',
            border: '2px dashed #e5e7eb',
          }}>
            <p style={{ fontSize: '40px', margin: '0 0 1rem' }}>🔍</p>
            <h3 style={{ margin: '0 0 6px' }}>{isAr ? 'لا توجد منتجات' : 'No products found'}</h3>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
              {isAr ? 'جرب البحث بكلمات مختلفة' : 'Try different keywords'}
            </p>
          </div>
        )}
      </main>
    </>
  );
}
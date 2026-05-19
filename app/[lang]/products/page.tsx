import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import { Suspense } from 'react';
import ProductSearch from '@/components/ProductSearch';

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{
    search?: string;
    category?: string;
    sort?: string;
    min?: string;
    max?: string;
  }>;
};

export default async function ProductsPage({ params, searchParams }: Props) {
  const { lang } = await params;
  const filters = await searchParams;
  const isAr = lang === 'ar';

  const { data: categories } = await supabase
    .from('categories')
    .select('*');

  // Build query
  let query = supabase
    .from('products')
    .select('*');

  // Search filter
  if (filters.search) {
    query = query.or(
      `name_en.ilike.%${filters.search}%,name_ar.ilike.%${filters.search}%,description_en.ilike.%${filters.search}%`
    );
  }

  // Category filter
  if (filters.category) {
    query = query.eq('category_id', filters.category);
  }

  // Price filters
  if (filters.min) {
    query = query.gte('price', parseFloat(filters.min));
  }
  if (filters.max) {
    query = query.lte('price', parseFloat(filters.max));
  }

  // Sort
  switch (filters.sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('price', { ascending: false });
      break;
    case 'name_asc':
      query = query.order(isAr ? 'name_ar' : 'name_en', { ascending: true });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  const { data: products } = await query;

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Page header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '800',
          margin: '0 0 4px',
          background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          {isAr ? '🛍️ جميع المنتجات' : '🛍️ All Products'}
        </h1>
        <p style={{ margin: 0, color: '#9ca3af', fontSize: '15px' }}>
          {isAr
            ? 'تصفح مئات المنتجات بأفضل الأسعار'
            : 'Browse hundreds of products at the best prices'}
        </p>
      </div>

      {/* Search and filters */}
      <Suspense>
        <ProductSearch
          categories={categories ?? []}
          lang={lang}
          totalCount={products?.length ?? 0}
        />
      </Suspense>

      {/* Products grid */}
      {products && products.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1.5rem',
        }}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} lang={lang} />
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: '#fff',
          borderRadius: '20px',
          border: '2px dashed #e5e7eb',
        }}>
          <p style={{ fontSize: '48px', margin: '0 0 1rem' }}>🔍</p>
          <h3 style={{ margin: '0 0 8px', color: '#1a1a2e' }}>
            {isAr ? 'لا توجد منتجات' : 'No products found'}
          </h3>
          <p style={{ margin: 0, color: '#9ca3af' }}>
            {isAr ? 'جرب البحث بكلمات مختلفة' : 'Try searching with different keywords'}
          </p>
        </div>
      )}
    </main>
  );
}
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const isAr = lang === 'ar';

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .limit(6);

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Hero */}
      <div style={{
        background: '#111',
        color: '#fff',
        borderRadius: '16px',
        padding: '3rem',
        marginBottom: '3rem',
        textAlign: isAr ? 'right' : 'left',
      }}>
        <h1 style={{ fontSize: '36px', margin: '0 0 1rem' }}>
          {isAr ? 'مرحباً بك في متجرنا' : 'Welcome to our store'}
        </h1>
        <p style={{ color: '#9ca3af', margin: '0 0 1.5rem' }}>
          {isAr ? 'تصفح أحدث المنتجات' : 'Browse our latest products'}
        </p>
        <Link href={`/${lang}/products`} style={{
          background: '#fff',
          color: '#111',
          padding: '10px 24px',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 'bold',
        }}>
          {isAr ? 'تسوق الآن' : 'Shop Now'}
        </Link>
      </div>

      {/* Featured products */}
      <h2 style={{ marginBottom: '1.5rem' }}>
        {isAr ? 'منتجات مميزة' : 'Featured Products'}
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        {products?.map((product) => (
          <ProductCard key={product.id} product={product} lang={lang} />
        ))}
      </div>

      <Link href={`/${lang}/products`} style={{
        display: 'inline-block',
        padding: '10px 24px',
        border: '1px solid #111',
        borderRadius: '8px',
        textDecoration: 'none',
        color: '#111',
      }}>
        {isAr ? 'عرض جميع المنتجات' : 'View all products'}
      </Link>

    </main>
  );
}
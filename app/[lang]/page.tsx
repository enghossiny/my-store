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
    .limit(8);

  const { data: categories } = await supabase
    .from('categories')
    .select('*');

  const categoryIcons: Record<string, string> = {
    Electronics: '💻',
    Clothing: '👕',
    'Home & Kitchen': '🏠',
  };

  return (
    <main style={{ minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #6c63ff 0%, #e91e8c 100%)',
        padding: '5rem 2rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '300px', height: '300px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-60px',
          width: '200px', height: '200px',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '50%',
        }} />
        <p style={{
          color: '#ffdd00',
          fontWeight: '700',
          fontSize: '14px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          margin: '0 0 1rem',
        }}>
          {isAr ? '🎉 متجر رقم 1' : '🎉 The #1 Store'}
        </p>
        <h1 style={{
          color: '#fff',
          fontSize: '52px',
          fontWeight: '800',
          margin: '0 0 1rem',
          lineHeight: '1.1',
        }}>
          {isAr ? 'تسوق بأفضل\nالأسعار' : 'Shop the Best\nDeals Today'}
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.8)',
          fontSize: '18px',
          margin: '0 0 2.5rem',
        }}>
          {isAr
            ? 'آلاف المنتجات بأسعار لا تقاوم — الدفع عند الاستلام'
            : 'Thousands of products at unbeatable prices — Cash on Delivery'}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href={`/${lang}/products`} style={{
            background: '#ffdd00',
            color: '#1a1a2e',
            padding: '14px 36px',
            borderRadius: '999px',
            textDecoration: 'none',
            fontWeight: '800',
            fontSize: '16px',
            boxShadow: '0 4px 20px rgba(255,221,0,0.4)',
          }}>
            {isAr ? 'تسوق الآن ←' : 'Shop Now →'}
          </Link>
          <Link href={`/${lang}/account`} style={{
            background: 'rgba(255,255,255,0.15)',
            color: '#fff',
            padding: '14px 36px',
            borderRadius: '999px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '16px',
            border: '2px solid rgba(255,255,255,0.4)',
          }}>
            {isAr ? 'إنشاء حساب' : 'Create Account'}
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        background: '#1a1a2e',
        padding: '1.2rem 2rem',
        display: 'flex',
        justifyContent: 'center',
        gap: '3rem',
        flexWrap: 'wrap',
      }}>
        {[
          { icon: '📦', label: isAr ? 'شحن سريع' : 'Fast Delivery' },
          { icon: '💵', label: isAr ? 'الدفع عند الاستلام' : 'Cash on Delivery' },
          { icon: '🔄', label: isAr ? 'إرجاع مجاني' : 'Free Returns' },
          { icon: '🔒', label: isAr ? 'تسوق آمن' : 'Secure Shopping' },
        ].map((item) => (
          <div key={item.label} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '500',
          }}>
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </div>

      <div style={{ padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>

        {/* Categories */}
        <h2 style={{
          fontSize: '28px',
          fontWeight: '800',
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          {isAr ? 'تسوق حسب الفئة' : 'Shop by Category'}
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '1rem',
          marginBottom: '3rem',
        }}>
          {categories?.map((cat, i) => {
            const gradients = [
              'linear-gradient(135deg, #6c63ff, #9c8fff)',
              'linear-gradient(135deg, #e91e8c, #ff6b9d)',
              'linear-gradient(135deg, #00c9a7, #00b493)',
            ];
            return (
              <Link key={cat.id} href={`/${lang}/products`} style={{
                textDecoration: 'none',
                background: gradients[i % gradients.length],
                borderRadius: '16px',
                padding: '1.5rem 1rem',
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s',
              }}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>
                  {categoryIcons[cat.name_en] ?? '🛍️'}
                </div>
                <p style={{
                  margin: 0,
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '14px',
                }}>
                  {isAr ? cat.name_ar : cat.name_en}
                </p>
              </Link>
            );
          })}
        </div>

        {/* Featured products */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '800',
            margin: 0,
            background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {isAr ? '🔥 منتجات مميزة' : '🔥 Featured Products'}
          </h2>
          <Link href={`/${lang}/products`} style={{
            color: '#6c63ff',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '14px',
          }}>
            {isAr ? 'عرض الكل ←' : 'View all →'}
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1.5rem',
        }}>
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} lang={lang} />
          ))}
        </div>
      </div>
    </main>
  );
}
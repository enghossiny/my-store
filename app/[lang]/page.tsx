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
    .from('products').select('*').limit(8);

  const { data: categories } = await supabase
    .from('categories').select('*');

  const categoryIcons: Record<string, string> = {
    Electronics: '💻', Clothing: '👕', 'Home & Kitchen': '🏠',
  };

  return (
    <>
      <style>{`
        .hero { padding: 4rem 1.5rem !important; }
        .hero h1 { font-size: 36px !important; }
        .hero-btns { flex-direction: column !important; align-items: stretch !important; }
        .stats-bar { gap: 1rem !important; padding: 1rem !important; }
        .stats-bar span { font-size: 12px !important; }
        .section-pad { padding: 2rem 1rem !important; }
        .cat-grid { grid-template-columns: repeat(2, 1fr) !important; }
        .prod-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 0.75rem !important; }
        @media (max-width: 480px) {
          .hero h1 { font-size: 28px !important; }
          .prod-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      <main style={{ minHeight: '100vh' }}>
        {/* Hero */}
        <div className="hero" style={{
          background: 'linear-gradient(135deg, #6c63ff 0%, #e91e8c 100%)',
          padding: '5rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '250px', height: '250px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '180px', height: '180px', background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />

          <p style={{ color: '#ffdd00', fontWeight: '700', fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 1rem' }}>
            🎉 {isAr ? 'متجر رقم 1' : 'The #1 Store'}
          </p>
          <h1 className="" style={{
            color: '#fff', fontSize: '48px', fontWeight: '800',
            margin: '0 0 1rem', lineHeight: '1.1',
          }}>
            {isAr ? 'تسوق بأفضل الأسعار' : 'Shop the Best\nDeals Today'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', margin: '0 0 2rem' }}>
            {isAr
              ? 'آلاف المنتجات — الدفع عند الاستلام'
              : 'Thousands of products — Cash on Delivery'}
          </p>
          <div className="hero-btns" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={`/${lang}/products`} style={{
              background: '#ffdd00', color: '#1a1a2e',
              padding: '14px 32px', borderRadius: '999px',
              textDecoration: 'none', fontWeight: '800', fontSize: '15px',
              boxShadow: '0 4px 20px rgba(255,221,0,0.4)',
            }}>
              {isAr ? 'تسوق الآن ←' : 'Shop Now →'}
            </Link>
            <Link href={`/${lang}/account`} style={{
              background: 'rgba(255,255,255,0.15)', color: '#fff',
              padding: '14px 32px', borderRadius: '999px',
              textDecoration: 'none', fontWeight: '600', fontSize: '15px',
              border: '2px solid rgba(255,255,255,0.4)',
            }}>
              {isAr ? 'إنشاء حساب' : 'Create Account'}
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div className="stats-bar" style={{
          background: '#1a1a2e', padding: '1rem 2rem',
          display: 'flex', justifyContent: 'center',
          gap: '2rem', flexWrap: 'wrap',
        }}>
          {[
            { icon: '📦', label: isAr ? 'شحن سريع' : 'Fast Delivery' },
            { icon: '💵', label: isAr ? 'الدفع عند الاستلام' : 'Cash on Delivery' },
            { icon: '🔄', label: isAr ? 'إرجاع مجاني' : 'Free Returns' },
            { icon: '🔒', label: isAr ? 'تسوق آمن' : 'Secure Shopping' },
          ].map((item) => (
            <div key={item.label} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              color: '#fff', fontSize: '13px', fontWeight: '500',
            }}>
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>

        <div className="section-pad" style={{ padding: '2.5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>

          {/* Categories */}
          <h2 style={{
            fontSize: '24px', fontWeight: '800', marginBottom: '1.25rem',
            background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            {isAr ? 'تسوق حسب الفئة' : 'Shop by Category'}
          </h2>

          <div className="cat-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '0.75rem', marginBottom: '2.5rem',
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
                  borderRadius: '14px', padding: '1.25rem 1rem',
                  textAlign: 'center',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '6px' }}>
                    {categoryIcons[cat.name_en] ?? '🛍️'}
                  </div>
                  <p style={{ margin: 0, color: '#fff', fontWeight: '700', fontSize: '13px' }}>
                    {isAr ? cat.name_ar : cat.name_en}
                  </p>
                </Link>
              );
            })}
          </div>

          {/* Featured products */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{
              fontSize: '24px', fontWeight: '800', margin: 0,
              background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {isAr ? '🔥 منتجات مميزة' : '🔥 Featured Products'}
            </h2>
            <Link href={`/${lang}/products`} style={{ color: '#6c63ff', textDecoration: 'none', fontWeight: '600', fontSize: '13px' }}>
              {isAr ? 'عرض الكل ←' : 'View all →'}
            </Link>
          </div>

          <div className="prod-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1.25rem',
          }}>
            {products?.map((product) => (
              <ProductCard key={product.id} product={product} lang={lang} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import AddToCartButton from '@/components/AddToCartButton';
import Link from 'next/link';
import ProductGallery from '@/components/ProductGallery';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const isAr = lang === 'ar';

  const { data: product } = await supabase
    .from('products')
    .select('*, categories(name_ar, name_en)')
    .eq('id', id)
    .single();

  if (!product) notFound();

  const name = isAr ? product.name_ar : product.name_en;
  const description = isAr ? product.description_ar : product.description_en;

  // Fetch related products from same category
  const { data: related } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', product.category_id)
    .neq('id', product.id)
    .limit(4);

  return (
    <>
      <style>{`
        .product-grid { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
        .related-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 0.75rem !important; }
        @media (min-width: 640px) {
          .product-grid { grid-template-columns: 1fr 1fr !important; gap: 2.5rem !important; }
          .related-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 1rem !important; }
        }
      `}</style>

      <main style={{ padding: '1.5rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', fontSize: '13px', color: '#9ca3af', flexWrap: 'wrap' }}>
          <Link href={`/${lang}`} style={{ color: '#9ca3af', textDecoration: 'none' }}>
            {isAr ? 'الرئيسية' : 'Home'}
          </Link>
          <span>›</span>
          <Link href={`/${lang}/products`} style={{ color: '#9ca3af', textDecoration: 'none' }}>
            {isAr ? 'المنتجات' : 'Products'}
          </Link>
          <span>›</span>
          <span style={{ color: '#6c63ff', fontWeight: '600' }}>{name}</span>
        </div>

        {/* Product section */}
        <div className="product-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2.5rem',
          marginBottom: '3rem',
        }}>
          {/* Left — image gallery */}
          <ProductGallery images={product.images ?? []} name={name} />

          {/* Right — product info */}
          <div>
            {/* Category */}
            {product.categories && (
              <span style={{
                display: 'inline-block',
                padding: '4px 14px',
                background: '#f8f7ff',
                color: '#6c63ff',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '12px',
                border: '1px solid #c4b5fd',
              }}>
                {isAr ? product.categories.name_ar : product.categories.name_en}
              </span>
            )}

            {/* Name */}
            <h1 style={{
              fontSize: '28px', fontWeight: '800',
              margin: '0 0 1rem', color: '#1a1a2e',
              lineHeight: '1.2',
            }}>
              {name}
            </h1>

            {/* Price */}
            <div style={{
              display: 'flex', alignItems: 'center',
              gap: '12px', marginBottom: '1.25rem',
            }}>
              <span style={{
                fontSize: '36px', fontWeight: '800',
                background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                EGP {product.price}
              </span>
            </div>

            {/* Stock badge */}
            <div style={{ marginBottom: '1.5rem' }}>
              {product.stock === 0 ? (
                <span style={{
                  padding: '6px 16px', borderRadius: '999px',
                  background: '#fef2f2', color: '#ef4444',
                  fontSize: '13px', fontWeight: '700',
                  border: '1px solid #fecaca',
                }}>
                  ❌ {isAr ? 'نفذ المخزون' : 'Out of Stock'}
                </span>
              ) : product.stock < 10 ? (
                <span style={{
                  padding: '6px 16px', borderRadius: '999px',
                  background: '#fef9c3', color: '#854d0e',
                  fontSize: '13px', fontWeight: '700',
                  border: '1px solid #fde68a',
                }}>
                  ⚠️ {isAr ? `باقي ${product.stock} فقط` : `Only ${product.stock} left`}
                </span>
              ) : (
                <span style={{
                  padding: '6px 16px', borderRadius: '999px',
                  background: '#f0fdf4', color: '#16a34a',
                  fontSize: '13px', fontWeight: '700',
                  border: '1px solid #bbf7d0',
                }}>
                  ✅ {isAr ? 'متوفر في المخزون' : 'In Stock'}
                </span>
              )}
            </div>

            {/* Description */}
            {description && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 8px', color: '#374151' }}>
                  {isAr ? 'الوصف' : 'Description'}
                </h3>
                <p style={{
                  color: '#6b7280', lineHeight: '1.8',
                  margin: 0, fontSize: '15px',
                }}>
                  {description}
                </p>
              </div>
            )}

            {/* Add to cart */}
            <AddToCartButton
              product={{
                id: product.id,
                name_ar: product.name_ar,
                name_en: product.name_en,
                price: product.price,
              }}
              lang={lang}
              disabled={product.stock === 0}
            />

            {/* Delivery info */}
            <div style={{
              marginTop: '1.25rem',
              padding: '14px 16px',
              background: '#f8f7ff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
            }}>
              {[
                { icon: '🚚', text: isAr ? 'توصيل سريع لجميع المحافظات' : 'Fast delivery nationwide' },
                { icon: '💵', text: isAr ? 'الدفع عند الاستلام' : 'Cash on delivery available' },
                { icon: '🔄', text: isAr ? 'إرجاع مجاني خلال 14 يوم' : 'Free returns within 14 days' },
              ].map((item) => (
                <div key={item.text} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '6px 0',
                  borderBottom: '1px solid #f3f4f6',
                  fontSize: '13px', color: '#374151',
                }}>
                  <span style={{ fontSize: '16px' }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related products */}
        {related && related.length > 0 && (
          <div>
            <h2 style={{
              fontSize: '22px', fontWeight: '800', margin: '0 0 1.25rem',
              background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {isAr ? 'منتجات مشابهة' : 'Related Products'}
            </h2>
            <div className="related-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1rem',
            }}>
              {related.map((p) => (
                <Link key={p.id} href={`/${lang}/product/${p.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: '#fff', borderRadius: '16px',
                    overflow: 'hidden', border: '1px solid #f3f4f6',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
                    transition: 'transform 0.2s',
                  }}>
                    <div style={{
                      height: '140px',
                      background: 'linear-gradient(135deg, #f8f7ff, #ede9ff)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '40px',
                    }}>
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt={isAr ? p.name_ar : p.name_en} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : '🛍️'}
                    </div>
                    <div style={{ padding: '10px 12px' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '600', color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {isAr ? p.name_ar : p.name_en}
                      </p>
                      <p style={{
                        margin: 0, fontSize: '15px', fontWeight: '800',
                        background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                      }}>
                        EGP {p.price}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
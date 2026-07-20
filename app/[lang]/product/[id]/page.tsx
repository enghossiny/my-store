import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AddToCartButton from '@/components/AddToCartButton';

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

  return (
    <main style={{ padding: '1.5rem 1rem', maxWidth: '1000px', margin: '0 auto' }}>

      {/* Back link */}
      <Link
        href={`/${lang}/products`}
        style={{ color: '#6b7280', textDecoration: 'none', fontSize: '14px' }}
      >
        ← {isAr ? 'العودة للمنتجات' : 'Back to products'}
      </Link>

      <>
      <style>{`
        .product-grid { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
        @media (min-width: 640px) {
          .product-grid { grid-template-columns: 1fr 1fr !important; gap: 2.5rem !important; }
        }
      `}</style>
      <div className="product-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '3rem',
        marginTop: '2rem',
      }}>

        {/* Product image */}
        <div style={{
          background: '#f3f4f6',
          borderRadius: '16px',
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '80px',
          overflow: 'hidden',
        }}>
          {product.images && product.images[0] ? (
            <img
              src={product.images[0]}
              alt={name}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            '🛍️'
          )}
        </div>

        {/* Product details */}
        <div>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px' }}>
            {isAr
              ? product.categories?.name_ar
              : product.categories?.name_en}
          </p>

          <h1 style={{ fontSize: '28px', margin: '0 0 1rem' }}>{name}</h1>

          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#16a34a', margin: '0 0 1rem' }}>
            EGP {product.price}
          </p>

          <p style={{ color: '#374151', lineHeight: '1.7', margin: '0 0 1.5rem' }}>
            {description}
          </p>

          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 1.5rem' }}>
            {isAr ? 'المخزون المتاح:' : 'Available stock:'} {product.stock}
          </p>

          {/* Add to cart button */}
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
        </div>
      </div>
      </>

    </main>
    
  );
  
}
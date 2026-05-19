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
    <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>

      {/* Back link */}
      <Link
        href={`/${lang}/products`}
        style={{ color: '#6b7280', textDecoration: 'none', fontSize: '14px' }}
      >
        ← {isAr ? 'العودة للمنتجات' : 'Back to products'}
      </Link>

      <div style={{
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
        }}>
          🛍️
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
            ${product.price}
          </p>

          <p style={{ color: '#374151', lineHeight: '1.7', margin: '0 0 1.5rem' }}>
            {description}
          </p>

          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 1.5rem' }}>
            {isAr ? 'المخزون المتاح:' : 'Available stock:'} {product.stock}
          </p>

          {/* Add to cart button */}
          {product.stock > 0 ? (
            <button style={{
              width: '100%',
              padding: '14px',
              background: '#111',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              cursor: 'pointer',
            }}>
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
            </button>
          ) : (
            <button disabled style={{
              width: '100%',
              padding: '14px',
              background: '#e5e7eb',
              color: '#9ca3af',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              cursor: 'not-allowed',
            }}>
              {isAr ? 'نفذ المخزون' : 'Out of Stock'}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
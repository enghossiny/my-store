import Link from 'next/link';

type Product = {
  id: string;
  name_ar: string;
  name_en: string;
  price: number;
  images: string[];
  stock: number;
};

export default function ProductCard({
  product,
  lang,
}: {
  product: Product;
  lang: string;
}) {
  const isAr = lang === 'ar';
  const name = isAr ? product.name_ar : product.name_en;

  return (
    <Link
      href={`/${lang}/product/${product.id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
      }}>
        {/* Product Image */}
        <div style={{
          width: '100%',
          height: '200px',
          background: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px',
        }}>
          🛍️
        </div>

        {/* Product Info */}
        <div style={{ padding: '1rem' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '16px' }}>{name}</h3>
          <p style={{ margin: '0 0 8px', fontWeight: 'bold', color: '#16a34a' }}>
            ${product.price}
          </p>
          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
            {isAr ? 'المخزون:' : 'Stock:'} {product.stock}
          </p>
        </div>
      </div>
    </Link>
  );
}
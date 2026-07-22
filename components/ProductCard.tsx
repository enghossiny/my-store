'use client';

import Link from 'next/link';

type Product = {
  id: string; name_ar: string; name_en: string;
  price: number; images: string[]; stock: number;
};

export default function ProductCard({ product, lang }: { product: Product; lang: string }) {
  const isAr = lang === 'ar';
  const name = isAr ? product.name_ar : product.name_en;

  return (
    <Link href={`/${lang}/product/${product.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        background: '#fff', borderRadius: '16px', overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(108,99,255,0.08)',
        border: '1px solid rgba(108,99,255,0.1)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer', height: '100%',
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 30px rgba(108,99,255,0.2)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(108,99,255,0.08)';
        }}
      >
        {/* Image */}
        <div className="product-card-image" style={{
          width: '100%', height: '200px',
          background: 'linear-gradient(135deg, #f8f7ff, #ede9ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '56px', position: 'relative', overflow: 'hidden',
        }}>
          {product.images?.[0]
            ? <img src={product.images[0]} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : '🛍️'
          }
          {product.stock === 0 && (
            <div style={{
              position: 'absolute', top: '8px', right: '8px',
              background: '#ef4444', color: '#fff',
              fontSize: '10px', fontWeight: '700',
              padding: '3px 8px', borderRadius: '999px',
            }}>
              {isAr ? 'نفذ' : 'Out of Stock'}
            </div>
          )}
          {product.stock > 0 && product.stock < 10 && (
            <div style={{
              position: 'absolute', top: '8px', right: '8px',
              background: '#f59e0b', color: '#fff',
              fontSize: '10px', fontWeight: '700',
              padding: '3px 8px', borderRadius: '999px',
            }}>
              {isAr ? 'كمية محدودة' : 'Low Stock'}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '0.875rem 1rem' }}>
          <h3 className="product-card-name" style={{
            margin: '0 0 6px', fontSize: '14px', fontWeight: '600',
            color: '#1a1a2e', overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="product-card-price" style={{
              fontSize: '18px', fontWeight: '800',
              background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              ${product.price}
            </span>
            <span style={{
              background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
              color: '#fff', fontSize: '11px', fontWeight: '600',
              padding: '4px 10px', borderRadius: '999px',
            }}>
              {isAr ? 'عرض' : 'View'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
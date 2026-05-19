'use client';

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
    <Link href={`/${lang}/product/${product.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: '#fff',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(108,99,255,0.08)',
        border: '1px solid rgba(108,99,255,0.1)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
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
        <div style={{
          width: '100%',
          height: '200px',
          background: 'linear-gradient(135deg, #f8f7ff 0%, #ede9ff 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '64px',
          position: 'relative',
        }}>
          {product.images?.[0]
            ? <img src={product.images[0]} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : '🛍️'
          }
          {product.stock === 0 && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: '#ef4444',
              color: '#fff',
              fontSize: '11px',
              fontWeight: '700',
              padding: '4px 10px',
              borderRadius: '999px',
            }}>
              {isAr ? 'نفذ' : 'Out of Stock'}
            </div>
          )}
          {product.stock > 0 && product.stock < 10 && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: '#f59e0b',
              color: '#fff',
              fontSize: '11px',
              fontWeight: '700',
              padding: '4px 10px',
              borderRadius: '999px',
            }}>
              {isAr ? 'كمية محدودة' : 'Low Stock'}
            </div>
          )}
        </div>

        <div style={{ padding: '1rem 1.25rem' }}>
          <h3 style={{
            margin: '0 0 8px',
            fontSize: '15px',
            fontWeight: '600',
            color: '#1a1a2e',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontSize: '20px',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              ${product.price}
            </span>
            <span style={{
              background: 'linear-gradient(135deg, #6c63ff, #e91e8c)',
              color: '#fff',
              fontSize: '12px',
              fontWeight: '600',
              padding: '5px 12px',
              borderRadius: '999px',
            }}>
              {isAr ? 'عرض' : 'View'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
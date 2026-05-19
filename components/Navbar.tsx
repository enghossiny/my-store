'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cartContext';

export default function Navbar({ lang }: { lang: string }) {
  const { count } = useCart();
  const isAr = lang === 'ar';

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 2rem',
      borderBottom: '1px solid #e5e7eb',
      background: '#fff',
    }}>
      <Link href={`/${lang}`} style={{
        fontWeight: 'bold',
        fontSize: '20px',
        textDecoration: 'none',
        color: '#111',
      }}>
        🛒 {isAr ? 'متجري' : 'My Store'}
      </Link>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link href={`/${lang}`} style={{ textDecoration: 'none', color: '#374151' }}>
          {isAr ? 'الرئيسية' : 'Home'}
        </Link>
        <Link href={`/${lang}/products`} style={{ textDecoration: 'none', color: '#374151' }}>
          {isAr ? 'المنتجات' : 'Products'}
        </Link>
        <Link href={`/${lang}/account`} style={{ textDecoration: 'none', color: '#374151' }}>
          {isAr ? 'حسابي' : 'Account'}
        </Link>

        {/* Cart icon with count */}
        <Link href={`/${lang}/cart`} style={{
          textDecoration: 'none',
          position: 'relative',
          display: 'inline-block',
        }}>
          <span style={{ fontSize: '22px' }}>🛒</span>
          {count > 0 && (
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: '#ef4444',
              color: '#fff',
              borderRadius: '999px',
              fontSize: '11px',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
            }}>
              {count}
            </span>
          )}
        </Link>

        {/* Language switcher */}
        <Link href={isAr ? '/en' : '/ar'} style={{
          padding: '4px 12px',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          textDecoration: 'none',
          color: '#374151',
          fontSize: '14px',
        }}>
          {isAr ? 'EN' : 'AR'}
        </Link>
      </div>
    </nav>
  );
}
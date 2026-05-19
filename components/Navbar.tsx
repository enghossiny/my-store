'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cartContext';
import { useAuth } from '@/lib/authContext';

export default function Navbar({ lang }: { lang: string }) {
  const { count } = useCart();
  const { user } = useAuth();
  const isAr = lang === 'ar';

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #6c63ff 0%, #e91e8c 100%)',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '64px',
      boxShadow: '0 4px 20px rgba(108,99,255,0.3)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <Link href={`/${lang}`} style={{
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          background: '#fff',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
        }}>🛒</div>
        <span style={{
          color: '#fff',
          fontWeight: '800',
          fontSize: '20px',
          letterSpacing: '-0.5px',
        }}>
          {isAr ? 'متجري' : 'MyStore'}
        </span>
      </Link>

      {/* Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {[
          { href: `/${lang}`, label: isAr ? 'الرئيسية' : 'Home' },
          { href: `/${lang}/products`, label: isAr ? 'المنتجات' : 'Products' },
          { href: `/${lang}/account`, label: isAr ? 'حسابي' : 'Account' },
        ].map((link) => (
          <Link key={link.href} href={link.href} style={{
            color: 'rgba(255,255,255,0.85)',
            textDecoration: 'none',
            padding: '6px 14px',
            borderRadius: '999px',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {link.label}
          </Link>
        ))}

        {/* Cart */}
        <Link href={`/${lang}/cart`} style={{
          position: 'relative',
          textDecoration: 'none',
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '999px',
          padding: '6px 16px',
          color: '#fff',
          fontSize: '14px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          🛒
          {count > 0 && (
            <span style={{
              background: '#ffdd00',
              color: '#1a1a2e',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '800',
              padding: '1px 7px',
            }}>
              {count}
            </span>
          )}
        </Link>

        {/* Language switcher */}
        <Link href={isAr ? '/en' : '/ar'} style={{
          background: '#fff',
          color: '#6c63ff',
          padding: '6px 14px',
          borderRadius: '999px',
          textDecoration: 'none',
          fontSize: '13px',
          fontWeight: '700',
        }}>
          {isAr ? 'EN' : 'AR'}
        </Link>
      </div>
    </nav>
  );
}
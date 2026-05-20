'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/lib/cartContext';
import { useAuth } from '@/lib/authContext';

export default function Navbar({ lang }: { lang: string }) {
  const { count } = useCart();
  const { user } = useAuth();
  const isAr = lang === 'ar';
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav style={{
        background: 'linear-gradient(135deg, #6c63ff 0%, #e91e8c 100%)',
        padding: '0 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '60px',
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
          gap: '8px',
        }}>
          <div style={{
            width: '32px', height: '32px',
            background: '#fff', borderRadius: '8px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '18px',
          }}>🛒</div>
          <span style={{ color: '#fff', fontWeight: '800', fontSize: '18px' }}>
            {isAr ? 'متجري' : 'MyStore'}
          </span>
        </Link>

        {/* Desktop links */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
        }} className="desktop-nav">
          {[
            { href: `/${lang}`, label: isAr ? 'الرئيسية' : 'Home' },
            { href: `/${lang}/products`, label: isAr ? 'المنتجات' : 'Products' },
            { href: `/${lang}/account`, label: isAr ? 'حسابي' : 'Account' },
          ].map((link) => (
            <Link key={link.href} href={link.href} style={{
              color: 'rgba(255,255,255,0.85)', textDecoration: 'none',
              padding: '6px 12px', borderRadius: '999px',
              fontSize: '14px', fontWeight: '500',
            }}>
              {link.label}
            </Link>
          ))}

          <Link href={`/${lang}/cart`} style={{
            textDecoration: 'none',
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '999px', padding: '6px 14px',
            color: '#fff', fontSize: '14px', fontWeight: '600',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            🛒
            {count > 0 && (
              <span style={{
                background: '#ffdd00', color: '#1a1a2e',
                borderRadius: '999px', fontSize: '11px',
                fontWeight: '800', padding: '1px 7px',
              }}>{count}</span>
            )}
          </Link>

          <Link href={isAr ? '/en' : '/ar'} style={{
            background: '#fff', color: '#6c63ff',
            padding: '6px 12px', borderRadius: '999px',
            textDecoration: 'none', fontSize: '13px', fontWeight: '700',
          }}>
            {isAr ? 'EN' : 'AR'}
          </Link>
        </div>

        {/* Mobile right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="mobile-nav">
          <Link href={`/${lang}/cart`} style={{
            textDecoration: 'none', position: 'relative',
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '999px', padding: '6px 12px',
            color: '#fff', fontSize: '14px',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            🛒
            {count > 0 && (
              <span style={{
                background: '#ffdd00', color: '#1a1a2e',
                borderRadius: '999px', fontSize: '11px',
                fontWeight: '800', padding: '1px 6px',
              }}>{count}</span>
            )}
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px', padding: '6px 10px',
              color: '#fff', cursor: 'pointer', fontSize: '18px',
            }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: '60px', left: 0, right: 0,
          background: '#1a1a2e', zIndex: 99,
          padding: '1rem', borderBottom: '3px solid #6c63ff',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
        }}>
          {[
            { href: `/${lang}`, label: isAr ? 'الرئيسية' : 'Home', icon: '🏠' },
            { href: `/${lang}/products`, label: isAr ? 'المنتجات' : 'Products', icon: '🛍️' },
            { href: `/${lang}/account`, label: isAr ? 'حسابي' : 'Account', icon: '👤' },
          ].map((link) => (
            <Link key={link.href} href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 16px', color: '#fff',
                textDecoration: 'none', fontSize: '16px', fontWeight: '500',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}>
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
          <Link href={isAr ? '/en' : '/ar'}
            onClick={() => setMenuOpen(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px 16px', color: '#6c63ff',
              textDecoration: 'none', fontSize: '16px', fontWeight: '700',
            }}>
            🌐 {isAr ? 'English' : 'العربية'}
          </Link>
        </div>
      )}

      <style>{`
        .desktop-nav { display: flex !important; }
        .mobile-nav { display: none !important; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav { display: flex !important; }
        }
      `}</style>
    </>
  );
}
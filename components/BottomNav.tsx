'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cartContext';
import { usePathname } from 'next/navigation';

export default function BottomNav({ lang }: { lang: string }) {
  const { count } = useCart();
  const pathname = usePathname();
  const isAr = lang === 'ar';

  const links = [
    { href: `/${lang}`, icon: '🏠', label: isAr ? 'الرئيسية' : 'Home' },
    { href: `/${lang}/products`, icon: '🛍️', label: isAr ? 'المنتجات' : 'Products' },
    { href: `/${lang}/cart`, icon: '🛒', label: isAr ? 'السلة' : 'Cart', badge: count },
    { href: `/${lang}/account`, icon: '👤', label: isAr ? 'حسابي' : 'Account' },
  ];

  return (
    <>
      <style>{`
        .bottom-nav { display: none; }
        @media (max-width: 768px) {
          .bottom-nav { display: flex !important; }
          .bottom-nav-spacer { display: block !important; }
        }
      `}</style>

      {/* Spacer so content doesn't hide behind nav */}
      <div className="bottom-nav-spacer" style={{ display: 'none', height: '70px' }} />

      <nav className="bottom-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#fff', borderTop: '1px solid #e5e7eb',
        display: 'flex', justifyContent: 'space-around',
        padding: '8px 0 12px', zIndex: 100,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
      }}>
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '2px',
              textDecoration: 'none', position: 'relative',
              minWidth: '60px',
            }}>
              <div style={{ position: 'relative' }}>
                <span style={{ fontSize: '22px' }}>{link.icon}</span>
                {link.badge && link.badge > 0 && (
                  <span style={{
                    position: 'absolute', top: '-4px', right: '-8px',
                    background: '#e91e8c', color: '#fff',
                    borderRadius: '999px', fontSize: '10px',
                    fontWeight: '800', padding: '1px 5px',
                    minWidth: '16px', textAlign: 'center',
                  }}>
                    {link.badge}
                  </span>
                )}
              </div>
              <span style={{
                fontSize: '10px', fontWeight: active ? '700' : '500',
                color: active ? '#6c63ff' : '#9ca3af',
              }}>
                {link.label}
              </span>
              {active && (
                <div style={{
                  position: 'absolute', bottom: '-12px',
                  width: '4px', height: '4px',
                  background: '#6c63ff', borderRadius: '999px',
                }} />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
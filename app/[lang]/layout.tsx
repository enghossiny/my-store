import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { CartProvider } from '@/lib/cartContext';
import { AuthProvider } from '@/lib/authContext';
import Navbar from '@/components/Navbar';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const messages = await getMessages();
  const isRTL = lang === 'ar';

  return (
    <html lang={lang} dir={isRTL ? 'rtl' : 'ltr'}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{
        margin: 0,
        fontFamily: isRTL ? 'Tajawal, sans-serif' : 'Poppins, sans-serif',
        background: '#f8f7ff',
        color: '#1a1a2e',
      }}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <CartProvider>
              <Navbar lang={lang} />
              {children}
            </CartProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
import '@/app/globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { CartProvider } from '@/lib/cartContext';
import { AuthProvider } from '@/lib/authContext';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';

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
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '100vh' }}>
      <NextIntlClientProvider messages={messages}>
        <AuthProvider>
          <CartProvider>
            <Navbar lang={lang} />
            {children}
            <BottomNav lang={lang} />
          </CartProvider>
        </AuthProvider>
      </NextIntlClientProvider>
    </div>
  );
}
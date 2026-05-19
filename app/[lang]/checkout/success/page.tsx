import Link from 'next/link';

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ order: string }>;
}) {
  const { lang } = await params;
  const { order } = await searchParams;
  const isAr = lang === 'ar';

  return (
    <main style={{
      padding: '4rem 2rem',
      textAlign: 'center',
      maxWidth: '500px',
      margin: '0 auto',
    }}>
      <div style={{ fontSize: '64px', marginBottom: '1rem' }}>✅</div>

      <h1 style={{ marginBottom: '1rem' }}>
        {isAr ? 'تم تأكيد طلبك!' : 'Order Placed!'}
      </h1>

      <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
        {isAr ? 'رقم الطلب:' : 'Order ID:'}
      </p>

      <p style={{
        fontFamily: 'monospace',
        background: '#f3f4f6',
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        marginBottom: '1.5rem',
        wordBreak: 'break-all',
      }}>
        {order}
      </p>

      <p style={{ color: '#374151', marginBottom: '2rem', lineHeight: '1.7' }}>
        {isAr
          ? 'سنتواصل معك قريباً لتأكيد موعد التوصيل. الدفع عند الاستلام.'
          : 'We will contact you soon to confirm your delivery. Payment is cash on delivery.'}
      </p>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link href={`/${lang}`} style={{
          padding: '10px 24px',
          background: '#111',
          color: '#fff',
          borderRadius: '8px',
          textDecoration: 'none',
        }}>
          {isAr ? 'العودة للرئيسية' : 'Back to Home'}
        </Link>

        <Link href={`/${lang}/products`} style={{
          padding: '10px 24px',
          border: '1px solid #111',
          color: '#111',
          borderRadius: '8px',
          textDecoration: 'none',
        }}>
          {isAr ? 'مواصلة التسوق' : 'Keep Shopping'}
        </Link>
      </div>
    </main>
  );
}
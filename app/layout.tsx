import './globals.css';

export const metadata = {
  title: 'MALATH',
  description: 'A small store built with Next.js',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{
        margin: 0,
        fontFamily: 'Poppins, sans-serif',
        background: '#f8f7ff',
        color: '#1a1a2e',
        overflowX: 'hidden',
      }}>
        {children}
      </body>
    </html>
  );
}

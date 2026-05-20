import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
});

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip API routes completely
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Skip static files
  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Admin login page — always allow
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Protect all other admin routes
  if (pathname.startsWith('/admin')) {
    const session = req.cookies.get('admin_session')?.value;
    if (session !== 'authenticated') {
      const loginUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Apply intl middleware to store routes
  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
});

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect admin routes (except login page and api)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const session = req.cookies.get('admin_session')?.value;
    if (session !== 'authenticated') {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  // Apply intl middleware to non-admin routes
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api')) {
    return intlMiddleware(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
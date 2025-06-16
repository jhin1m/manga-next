import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './src/i18n/config';
import { getCorsHeaders, handlePreflight } from './src/lib/cors';

// List of routes that require authentication
const protectedRoutes = ['/profile', '/profile/settings'];

// List of admin routes that require admin privileges
const adminRoutes = ['/admin'];

// List of routes that should redirect to home if user is already authenticated
const authRoutes = ['/auth/login', '/auth/register'];

// Create the intl middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localeDetection: true,
  localePrefix: 'never', // No /en, /vi prefix
});

export async function middleware(req: NextRequest) {
  // Handle CORS for API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return handlePreflight(req);
    }

    // For other API requests, we'll add CORS headers in the response
    // This is handled by the withCors wrapper in individual routes
  }

  // First, handle internationalization
  const intlResponse = intlMiddleware(req);
  if (intlResponse) {
    // Add CORS headers to intl response if it's an API route
    if (req.nextUrl.pathname.startsWith('/api/')) {
      const corsHeaders = getCorsHeaders(req);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        intlResponse.headers.set(key, value);
      });
    }
    return intlResponse;
  }
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isLoggedIn = !!token;
  const path = req.nextUrl.pathname;

  // Check if the route is protected and user is not logged in
  if (protectedRoutes.some(route => path.startsWith(route)) && !isLoggedIn) {
    const loginUrl = new URL('/auth/login', req.nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (authRoutes.some(route => path.startsWith(route)) && isLoggedIn) {
    return NextResponse.redirect(new URL('/', req.nextUrl.origin));
  }

  // Check for admin routes
  if (adminRoutes.some(route => path.startsWith(route))) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/auth/login', req.nextUrl.origin);
      loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if user has admin role (admin, moderator, editor, super_admin)
    const adminRoles = ['admin', 'moderator', 'editor', 'super_admin'];
    if (!adminRoles.includes(token?.role)) {
      return NextResponse.redirect(new URL('/', req.nextUrl.origin));
    }
  }

  // Create response and add CORS headers for API routes
  const response = NextResponse.next();

  if (req.nextUrl.pathname.startsWith('/api/')) {
    const corsHeaders = getCorsHeaders(req);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  return response;
}

// Specify which paths should be processed by the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - _vercel (Vercel internals)
     * Note: We now include API routes for CORS handling
     */
    '/((?!_next/static|_next/image|_vercel|favicon.ico|public|.*\\..*).*)',
  ],
};

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// List of routes that require authentication
const protectedRoutes = [
  '/profile',
  '/profile/settings',
]

// List of routes that should redirect to home if user is already authenticated
const authRoutes = [
  '/auth/login',
  '/auth/register',
]

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isLoggedIn = !!token
  const path = req.nextUrl.pathname

  // Check if the route is protected and user is not logged in
  if (protectedRoutes.some(route => path.startsWith(route)) && !isLoggedIn) {
    const loginUrl = new URL('/auth/login', req.nextUrl.origin)
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages
  if (authRoutes.some(route => path.startsWith(route)) && isLoggedIn) {
    return NextResponse.redirect(new URL('/', req.nextUrl.origin))
  }

  // Check for admin routes
  if (path.startsWith('/admin') && (!isLoggedIn || token?.role !== 'admin')) {
    return NextResponse.redirect(new URL('/', req.nextUrl.origin))
  }

  return NextResponse.next()
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
     * - api/auth (NextAuth.js API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)',
  ],
}

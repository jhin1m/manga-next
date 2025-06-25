import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/auth/status
 * Lightweight endpoint to check authentication status - NEVER CACHED
 * Used for client-side auth state checking without cache interference
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      success: true,
      isAuthenticated: !!session,
      user: session?.user ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role
      } : null,
      timestamp: Date.now()
    }, {
      status: 200,
      headers: {
        // Prevent all forms of caching
        'Cache-Control': 'no-cache, no-store, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Accel-Expires': '0', // Nginx
        'Surrogate-Control': 'no-store', // Cloudflare/Varnish
        'CDN-Cache-Control': 'no-store', // Cloudflare
        'Cloudflare-CDN-Cache-Control': 'no-store', // Cloudflare specific
        'Vary': 'Cookie', // Ensure different responses for different users
      }
    });
  } catch (error) {
    console.error('[AUTH_STATUS_ERROR]', error);
    
    return NextResponse.json({
      success: false,
      isAuthenticated: false,
      user: null,
      error: 'Failed to check authentication status',
      timestamp: Date.now()
    }, {
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  }
}

/**
 * OPTIONS endpoint for CORS support
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
} 
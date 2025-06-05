/**
 * CORS Configuration and Utilities for NextJS API Routes
 * Handles Cross-Origin Resource Sharing for the manga website
 */

import { NextRequest, NextResponse } from 'next/server'

// CORS Configuration
export const CORS_CONFIG = {
  // Allowed origins - customize based on your deployment
  origins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://localhost:3000',
    'https://localhost:3001',
    // Add your production domains here
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  ].filter(Boolean) as string[],
  
  // Allowed methods
  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
    'HEAD',
  ],
  
  // Allowed headers
  headers: [
    'Accept',
    'Accept-Language',
    'Content-Language',
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
    'X-API-Key',
    'Cache-Control',
    'Pragma',
  ],
  
  // Exposed headers (headers that the client can access)
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset',
  ],
  
  // Allow credentials (cookies, authorization headers)
  credentials: true,
  
  // Preflight cache duration (in seconds)
  maxAge: 86400, // 24 hours
}

/**
 * Check if origin is allowed
 */
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true // Allow requests without origin (same-origin, mobile apps, etc.)
  
  // Allow all origins in development
  if (process.env.NODE_ENV === 'development') {
    return true
  }
  
  // Check against allowed origins
  return CORS_CONFIG.origins.some(allowedOrigin => {
    if (allowedOrigin === '*') return true
    if (allowedOrigin === origin) return true
    
    // Support wildcard subdomains (e.g., *.example.com)
    if (allowedOrigin.startsWith('*.')) {
      const domain = allowedOrigin.slice(2)
      return origin.endsWith(`.${domain}`) || origin === domain
    }
    
    return false
  })
}

/**
 * Get CORS headers for a request
 */
export function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get('origin')
  const headers: Record<string, string> = {}
  
  // Set Access-Control-Allow-Origin
  if (isOriginAllowed(origin)) {
    headers['Access-Control-Allow-Origin'] = origin || '*'
  }
  
  // Set other CORS headers
  headers['Access-Control-Allow-Methods'] = CORS_CONFIG.methods.join(', ')
  headers['Access-Control-Allow-Headers'] = CORS_CONFIG.headers.join(', ')
  headers['Access-Control-Expose-Headers'] = CORS_CONFIG.exposedHeaders.join(', ')
  headers['Access-Control-Max-Age'] = CORS_CONFIG.maxAge.toString()
  
  if (CORS_CONFIG.credentials) {
    headers['Access-Control-Allow-Credentials'] = 'true'
  }
  
  // Additional security headers
  headers['X-Content-Type-Options'] = 'nosniff'
  headers['X-Frame-Options'] = 'DENY'
  headers['X-XSS-Protection'] = '1; mode=block'
  headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
  
  return headers
}

/**
 * Handle preflight OPTIONS request
 */
export function handlePreflight(request: NextRequest): NextResponse {
  const corsHeaders = getCorsHeaders(request)
  
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  })
}

/**
 * Add CORS headers to a response
 */
export function addCorsHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const corsHeaders = getCorsHeaders(request)
  
  // Add CORS headers to existing response
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}

/**
 * CORS wrapper for API route handlers
 * Usage: export const GET = withCors(async (request) => { ... })
 */
export function withCors<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse> | NextResponse
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return handlePreflight(request)
    }
    
    try {
      // Call the original handler
      const response = await handler(request, ...args)
      
      // Add CORS headers to the response
      return addCorsHeaders(response, request)
    } catch (error) {
      console.error('API Error:', error)
      
      // Create error response with CORS headers
      const errorResponse = NextResponse.json(
        { 
          success: false, 
          error: 'Internal Server Error',
          message: process.env.NODE_ENV === 'development' ? String(error) : undefined
        },
        { status: 500 }
      )
      
      return addCorsHeaders(errorResponse, request)
    }
  }
}

/**
 * Create a JSON response with CORS headers
 */
export function corsResponse(
  data: any,
  request: NextRequest,
  options: {
    status?: number
    headers?: Record<string, string>
  } = {}
): NextResponse {
  const response = NextResponse.json(data, {
    status: options.status || 200,
    headers: options.headers,
  })
  
  return addCorsHeaders(response, request)
}

/**
 * Validate CORS configuration
 */
export function validateCorsConfig(): void {
  if (process.env.NODE_ENV === 'production') {
    const hasWildcard = CORS_CONFIG.origins.includes('*')
    const hasCredentials = CORS_CONFIG.credentials
    
    if (hasWildcard && hasCredentials) {
      console.warn(
        'CORS Warning: Using wildcard origin (*) with credentials is not secure in production. ' +
        'Please specify exact origins in CORS_CONFIG.origins'
      )
    }
    
    if (CORS_CONFIG.origins.length === 0) {
      console.warn('CORS Warning: No origins configured. This may cause CORS issues.')
    }
  }
}

// Validate configuration on module load
validateCorsConfig()

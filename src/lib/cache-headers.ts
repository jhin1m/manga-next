/**
 * Smart Cache Headers Management for bfcache Optimization
 * 
 * This utility provides different caching strategies based on content sensitivity
 * to balance security and Back/Forward Cache (bfcache) compatibility.
 */

export type CacheStrategy = 
  | 'public-static'      // Static assets (images, CSS, JS)
  | 'public-dynamic'     // Dynamic but cacheable content (manga lists, chapters)
  | 'private-user'       // User-specific but cacheable (favorites, reading progress)
  | 'no-cache-sensitive' // Sensitive but allow bfcache (admin operations)
  | 'no-store-critical'  // Critical security data (authentication tokens)

export interface CacheConfig {
  maxAge?: number
  sMaxAge?: number
  staleWhileRevalidate?: number
  mustRevalidate?: boolean
  private?: boolean
  noStore?: boolean
}

/**
 * Get optimized cache headers based on strategy
 */
export function getCacheHeaders(strategy: CacheStrategy, customConfig?: CacheConfig): Record<string, string> {
  const baseConfigs: Record<CacheStrategy, CacheConfig> = {
    'public-static': {
      maxAge: 31536000, // 1 year
      sMaxAge: 31536000,
      staleWhileRevalidate: 86400, // 1 day
    },
    'public-dynamic': {
      maxAge: 3600, // 1 hour
      sMaxAge: 3600,
      staleWhileRevalidate: 1800, // 30 minutes
    },
    'private-user': {
      maxAge: 300, // 5 minutes
      private: true,
      mustRevalidate: true,
    },
    'no-cache-sensitive': {
      maxAge: 0,
      mustRevalidate: true,
      // Don't use no-store to allow bfcache
    },
    'no-store-critical': {
      noStore: true,
      mustRevalidate: true,
      private: true,
    }
  }

  const config = { ...baseConfigs[strategy], ...customConfig }
  const parts: string[] = []

  if (config.noStore) {
    parts.push('no-store')
  } else {
    if (config.private) {
      parts.push('private')
    } else {
      parts.push('public')
    }

    if (config.maxAge !== undefined) {
      parts.push(`max-age=${config.maxAge}`)
    }

    if (config.sMaxAge !== undefined) {
      parts.push(`s-maxage=${config.sMaxAge}`)
    }

    if (config.staleWhileRevalidate !== undefined) {
      parts.push(`stale-while-revalidate=${config.staleWhileRevalidate}`)
    }
  }

  if (config.mustRevalidate) {
    parts.push('must-revalidate')
  }

  return {
    'Cache-Control': parts.join(', ')
  }
}

/**
 * Determine if a request should use no-store based on sensitivity
 */
export function shouldUseNoStore(endpoint: string, method: string = 'GET'): boolean {
  const criticalEndpoints = [
    '/api/auth/session',
    '/api/auth/csrf',
    '/api/users/me/password',
    '/api/admin/auth/login',
    '/api/admin/auth/logout',
  ]

  const criticalMethods = ['POST', 'PUT', 'PATCH', 'DELETE']
  
  // Only use no-store for truly critical authentication endpoints
  return criticalEndpoints.some(critical => endpoint.includes(critical)) ||
         (criticalMethods.includes(method) && endpoint.includes('/auth/'))
}

/**
 * Get cache strategy based on endpoint and method
 */
export function getCacheStrategy(endpoint: string, method: string = 'GET'): CacheStrategy {
  // Critical security endpoints
  if (shouldUseNoStore(endpoint, method)) {
    return 'no-store-critical'
  }

  // Static assets
  if (endpoint.includes('/static/') || endpoint.includes('/_next/')) {
    return 'public-static'
  }

  // Admin operations (sensitive but allow bfcache)
  if (endpoint.includes('/api/admin/')) {
    return 'no-cache-sensitive'
  }

  // User-specific data
  if (endpoint.includes('/api/users/') || 
      endpoint.includes('/api/favorites') || 
      endpoint.includes('/api/reading-progress') ||
      endpoint.includes('/api/notifications')) {
    return 'private-user'
  }

  // Public dynamic content
  return 'public-dynamic'
}

/**
 * Create response with optimized cache headers
 */
export function createCachedResponse(
  data: any,
  endpoint: string,
  method: string = 'GET',
  customStrategy?: CacheStrategy,
  customConfig?: CacheConfig
) {
  const strategy = customStrategy || getCacheStrategy(endpoint, method)
  const headers = getCacheHeaders(strategy, customConfig)

  return {
    data,
    headers,
    strategy // For debugging
  }
}

/**
 * Middleware to add smart cache headers to API responses
 */
export function withSmartCache(
  handler: (request: Request, ...args: any[]) => Promise<Response>,
  strategy?: CacheStrategy
) {
  return async (request: Request, ...args: any[]): Promise<Response> => {
    const response = await handler(request, ...args)
    
    if (response.ok) {
      const url = new URL(request.url)
      const cacheStrategy = strategy || getCacheStrategy(url.pathname, request.method)
      const headers = getCacheHeaders(cacheStrategy)
      
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
    }

    return response
  }
}

/**
 * Constants for common cache durations
 */
export const CACHE_DURATIONS = {
  STATIC: 31536000,    // 1 year
  LONG: 86400,         // 1 day  
  MEDIUM: 3600,        // 1 hour
  SHORT: 300,          // 5 minutes
  VERY_SHORT: 60,      // 1 minute
  IMMEDIATE: 0,        // No cache
} as const

/**
 * Presets for common scenarios
 */
export const CACHE_PRESETS = {
  MANGA_LIST: getCacheHeaders('public-dynamic', { maxAge: CACHE_DURATIONS.MEDIUM }),
  MANGA_DETAIL: getCacheHeaders('public-dynamic', { maxAge: CACHE_DURATIONS.MEDIUM }),
  CHAPTER_CONTENT: getCacheHeaders('public-dynamic', { maxAge: CACHE_DURATIONS.LONG }),
  USER_FAVORITES: getCacheHeaders('private-user', { maxAge: CACHE_DURATIONS.SHORT }),
  HEALTH_CHECK: getCacheHeaders('no-cache-sensitive', { maxAge: CACHE_DURATIONS.VERY_SHORT }),
  ADMIN_DATA: getCacheHeaders('no-cache-sensitive'),
} as const

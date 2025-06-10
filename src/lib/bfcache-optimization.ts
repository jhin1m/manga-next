/**
 * Back/Forward Cache (bfcache) Optimization Utilities
 * 
 * This module provides utilities to optimize pages for bfcache compatibility
 * while maintaining security and functionality.
 */

/**
 * Check if current page should be optimized for bfcache
 */
export function shouldOptimizeForBfcache(pathname: string): boolean {
  // Pages that benefit most from bfcache
  const bfcacheOptimizedPages = [
    '/',
    '/manga',
    '/manga/[slug]',
    '/manga/[slug]/chapter/[chapterSlug]',
    '/genres',
    '/genres/[slug]',
    '/search',
    '/rankings',
  ]

  // Pages that should NOT be optimized (sensitive/dynamic)
  const excludedPages = [
    '/admin',
    '/auth',
    '/profile',
    '/api',
  ]

  // Check if page should be excluded
  if (excludedPages.some(excluded => pathname.startsWith(excluded))) {
    return false
  }

  // Check if page should be optimized
  return bfcacheOptimizedPages.some(optimized => {
    if (optimized.includes('[')) {
      // Handle dynamic routes
      const pattern = optimized.replace(/\[.*?\]/g, '[^/]+')
      const regex = new RegExp(`^${pattern}$`)
      return regex.test(pathname)
    }
    return pathname === optimized || pathname.startsWith(optimized)
  })
}

/**
 * Get bfcache-friendly fetch options
 */
export function getBfcacheFriendlyFetchOptions(
  endpoint: string,
  options: RequestInit = {}
): RequestInit {
  const url = new URL(endpoint, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
  
  // Sensitive endpoints that need no-store
  const sensitiveEndpoints = [
    '/api/auth/session',
    '/api/auth/csrf',
    '/api/users/me/password',
    '/api/admin/auth',
  ]

  const isSensitive = sensitiveEndpoints.some(sensitive => 
    url.pathname.includes(sensitive)
  )

  if (isSensitive) {
    return {
      ...options,
      cache: 'no-store',
    }
  }

  // For other endpoints, use no-cache instead of no-store
  if (options.cache === 'no-store') {
    return {
      ...options,
      cache: 'no-cache',
    }
  }

  return options
}

/**
 * Wrapper for fetch that optimizes for bfcache
 */
export async function bfcacheFriendlyFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const url = typeof input === 'string' ? input : input.toString()
  const optimizedOptions = getBfcacheFriendlyFetchOptions(url, init)
  
  return fetch(input, optimizedOptions)
}

/**
 * Client-side utility to handle page visibility changes for bfcache
 */
export function setupBfcacheHandlers() {
  if (typeof window === 'undefined') return

  // Handle page show event (including bfcache restore)
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      // Page was restored from bfcache
      console.log('Page restored from bfcache')
      
      // Refresh critical data if needed
      refreshCriticalData()
    }
  })

  // Handle page hide event
  window.addEventListener('pagehide', (event) => {
    if (event.persisted) {
      // Page will be stored in bfcache
      console.log('Page stored in bfcache')
    }
  })

  // Handle visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // Page became visible, might need to refresh data
      refreshStaleData()
    }
  })
}

/**
 * Refresh critical data when page is restored from bfcache
 */
function refreshCriticalData() {
  // Only refresh truly critical data
  const criticalRefreshes = [
    // User authentication status
    () => {
      if (typeof window !== 'undefined' && 'next-auth.session-token' in document.cookie) {
        // Trigger session refresh if needed
        window.dispatchEvent(new CustomEvent('auth:refresh'))
      }
    },
    
    // Notification count
    () => {
      window.dispatchEvent(new CustomEvent('notifications:refresh'))
    }
  ]

  criticalRefreshes.forEach(refresh => {
    try {
      refresh()
    } catch (error) {
      console.warn('Error refreshing critical data:', error)
    }
  })
}

/**
 * Refresh stale data when page becomes visible
 */
function refreshStaleData() {
  const now = Date.now()
  const staleThreshold = 5 * 60 * 1000 // 5 minutes

  // Check if data is stale and needs refresh
  const lastRefresh = parseInt(localStorage.getItem('lastDataRefresh') || '0')
  
  if (now - lastRefresh > staleThreshold) {
    // Trigger data refresh
    window.dispatchEvent(new CustomEvent('data:refresh'))
    localStorage.setItem('lastDataRefresh', now.toString())
  }
}

/**
 * Configuration for different page types
 */
export const BFCACHE_CONFIG = {
  // Pages that should be fully optimized for bfcache
  OPTIMIZED_PAGES: [
    '/',
    '/manga',
    '/manga/[slug]',
    '/genres',
    '/search',
    '/rankings',
  ],
  
  // Pages that should be partially optimized
  PARTIAL_PAGES: [
    '/manga/[slug]/chapter/[chapterSlug]',
  ],
  
  // Pages that should not be cached in bfcache
  EXCLUDED_PAGES: [
    '/admin',
    '/auth',
    '/profile/settings',
    '/api',
  ],
  
  // API endpoints that can use cache instead of no-store
  CACHEABLE_APIS: [
    '/api/manga',
    '/api/chapters',
    '/api/genres',
    '/api/search',
    '/api/ratings',
    '/api/rankings',
    '/api/health',
    '/api/revalidate',
  ],
  
  // API endpoints that must use no-store
  NO_STORE_APIS: [
    '/api/auth/session',
    '/api/auth/csrf',
    '/api/users/me/password',
    '/api/admin/auth/login',
    '/api/admin/auth/logout',
  ]
} as const

/**
 * Check if an API endpoint can be cached
 */
export function canCacheApiEndpoint(endpoint: string): boolean {
  return BFCACHE_CONFIG.CACHEABLE_APIS.some(cacheable => 
    endpoint.includes(cacheable)
  ) && !BFCACHE_CONFIG.NO_STORE_APIS.some(noStore => 
    endpoint.includes(noStore)
  )
}

/**
 * Get recommended cache strategy for an endpoint
 */
export function getRecommendedCacheStrategy(endpoint: string, method: string = 'GET'): string {
  if (!canCacheApiEndpoint(endpoint)) {
    return 'no-store'
  }

  if (method !== 'GET') {
    return 'no-cache'
  }

  // Public content can be cached longer
  if (endpoint.includes('/api/manga') || 
      endpoint.includes('/api/chapters') || 
      endpoint.includes('/api/genres')) {
    return 'public, max-age=3600, stale-while-revalidate=1800'
  }

  // Default to short cache
  return 'public, max-age=300, must-revalidate'
}

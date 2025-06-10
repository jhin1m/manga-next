'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { setupBfcacheHandlers, shouldOptimizeForBfcache } from '@/lib/bfcache-optimization'

/**
 * BfcacheOptimizer Component
 * 
 * This component sets up Back/Forward Cache optimization for the application.
 * It should be included in the root layout to enable bfcache functionality.
 */
export default function BfcacheOptimizer() {
  const pathname = usePathname()

  useEffect(() => {
    // Only setup bfcache handlers for optimized pages
    if (shouldOptimizeForBfcache(pathname)) {
      setupBfcacheHandlers()
    }

    // Add page-specific optimizations
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Page was restored from bfcache
        console.log(`[bfcache] Page ${pathname} restored from cache`)
        
        // Dispatch custom event for components to handle
        window.dispatchEvent(new CustomEvent('bfcache:restore', {
          detail: { pathname, timestamp: Date.now() }
        }))
      }
    }

    const handlePageHide = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Page will be stored in bfcache
        console.log(`[bfcache] Page ${pathname} stored in cache`)
        
        // Clean up any resources that might prevent bfcache
        cleanupForBfcache()
      }
    }

    // Add event listeners
    window.addEventListener('pageshow', handlePageShow)
    window.addEventListener('pagehide', handlePageHide)

    // Cleanup
    return () => {
      window.removeEventListener('pageshow', handlePageShow)
      window.removeEventListener('pagehide', handlePageHide)
    }
  }, [pathname])

  return null // This component doesn't render anything
}

/**
 * Clean up resources that might prevent bfcache
 */
function cleanupForBfcache() {
  // Clear any intervals or timeouts
  // Note: Modern browsers handle this automatically, but it's good practice
  
  // Clear any WebSocket connections if they exist
  // (WebSockets prevent bfcache)
  
  // Clear any active fetch requests with AbortController
  // (Long-running requests can prevent bfcache)
  
  // Dispatch cleanup event for other components
  window.dispatchEvent(new CustomEvent('bfcache:cleanup'))
}

/**
 * Hook to handle bfcache events in components
 */
export function useBfcacheEvents() {
  useEffect(() => {
    const handleRestore = (event: CustomEvent) => {
      console.log('[bfcache] Handling restore event:', event.detail)
      // Components can override this behavior
    }

    const handleCleanup = () => {
      console.log('[bfcache] Handling cleanup event')
      // Components can override this behavior
    }

    window.addEventListener('bfcache:restore', handleRestore as EventListener)
    window.addEventListener('bfcache:cleanup', handleCleanup)

    return () => {
      window.removeEventListener('bfcache:restore', handleRestore as EventListener)
      window.removeEventListener('bfcache:cleanup', handleCleanup)
    }
  }, [])
}

/**
 * Component wrapper that optimizes children for bfcache
 */
export function BfcacheOptimizedPage({ 
  children, 
  enableOptimization = true 
}: { 
  children: React.ReactNode
  enableOptimization?: boolean 
}) {
  const pathname = usePathname()
  const shouldOptimize = enableOptimization && shouldOptimizeForBfcache(pathname)

  useEffect(() => {
    if (shouldOptimize) {
      // Add page-specific meta tags for bfcache
      const meta = document.createElement('meta')
      meta.name = 'bfcache-optimized'
      meta.content = 'true'
      document.head.appendChild(meta)

      return () => {
        document.head.removeChild(meta)
      }
    }
  }, [shouldOptimize])

  return (
    <>
      {children}
      {shouldOptimize && <BfcacheOptimizer />}
    </>
  )
}

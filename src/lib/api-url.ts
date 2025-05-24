/**
 * Utility to handle API URL construction for both build-time and runtime
 */

/**
 * Get the base API URL for server-side requests
 * This handles both build-time (with dummy values) and runtime (with real values)
 */
export function getApiUrl(): string {
  // During build time, use a dummy base URL to prevent parsing errors
  if (typeof window === 'undefined') {
    // Server-side: check if we're in build mode
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isDevelopment) {
      return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    }
    
    if (isProduction) {
      // In production build, use a dummy URL to prevent parsing errors
      // At runtime, this won't be used as we'll use direct database calls
      return process.env.NEXT_PUBLIC_API_URL || 'https://dummy-build-url.com';
    }
  }
  
  // Client-side: use the configured API URL or current origin
  return process.env.NEXT_PUBLIC_API_URL || window.location.origin;
}

/**
 * Construct a full API URL for a given endpoint
 */
export function buildApiUrl(endpoint: string): string {
  const baseUrl = getApiUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
}

/**
 * Check if we should skip API calls during build time
 */
export function shouldSkipApiCall(): boolean {
  return typeof window === 'undefined' && 
         process.env.NODE_ENV === 'production' &&
         (process.env.NEXT_PUBLIC_API_URL || '').includes('dummy');
}

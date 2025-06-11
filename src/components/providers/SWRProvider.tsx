'use client'

import { SWRConfig } from 'swr'
import { swrConfig } from '@/lib/swr/config'

interface SWRProviderProps {
  children: React.ReactNode
  fallback?: Record<string, any>
}

/**
 * SWR Provider for advanced client-side caching
 * Wraps the application with SWR configuration for optimized data fetching
 */
export default function SWRProvider({ children, fallback = {} }: SWRProviderProps) {
  return (
    <SWRConfig value={{ ...swrConfig, fallback }}>
      {children}
    </SWRConfig>
  )
}

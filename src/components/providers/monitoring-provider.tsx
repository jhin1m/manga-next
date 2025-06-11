'use client';

import { useEffect } from 'react';
import { setupGlobalErrorHandlers } from '@/lib/error-tracking';
import { trackWebVitals } from '@/lib/performance-monitor';

/**
 * MonitoringProvider - Initializes error tracking and performance monitoring
 * This component should be placed high in the component tree to catch all errors
 */
export function MonitoringProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize global error handlers
    setupGlobalErrorHandlers();
    
    // Initialize Web Vitals tracking
    trackWebVitals();
    
    // Log initialization in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Monitoring initialized: Error tracking and performance monitoring active');
    }
  }, []);

  return <>{children}</>;
}

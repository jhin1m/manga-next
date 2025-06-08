/**
 * BFCache Provider Component
 * 
 * This provider component manages Back/Forward Cache functionality
 * across the entire application, providing context and optimization
 * for better user experience.
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useBFCache, type UseBFCacheOptions } from '@/hooks/useBfcache';
import { preloadCriticalResources, monitorBFCachePerformance } from '@/lib/cache/bfcache';

interface BFCacheContextValue {
  isSupported: boolean;
  isRestored: boolean;
  isEligible: boolean;
  eligibilityReasons: string[];
  isVisible: boolean;
  refreshData: () => void;
}

const BFCacheContext = createContext<BFCacheContextValue | null>(null);

interface BFCacheProviderProps {
  children: React.ReactNode;
  options?: UseBFCacheOptions;
}

/**
 * BFCache Provider Component
 */
export default function BFCacheProvider({ 
  children, 
  options = {} 
}: BFCacheProviderProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Default BFCache configuration
  const defaultOptions: UseBFCacheOptions = {
    autoOptimize: true,
    refreshOnRestore: true,
    enableLogging: process.env.NODE_ENV === 'development',
    onDataRefresh: () => {
      // Trigger a refresh of all data consumers
      setRefreshTrigger(prev => prev + 1);
    },
    onBFCacheRestore: () => {
      // Handle BFCache restore
      console.log('🔄 Application restored from BFCache');
      
      // Refresh any time-sensitive components
      setRefreshTrigger(prev => prev + 1);
      
      // Dispatch custom event for components to listen to
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('bfcache:restore', {
          detail: { timestamp: Date.now() }
        }));
      }
    },
    onBFCacheStore: () => {
      // Handle BFCache store
      console.log('💾 Application stored in BFCache');
      
      // Clean up any resources
      // Dispatch custom event for components to listen to
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('bfcache:store', {
          detail: { timestamp: Date.now() }
        }));
      }
    },
    ...options
  };

  // Use the BFCache hook with merged options
  const bfcacheState = useBFCache(defaultOptions);

  // Initialize performance monitoring and resource preloading
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Monitor BFCache performance
    monitorBFCachePerformance();

    // Preload critical resources for better BFCache performance
    const criticalResources = [
      // Add your critical CSS and JS files here
      '/_next/static/css/app.css',
      // Add other critical resources as needed
    ];

    preloadCriticalResources(criticalResources);

    // Add meta tag for BFCache optimization
    const metaTag = document.createElement('meta');
    metaTag.name = 'format-detection';
    metaTag.content = 'telephone=no';
    document.head.appendChild(metaTag);

    // Cleanup
    return () => {
      document.head.removeChild(metaTag);
    };
  }, []);

  // Context value
  const contextValue: BFCacheContextValue = {
    isSupported: bfcacheState.isSupported,
    isRestored: bfcacheState.isRestored,
    isEligible: bfcacheState.isEligible,
    eligibilityReasons: bfcacheState.eligibilityReasons,
    isVisible: bfcacheState.isVisible,
    refreshData: () => setRefreshTrigger(prev => prev + 1)
  };

  return (
    <BFCacheContext.Provider value={contextValue}>
      {children}
    </BFCacheContext.Provider>
  );
}

/**
 * Hook to use BFCache context
 */
export function useBFCacheContext(): BFCacheContextValue {
  const context = useContext(BFCacheContext);
  
  if (!context) {
    throw new Error('useBFCacheContext must be used within a BFCacheProvider');
  }
  
  return context;
}

/**
 * HOC to wrap components with BFCache data refresh functionality
 */
export function withBFCacheRefresh<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function BFCacheRefreshWrapper(props: P) {
    const { refreshData } = useBFCacheContext();
    
    // Listen for BFCache restore events
    useEffect(() => {
      const handleBFCacheRestore = () => {
        refreshData();
      };
      
      if (typeof window !== 'undefined') {
        window.addEventListener('bfcache:restore', handleBFCacheRestore);
        
        return () => {
          window.removeEventListener('bfcache:restore', handleBFCacheRestore);
        };
      }
    }, [refreshData]);
    
    return <Component {...props} />;
  };
}

/**
 * Component to display BFCache status (for development/debugging)
 */
export function BFCacheStatus() {
  const { 
    isSupported, 
    isRestored, 
    isEligible, 
    eligibilityReasons, 
    isVisible 
  } = useBFCacheContext();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div className="space-y-1">
        <div>BFCache: {isSupported ? '✅' : '❌'}</div>
        <div>Restored: {isRestored ? '✅' : '❌'}</div>
        <div>Eligible: {isEligible ? '✅' : '❌'}</div>
        <div>Visible: {isVisible ? '✅' : '❌'}</div>
        {!isEligible && eligibilityReasons.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div className="text-yellow-400">Issues:</div>
            {eligibilityReasons.map((reason, index) => (
              <div key={index} className="text-red-400">• {reason}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

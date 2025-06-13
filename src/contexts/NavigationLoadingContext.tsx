'use client';

import { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import FullScreenLoader, { LoaderPresets } from '@/components/ui/FullScreenLoader';
import { homepageCacheHelpers } from '@/lib/cache/hybrid-cache';

type LoaderConfig = {
  showLogo: boolean;
};

interface NavigationLoadingContextType {
  isLoading: boolean;
  triggerLoading: (targetPath?: string) => void;
  triggerHomeLoading: () => void;
  hideLoading: () => void;
}

const NavigationLoadingContext = createContext<NavigationLoadingContextType | undefined>(undefined);

export function NavigationLoadingProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState<LoaderConfig>(LoaderPresets.generic);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hideLoading = () => {
    setIsLoading(false);

    // Clear any pending timeouts
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    // navigationTimeoutRef no longer used since we removed the delay
  };

  const triggerLoading = (targetPath?: string) => {
    // Clear any existing timeouts
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    // navigationTimeoutRef no longer used

    // Set appropriate loading config based on target path
    if (targetPath === '/' || pathname === '/') {
      setLoadingConfig({ ...LoaderPresets.homepage });
    } else if (targetPath?.startsWith('/manga')) {
      setLoadingConfig({ ...LoaderPresets.manga });
    } else if (targetPath?.startsWith('/search')) {
      setLoadingConfig({ ...LoaderPresets.search });
    } else {
      setLoadingConfig({ ...LoaderPresets.generic });
    }

    setIsLoading(true);

    // Auto-hide after maximum wait time (fallback)
    loadingTimeoutRef.current = setTimeout(() => {
      hideLoading();
    }, 10000); // 10 seconds max
  };

  const triggerHomeLoading = () => {
    // Check if homepage data is cached for instant display
    const hasHomepageCache = homepageCacheHelpers.hasHomepageData(1);

    if (hasHomepageCache) {
      // If cached, navigate immediately without loading screen
      router.push('/');
    } else {
      // If not cached, show loading screen while navigating
      triggerLoading('/');
      router.push('/');
    }
  };

  return (
    <NavigationLoadingContext.Provider
      value={{
        isLoading,
        triggerLoading,
        triggerHomeLoading,
        hideLoading
      }}
    >
      {children}

      {/* Full Screen Loader Overlay */}
      <FullScreenLoader
        isVisible={isLoading}
        showLogo={loadingConfig.showLogo}
      />
    </NavigationLoadingContext.Provider>
  );
}

export function useNavigationLoading() {
  const context = useContext(NavigationLoadingContext);
  if (context === undefined) {
    throw new Error('useNavigationLoading must be used within a NavigationLoadingProvider');
  }
  return context;
}

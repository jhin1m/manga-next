'use client';

import { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import FullScreenLoader, { LoaderPresets } from '@/components/ui/FullScreenLoader';

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
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hideLoading = () => {
    setIsLoading(false);

    // Clear any pending timeouts
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = null;
    }
  };

  const triggerLoading = (targetPath?: string) => {
    // Clear any existing timeouts
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

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
    triggerLoading('/');

    // Navigate to home after showing loader
    navigationTimeoutRef.current = setTimeout(() => {
      router.push('/');
    }, 100); // Small delay to ensure loader shows first
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

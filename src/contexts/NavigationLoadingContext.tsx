'use client';

import { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface NavigationLoadingContextType {
  isLoading: boolean;
  triggerLoading: () => void;
}

const NavigationLoadingContext = createContext<NavigationLoadingContextType | undefined>(undefined);

export function NavigationLoadingProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerLoading = () => {
    if (pathname === '/') {
      setIsLoading(true);

      // Clear timeout cũ nếu có
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }

      // Immediate loading completion - no fake delay
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
      }, 0);
    }
  };

  return (
    <NavigationLoadingContext.Provider value={{ isLoading, triggerLoading }}>
      {children}
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

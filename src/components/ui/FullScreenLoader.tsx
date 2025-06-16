'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { seoConfig } from '@/config/seo.config';

interface FullScreenLoaderProps {
  isVisible: boolean;
  showLogo?: boolean;
  className?: string;
}

/**
 * Full-Screen Loading Overlay Component
 *
 * Features:
 * - Covers entire viewport including header/footer
 * - Smooth fade in/out animations
 * - Logo + spinner + text
 * - Prevents scrolling when active
 * - High z-index to cover everything
 */
export default function FullScreenLoader({
  isVisible,
  showLogo = true,
  className,
}: FullScreenLoaderProps) {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Show immediately
      setShouldRender(true);
      setIsAnimating(true);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
    } else {
      // Start fade out animation
      setIsAnimating(false);

      // Remove from DOM after animation
      const timer = setTimeout(() => {
        setShouldRender(false);
        // Restore body scroll
        document.body.style.overflow = '';
        document.body.style.height = '';
      }, 300); // Match animation duration

      return () => clearTimeout(timer);
    }

    return () => {
      // Cleanup on unmount
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, [isVisible]);

  if (!shouldRender) return null;

  return (
    <div
      className={cn(
        // Base styles
        'fixed inset-0 z-[9999] flex items-center justify-center',
        'bg-background',

        // Animation classes
        'transition-all duration-300 ease-in-out',
        isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95',

        className
      )}
      style={{
        // Ensure it covers everything
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
      }}
    >
      {/* Loading Content */}
      <div className='flex flex-col items-center justify-center space-y-6 text-center px-4'>
        {/* Logo Section */}
        {showLogo && (
          <div className='flex items-center justify-center mb-6'>
            <div className='relative'>
              {/* Site Logo */}
              <div className='flex items-center justify-center mb-2'>
                <img
                  src={seoConfig.urls.logo}
                  alt={seoConfig.site.name}
                  width={360}
                  height={120}
                  className='h-18 w-auto'
                />
              </div>
            </div>
          </div>
        )}

        {/* Spinner */}
        <div className='relative'>
          <Loader2 className='h-12 w-12 animate-spin text-primary' />

          {/* Outer ring animation */}
          <div className='absolute inset-0 rounded-full border-2 border-primary/10 animate-ping' />
        </div>

        {/* Text Content */}
        <div className='space-y-2 max-w-sm text-center'>
          <h2 className='text-xl font-semibold text-foreground'>{seoConfig.site.name}</h2>
          <p className='text-sm text-muted-foreground'>{seoConfig.site.tagline}</p>
        </div>

        {/* Progress Dots */}
        <div className='flex space-x-1'>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={cn(
                'w-2 h-2 rounded-full bg-primary/40',
                i === 0 && 'loading-dot-1',
                i === 1 && 'loading-dot-2',
                i === 2 && 'loading-dot-3'
              )}
            />
          ))}
        </div>

        {/* Loading Tips */}
        <div className='mt-8 text-xs text-muted-foreground/70 max-w-xs'>
          <p>💡 Mẹo: Bookmark trang để truy cập nhanh hơn</p>
        </div>
      </div>

      {/* Background Pattern (Optional) */}
      <div className='absolute inset-0 opacity-5 pointer-events-none'>
        <div className='absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5' />
        <div
          className='absolute inset-0 opacity-20'
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(var(--primary), 0.1) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, rgba(var(--primary), 0.1) 0%, transparent 50%)`,
          }}
        />
      </div>
    </div>
  );
}

/**
 * Hook for managing full-screen loader state
 */
export function useFullScreenLoader() {
  const [isLoading, setIsLoading] = useState(false);

  const showLoader = () => {
    setIsLoading(true);
  };

  const hideLoader = () => {
    setIsLoading(false);
  };

  return {
    isLoading,
    showLoader,
    hideLoader,
  };
}

/**
 * Preset configurations for different loading scenarios
 */
export const LoaderPresets = {
  homepage: {
    showLogo: true,
  },

  manga: {
    showLogo: true,
  },

  search: {
    showLogo: false,
  },

  generic: {
    showLogo: false,
  },
} as const;

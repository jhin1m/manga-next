'use client';

import { useNavigationProgress } from '@/hooks/useNavigationProgress';
import { cn } from '@/lib/utils';

interface NavigationProgressProps {
  className?: string;
  height?: number;
  color?: string;
}

/**
 * Navigation progress bar component
 * Shows a smooth loading animation during page transitions
 * Positioned at the top of the page with fixed positioning
 */
export function NavigationProgress({ 
  className,
  height = 3,
  color = 'bg-primary'
}: NavigationProgressProps) {
  const { isLoading, progress } = useNavigationProgress();

  if (!isLoading) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-[9999] overflow-hidden',
        className
      )}
      style={{ height: `${height}px` }}
    >
      {/* Background track */}
      <div className="absolute inset-0 bg-muted/20" />
      
      {/* Progress bar */}
      <div
        className={cn(
          'absolute top-0 left-0 h-full navigation-progress',
          color
        )}
        style={{
          width: `${progress}%`,
        }}
      />

      {/* Animated shimmer effect */}
      <div
        className={cn(
          'absolute top-0 h-full w-24 opacity-50',
          'bg-gradient-to-r from-transparent via-white/40 to-transparent',
          'navigation-progress-shimmer'
        )}
        style={{
          left: `${Math.max(0, progress - 15)}%`,
          display: progress > 5 && progress < 95 ? 'block' : 'none',
        }}
      />
    </div>
  );
}

/**
 * Simplified navigation progress bar with default styling
 * Matches the manga website's design system
 */
export function SimpleNavigationProgress() {
  return (
    <NavigationProgress
      height={2}
      color="bg-gradient-to-r from-primary via-primary/80 to-primary"
      className="shadow-sm"
    />
  );
}

export default NavigationProgress;

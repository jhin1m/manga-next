'use client';

import { useNavigationLoading } from '@/hooks/useNavigationLoading';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface HomeNavigationLinkProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * Enhanced Home Navigation Link
 * Automatically triggers full-screen loading when navigating to homepage
 * Works for any clickable element (buttons, links, etc.)
 */
export default function HomeNavigationLink({ 
  children, 
  className, 
  onClick 
}: HomeNavigationLinkProps) {
  const { triggerHomeLoading } = useNavigationLoading();
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Execute custom onClick if provided
    if (onClick) {
      onClick();
    }
    
    if (pathname === '/') {
      // If already on homepage, just scroll to top with loading effect
      triggerHomeLoading();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Navigate to homepage with full-screen loading
      triggerHomeLoading();
    }
  };

  return (
    <div
      className={className}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      {children}
    </div>
  );
}

/**
 * Hook for programmatic home navigation with loading
 */
export function useHomeNavigation() {
  const { triggerHomeLoading } = useNavigationLoading();
  const pathname = usePathname();

  const navigateToHome = () => {
    if (pathname === '/') {
      // If already on homepage, just scroll to top with loading effect
      triggerHomeLoading();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Navigate to homepage with full-screen loading
      triggerHomeLoading();
    }
  };

  return { navigateToHome };
}

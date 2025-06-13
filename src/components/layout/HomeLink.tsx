'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNavigationLoading } from '@/hooks/useNavigationLoading';
import { useInstantHomepage } from '@/hooks/useHomepageData';

interface HomeLinkProps {
  children: React.ReactNode;
  className?: string;
}

export default function HomeLink({ children, className }: HomeLinkProps) {
  const pathname = usePathname();
  const { triggerHomeLoading } = useNavigationLoading();
  const { isHomepageCached, preloadHomepage } = useInstantHomepage();

  // Preload on hover for instant navigation
  const handleMouseEnter = () => {
    if (pathname !== '/') {
      preloadHomepage();
    }
  };

  // Preload on focus for keyboard navigation
  const handleFocus = () => {
    if (pathname !== '/') {
      preloadHomepage();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Always prevent default and use our loading system
    e.preventDefault();

    if (pathname === '/') {
      // If already on homepage, just scroll to top with loading effect
      triggerHomeLoading();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Navigate to homepage - use instant navigation if cached
      triggerHomeLoading();
    }
  };

  return (
    <Link
      href="/"
      className={className}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
    >
      {children}
    </Link>
  );
}

'use client';

import { useRouteDetection } from '@/hooks/useRouteDetection';
import { useState, useEffect } from 'react';

interface MainContentProps {
  children: React.ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  const { shouldHeaderBeSticky, isChapterPage } = useRouteDetection();
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch by only applying route-based styling after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use safe defaults during SSR/hydration
  const safeIsChapterPage = isMounted ? isChapterPage : false;
  const safeShouldHeaderBeSticky = isMounted ? shouldHeaderBeSticky : true;

  return (
    <div className="relative flex-grow">
      {/* Background Pattern */}
      <div className="absolute inset-x-0 top-0 h-1/12 md:h-1/4 bg-gradient-to-b from-primary/5 via-primary/5 to-transparent pointer-events-none z-0"/>
      <main className={`relative z-10 ${
        safeIsChapterPage
          ? '' // No container constraints for chapter pages
          : 'container mx-auto px-4 py-6 sm:px-14 2xl:px-25'
      } ${
        safeShouldHeaderBeSticky ? 'pt-6' : 'pt-6'
      }`}>
        {children}
      </main>
    </div>
  );
}
'use client';

import { useRouteDetection } from '@/hooks/useRouteDetection';

interface MainContentProps {
  children: React.ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  const { shouldHeaderBeSticky, isChapterPage } = useRouteDetection();

  return (
    <main className={`flex-grow ${
      isChapterPage
        ? '' // No container constraints for chapter pages
        : 'container mx-auto px-4 py-6 sm:px-14 2xl:px-25'
    } ${
      shouldHeaderBeSticky ? 'pt-6' : 'pt-6'
    }`}>
      {children}
    </main>
  );
}

'use client';

import { usePathname } from 'next/navigation';

export function useRouteDetection() {
  const pathname = usePathname();

  // Check if current route is a chapter reading page
  // Pattern: /manga/[slug]/[chapterSlug]
  const isChapterPage = /^\/manga\/[^\/]+\/[^\/]+$/.test(pathname);

  // Check if current route is a manga detail page
  // Pattern: /manga/[slug] (but not /manga/[slug]/[chapterSlug])
  const isMangaDetailPage = /^\/manga\/[^\/]+$/.test(pathname);

  // Check if current route is manga listing page
  const isMangaListPage = pathname === '/manga';

  // Check if current route is home page
  const isHomePage = pathname === '/';

  // Check if current route is auth page
  const isAuthPage = pathname.startsWith('/auth');

  // Check if current route is profile page
  const isProfilePage = pathname.startsWith('/profile');

  // Check if current route is search page
  const isSearchPage = pathname.startsWith('/search');

  // Determine if header should be sticky
  const shouldHeaderBeSticky = !isChapterPage;

  return {
    pathname,
    isChapterPage,
    isMangaDetailPage,
    isMangaListPage,
    isHomePage,
    isAuthPage,
    isProfilePage,
    isSearchPage,
    shouldHeaderBeSticky,
  };
}

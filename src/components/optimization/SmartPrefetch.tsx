'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface SmartPrefetchProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetchOnHover?: boolean;
  prefetchOnView?: boolean;
  viewThreshold?: number;
}

/**
 * Smart prefetching component that prefetches pages based on user interaction
 * - Prefetch on hover/focus for immediate navigation
 * - Prefetch on view for visible links
 * - Intersection Observer for viewport detection
 */
export default function SmartPrefetch({
  href,
  children,
  className,
  prefetchOnHover = true,
  prefetchOnView = true,
  viewThreshold = 0.1,
}: SmartPrefetchProps) {
  const router = useRouter();
  const linkRef = useRef<HTMLAnchorElement>(null);
  const prefetchedRef = useRef(false);

  // Prefetch function
  const prefetchPage = () => {
    if (!prefetchedRef.current) {
      router.prefetch(href);
      prefetchedRef.current = true;
    }
  };

  // Intersection Observer for viewport prefetching
  useEffect(() => {
    if (!prefetchOnView || !linkRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            prefetchPage();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: viewThreshold }
    );

    observer.observe(linkRef.current);

    return () => observer.disconnect();
  }, [prefetchOnView, viewThreshold]);

  // Handle hover/focus prefetching
  const handleMouseEnter = () => {
    if (prefetchOnHover) {
      prefetchPage();
    }
  };

  const handleFocus = () => {
    if (prefetchOnHover) {
      prefetchPage();
    }
  };

  return (
    <a
      ref={linkRef}
      href={href}
      className={className}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
      onClick={(e) => {
        e.preventDefault();
        router.push(href);
      }}
    >
      {children}
    </a>
  );
}

// Hook for manual prefetching
export function usePrefetch() {
  const router = useRouter();
  const prefetchedUrls = useRef(new Set<string>());

  const prefetch = (url: string) => {
    if (!prefetchedUrls.current.has(url)) {
      router.prefetch(url);
      prefetchedUrls.current.add(url);
    }
  };

  const prefetchMultiple = (urls: string[]) => {
    urls.forEach(prefetch);
  };

  return { prefetch, prefetchMultiple };
}

// Component for prefetching visible manga cards
interface MangaPrefetchProps {
  manga: Array<{ slug: string }>;
  threshold?: number;
}

export function MangaPrefetch({ manga, threshold = 0.1 }: MangaPrefetchProps) {
  const { prefetchMultiple } = usePrefetch();

  useEffect(() => {
    // Prefetch manga detail pages for visible items
    const urls = manga.map(item => `/manga/${item.slug}`);
    prefetchMultiple(urls);
  }, [manga, prefetchMultiple]);

  return null;
}

'use client';

import { useEffect } from 'react';
import { trackPageView, trackEvent } from './Analytics';

interface MangaPageTrackerProps {
  pageTitle: string;
  sort?: string;
  status?: string;
  genre?: string;
  page: number;
  totalResults: number;
}

/**
 * Client component to track manga page views and interactions
 * This component handles analytics tracking for manga list pages
 */
export default function MangaPageTracker({
  pageTitle,
  sort,
  status,
  genre,
  page,
  totalResults,
}: MangaPageTrackerProps) {
  useEffect(() => {
    // Track page view
    const currentUrl = window.location.href;
    trackPageView(currentUrl, pageTitle);

    // Track manga list view event
    trackEvent('manga_list_view', {
      page_title: pageTitle,
      sort_type: sort || 'latest',
      status_filter: status || 'all',
      genre_filter: genre || 'all',
      page_number: page,
      total_results: totalResults,
      content_type: 'manga_list',
    });

    // Track specific filter usage
    if (sort && sort !== 'latest') {
      trackEvent('filter_usage', {
        filter_type: 'sort',
        filter_value: sort,
        page_type: 'manga_list',
      });
    }

    if (status) {
      trackEvent('filter_usage', {
        filter_type: 'status',
        filter_value: status,
        page_type: 'manga_list',
      });
    }

    if (genre) {
      trackEvent('filter_usage', {
        filter_type: 'genre',
        filter_value: genre,
        page_type: 'manga_list',
      });
    }

    // Track pagination usage
    if (page > 1) {
      trackEvent('pagination_usage', {
        page_number: page,
        page_type: 'manga_list',
        total_results: totalResults,
      });
    }
  }, [pageTitle, sort, status, genre, page, totalResults]);

  // This component doesn't render anything visible
  return null;
}

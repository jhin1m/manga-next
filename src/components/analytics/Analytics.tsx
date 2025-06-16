'use client';

import Script from 'next/script';
import {
  getGoogleAnalyticsId,
  getGoogleTagManagerId,
  getFacebookPixelId,
  isProduction,
} from '@/config/seo.config';

/**
 * Analytics Component
 * Handles Google Analytics, Google Tag Manager, and Facebook Pixel integration
 * Only loads in production environment
 */
export default function Analytics() {
  const googleAnalyticsId = getGoogleAnalyticsId();
  const googleTagManagerId = getGoogleTagManagerId();
  const facebookPixelId = getFacebookPixelId();

  // Only load analytics in production
  if (!isProduction()) {
    return null;
  }

  return (
    <>
      {/* Google Analytics */}
      {googleAnalyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            strategy='afterInteractive'
          />
          <Script id='google-analytics' strategy='afterInteractive'>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAnalyticsId}', {
                page_title: document.title,
                page_location: window.location.href,
              });
            `}
          </Script>
        </>
      )}

      {/* Google Tag Manager */}
      {googleTagManagerId && (
        <>
          <Script id='google-tag-manager' strategy='afterInteractive'>
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${googleTagManagerId}');
            `}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${googleTagManagerId}`}
              height='0'
              width='0'
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}

      {/* Facebook Pixel */}
      {facebookPixelId && (
        <Script id='facebook-pixel' strategy='afterInteractive'>
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${facebookPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  );
}

// Analytics event tracking helpers
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (!isProduction()) return;

  // Google Analytics 4 event tracking
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, parameters);
  }

  // Facebook Pixel event tracking
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, parameters);
  }
};

// Page view tracking
export const trackPageView = (url: string, title?: string) => {
  if (!isProduction()) return;

  // Google Analytics page view
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', getGoogleAnalyticsId(), {
      page_title: title || document.title,
      page_location: url,
    });
  }

  // Facebook Pixel page view
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'PageView');
  }
};

// Manga-specific tracking events
export const trackMangaView = (mangaId: string, mangaTitle: string) => {
  trackEvent('manga_view', {
    manga_id: mangaId,
    manga_title: mangaTitle,
    content_type: 'manga',
  });
};

export const trackChapterRead = (mangaId: string, chapterId: string, chapterNumber: number) => {
  trackEvent('chapter_read', {
    manga_id: mangaId,
    chapter_id: chapterId,
    chapter_number: chapterNumber,
    content_type: 'chapter',
  });
};

export const trackSearch = (query: string, resultsCount: number) => {
  trackEvent('search', {
    search_term: query,
    results_count: resultsCount,
  });
};

export const trackBookmark = (mangaId: string, action: 'add' | 'remove') => {
  trackEvent('bookmark', {
    manga_id: mangaId,
    action,
  });
};

export const trackRating = (mangaId: string, rating: number) => {
  trackEvent('rating', {
    manga_id: mangaId,
    rating,
  });
};

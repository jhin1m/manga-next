/**
 * Centralized SEO Configuration
 * This file can be gitignored for sensitive production values
 */

// Default configuration that works for all environments
const defaultSeoConfig = {
  site: {
    name: 'Manga Next',
    tagline: '無料漫画サイト',
    description: '無料で漫画が読めるサイト。人気漫画から名作漫画まで幅広く揃えています。',
    keywords: ['manga', 'comic', 'read manga', 'free manga', 'online manga', 'Manga Next'],
    language: 'ja',
    locale: 'ja_JP',
  },
  
  urls: {
    base: 'http://localhost:3000', // Fallback for development
    logo: '/logo.png',
    favicon: '/favicon.ico',
    ogImage: '/images/og-image.jpg',
  },
  
  social: {
    twitter: {
      card: 'summary_large_image' as const,
      site: '@Manga Next',
      creator: '@Manga Next',
    },
    openGraph: {
      type: 'website' as const,
      siteName: 'Manga Next',
      locale: 'ja_JP',
    },
  },
  
  seo: {
    titleTemplate: '%s | Manga Next',
    defaultTitle: 'Manga Next - 無料漫画サイト',
    titleSeparator: ' | ',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  },
  
  schema: {
    organization: {
      name: 'Manga Next',
      legalName: 'Manga Next Manga Platform',
      foundingDate: '2024',
      founders: [
        {
          '@type': 'Person',
          name: 'Manga Next Team',
        },
      ],
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'JP',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        availableLanguage: ['Japanese', 'English'],
      },
    },
    website: {
      inLanguage: 'ja',
      isAccessibleForFree: true,
      isFamilyFriendly: true,
      audience: {
        '@type': 'Audience',
        audienceType: 'manga readers',
      },
    },
  },
} as const;

// Environment-based overrides
const getEnvironmentConfig = () => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                  process.env.NEXT_PUBLIC_API_URL || 
                  defaultSeoConfig.urls.base;
  
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || defaultSeoConfig.site.name;
  const siteDescription = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || defaultSeoConfig.site.description;
  
  return {
    urls: {
      ...defaultSeoConfig.urls,
      base: baseUrl,
      logo: `${baseUrl}/logo.png`,
      ogImage: `${baseUrl}/images/og-image.jpg`,
    },
    site: {
      ...defaultSeoConfig.site,
      name: siteName,
      description: siteDescription,
    },
    social: {
      ...defaultSeoConfig.social,
      openGraph: {
        ...defaultSeoConfig.social.openGraph,
        siteName,
      },
    },
  };
};

// Final merged configuration
export const seoConfig = {
  ...defaultSeoConfig,
  ...getEnvironmentConfig(),
} as const;

// Type exports for better TypeScript support
export type SeoConfig = typeof seoConfig;
export type SiteConfig = typeof seoConfig.site;
export type UrlConfig = typeof seoConfig.urls;
export type SocialConfig = typeof seoConfig.social;
export type SchemaConfig = typeof seoConfig.schema;

// Validation function
export const validateSeoConfig = (): boolean => {
  const required = [
    seoConfig.site.name,
    seoConfig.site.description,
    seoConfig.urls.base,
  ];
  
  return required.every(field => field && field.length > 0);
};

// Helper functions
export const getSiteUrl = (path: string = ''): string => {
  const baseUrl = seoConfig.urls.base.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

export const getPageTitle = (title?: string): string => {
  if (!title) return seoConfig.seo.defaultTitle;
  return seoConfig.seo.titleTemplate.replace('%s', title);
};

export default seoConfig;

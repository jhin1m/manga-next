/**
 * SEO Configuration Template
 * Copy this file to seo.config.ts and customize for your environment
 * 
 * Environment Variables (optional):
 * - NEXT_PUBLIC_SITE_URL: Your site's base URL
 * - NEXT_PUBLIC_SITE_NAME: Your site's name
 * - NEXT_PUBLIC_SITE_DESCRIPTION: Your site's description
 */

// Default configuration that works for all environments
const defaultSeoConfig = {
  site: {
    name: 'Your Manga Site',
    tagline: 'Free Manga Reading',
    description: 'Read manga online for free. Discover popular manga series and latest updates.',
    keywords: ['manga', 'comic', 'read manga', 'free manga', 'online manga'],
    language: 'en', // or 'ja' for Japanese
    locale: 'en_US', // or 'ja_JP' for Japanese
  },
  
  urls: {
    base: 'https://your-domain.com', // Change this to your production URL
    logo: '/logo.png',
    favicon: '/favicon.ico',
    ogImage: '/images/og-image.jpg',
  },
  
  social: {
    twitter: {
      card: 'summary_large_image' as const,
      site: '@your_twitter',
      creator: '@your_twitter',
    },
    openGraph: {
      type: 'website' as const,
      siteName: 'Your Manga Site',
      locale: 'en_US',
    },
  },
  
  seo: {
    titleTemplate: '%s | Your Manga Site',
    defaultTitle: 'Your Manga Site - Free Manga Reading',
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
      name: 'Your Manga Site',
      legalName: 'Your Manga Platform',
      foundingDate: '2024',
      founders: [
        {
          '@type': 'Person',
          name: 'Your Team',
        },
      ],
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'US', // Change to your country
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        availableLanguage: ['English'],
      },
    },
    website: {
      inLanguage: 'en',
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

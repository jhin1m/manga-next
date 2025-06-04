import { MetadataRoute } from 'next'
import { seoConfig } from '@/config/seo.config'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: seoConfig.site.name,
    short_name: seoConfig.site.name,
    description: seoConfig.site.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    orientation: 'portrait',
    scope: '/',
    lang: seoConfig.site.language,
    categories: ['entertainment', 'books', 'comics'],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any'
      }
    ],
    screenshots: [
      {
        src: '/images/screenshot-wide.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide'
      },
      {
        src: '/images/screenshot-narrow.png', 
        sizes: '720x1280',
        type: 'image/png',
        form_factor: 'narrow'
      }
    ]
  }
}

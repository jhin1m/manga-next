# PWA Implementation Guide

## Overview

This guide covers the Progressive Web App (PWA) implementation for the manga website, providing offline functionality, app-like experience, and installation capabilities.

## ✅ Implementation Status

**PWA is now fully implemented and working!** The manga website now supports:
- ✅ Web App Manifest with proper configuration
- ✅ Service Worker for offline caching
- ✅ Install prompt for supported browsers
- ✅ Offline indicator for network status
- ✅ PWA-optimized viewport and theme configuration
- ✅ NextJS 15 compatibility with proper metadata/viewport separation

## Features Implemented

### ✅ Core PWA Features
- **Web App Manifest** - App metadata and installation configuration
- **Service Worker** - Offline caching and background sync
- **App Installation** - Install prompt for supported browsers
- **Offline Indicator** - Network status awareness
- **Responsive Design** - Mobile-first approach

### ✅ Caching Strategy
- **Static Assets** - Fonts, images, CSS, JS files cached
- **API Responses** - Network-first with fallback to cache
- **Images** - Stale-while-revalidate for optimal performance
- **Fonts** - Cache-first for Google Fonts

## File Structure

```
src/
├── app/
│   ├── manifest.ts              # PWA manifest configuration
│   └── layout.tsx               # PWA metadata and components
├── components/pwa/
│   ├── PWAInstallPrompt.tsx     # Installation prompt component
│   └── OfflineIndicator.tsx     # Network status indicator
└── messages/
    ├── en.json                  # English PWA translations
    └── vi.json                  # Vietnamese PWA translations

public/
├── icon-192.png                 # PWA icon 192x192
├── icon-512.png                 # PWA icon 512x512
└── images/
    ├── screenshot-wide.png      # Desktop screenshot
    └── screenshot-narrow.png    # Mobile screenshot

next.config.ts                   # PWA configuration with next-pwa
```

## Configuration

### Web App Manifest (`src/app/manifest.ts`)
```typescript
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: seoConfig.site.name,
    short_name: seoConfig.site.name,
    description: seoConfig.site.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    orientation: 'portrait',
    scope: '/',
    categories: ['entertainment', 'books', 'comics'],
    icons: [
      // PWA icons configuration
    ],
    screenshots: [
      // App screenshots for installation
    ]
  }
}
```

### Service Worker Configuration (`next.config.ts`)
```typescript
const withPWAConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    // Comprehensive caching strategies
  ],
});
```

## Components

### PWA Install Prompt
- Detects installation capability
- Shows native install prompt
- Handles iOS-specific instructions
- Dismissible with localStorage persistence

### Offline Indicator
- Real-time network status monitoring
- Visual feedback for offline/online states
- Auto-hide when connection restored

## Usage

### Development
```bash
# PWA is disabled in development mode
pnpm dev
```

### Production Build
```bash
# Build with PWA enabled
pnpm build
pnpm start
```

### Generate PWA Assets
```bash
# Generate screenshot placeholders
pnpm run generate:pwa-screenshots
```

## Testing PWA Features

### Installation Testing
1. Build and serve the production app
2. Open in Chrome/Edge (desktop or mobile)
3. Look for install prompt in address bar
4. Test installation flow

### Offline Testing
1. Open DevTools → Network tab
2. Check "Offline" checkbox
3. Navigate the app to test cached content
4. Verify offline indicator appears

### Lighthouse PWA Audit
1. Open DevTools → Lighthouse tab
2. Select "Progressive Web App" category
3. Run audit to check PWA compliance
4. Address any issues found

## Browser Support

### Installation Support
- ✅ Chrome (Android/Desktop)
- ✅ Edge (Windows/Android)
- ✅ Safari (iOS) - Manual installation
- ✅ Firefox (Android) - Limited support

### Service Worker Support
- ✅ All modern browsers
- ✅ iOS Safari 11.1+
- ✅ Android Chrome/Firefox

## Customization

### Theme Colors
Update in `src/app/manifest.ts`:
```typescript
background_color: '#your-color',
theme_color: '#your-color',
```

### Caching Strategies
Modify `next.config.ts` runtime caching:
```typescript
runtimeCaching: [
  {
    urlPattern: /your-pattern/,
    handler: 'CacheFirst', // or NetworkFirst, StaleWhileRevalidate
    options: {
      cacheName: 'your-cache-name',
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      },
    },
  },
]
```

### Install Prompt Customization
Edit `src/components/pwa/PWAInstallPrompt.tsx`:
- Modify appearance and behavior
- Add custom triggers
- Customize dismissal logic

## Production Considerations

### Screenshots
Replace placeholder screenshots in `public/images/`:
- `screenshot-wide.png` (1280x720) - Desktop view
- `screenshot-narrow.png` (720x1280) - Mobile view

### Icons
Ensure PWA icons are optimized:
- `icon-192.png` - 192x192 pixels
- `icon-512.png` - 512x512 pixels
- Use maskable icons for better Android integration

### Performance
- Monitor cache sizes and cleanup old caches
- Test offline functionality thoroughly
- Optimize service worker registration

## Troubleshooting

### Common Issues
1. **PWA not installable**: Check manifest validation and HTTPS requirement
2. **Service worker not updating**: Clear browser cache or use skipWaiting
3. **Icons not showing**: Verify icon paths and sizes in manifest
4. **Offline content not working**: Check service worker caching strategies

### Debug Tools
- Chrome DevTools → Application tab
- Lighthouse PWA audit
- PWA Builder validation tools

## Future Enhancements

### Planned Features
- [ ] Background sync for reading progress
- [ ] Push notifications for new chapters
- [ ] Advanced offline reading capabilities
- [ ] App shortcuts for quick actions

### Performance Optimizations
- [ ] Implement workbox strategies
- [ ] Add cache versioning
- [ ] Optimize bundle splitting for PWA

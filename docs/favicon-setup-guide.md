# Favicon Configuration Guide for NextJS 15

## Current Setup
Your project already has a basic favicon setup with `src/app/favicon.ico`. NextJS 15 automatically serves this as the favicon.

## Complete Favicon Setup

### 1. Required Files in `src/app/` directory:

```
src/app/
├── favicon.ico          # 32x32 ICO format (already exists)
├── icon.png            # 32x32 PNG format
├── icon.svg            # SVG format (recommended)
├── apple-icon.png      # 180x180 for iOS
└── manifest.json       # Web app manifest (optional)
```

### 2. File Specifications:

- **favicon.ico**: 32x32px, ICO format
- **icon.png**: 32x32px, PNG format  
- **icon.svg**: Vector format, scalable
- **apple-icon.png**: 180x180px, PNG format for iOS devices

### 3. Advanced Configuration

#### Option A: Static Files (Recommended)
Place these files directly in `src/app/`:

```typescript
// NextJS automatically detects these files:
// - favicon.ico
// - icon.png or icon.svg
// - apple-icon.png
// - manifest.json
```

#### Option B: Dynamic Icons
Create `src/app/icon.tsx` for dynamic favicon:

```typescript
import { ImageResponse } from 'next/og'

export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'linear-gradient(90deg, #000 0%, #333 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '20%',
        }}
      >
        M
      </div>
    ),
    {
      ...size,
    }
  )
}
```

### 4. Web App Manifest (Optional)

Create `src/app/manifest.json`:

```json
{
  "name": "Manga Next",
  "short_name": "MangaNext",
  "description": "Read Manga Online for Free",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png", 
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 5. SEO Configuration

Your project already has favicon configured in SEO config:

```typescript
// src/config/seo.config.ts
urls: {
  favicon: '/favicon.ico',
  // This is automatically handled by NextJS
}
```

### 6. Testing Favicon

1. **Development**: Visit `http://localhost:3000/favicon.ico`
2. **Production**: Check browser tab for favicon
3. **Mobile**: Test on iOS/Android devices
4. **Tools**: Use favicon checkers online

### 7. Best Practices

- Use SVG format for scalability
- Ensure high contrast for visibility
- Test on different backgrounds (light/dark)
- Keep design simple and recognizable
- Use consistent branding colors

### 8. Generate Icons Script

To create favicon.ico and all icon sizes:

```bash
# Install required packages
pnpm add sharp to-ico

# Generate all icons
pnpm run generate:icons
```

The script will create:
- favicon.ico (32x32)
- favicon-*.png (16x16 to 144x144)
- icon-*.png (192x192 to 512x512)
- apple-touch-icon-*.png (57x57 to 180x180)

### 9. Troubleshooting

- Clear browser cache if favicon doesn't update
- Check file paths and naming conventions
- Verify file sizes and formats
- Test in incognito/private browsing mode
- If ICO generation fails, install: `pnpm add to-ico`

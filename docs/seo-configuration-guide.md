# SEO Configuration Guide

## 📋 **Overview**

This guide explains the centralized SEO configuration system implemented for the manga website. The system provides a unified approach to managing metadata, Open Graph tags, JSON-LD schema, and site configuration across all pages.

## 🏗️ **Architecture**

### **Configuration Files**

```
src/config/
├── seo.config.ts          # Main SEO configuration (can be gitignored)
├── seo.config.example.ts  # Template for developers
└── site.constants.ts      # Static site constants

src/lib/seo/
├── types.ts               # TypeScript definitions
├── templates.ts           # SEO templates for different page types
├── metadata.ts            # Enhanced metadata utilities
└── jsonld.ts              # JSON-LD schema generators
```

### **Environment Variables**

```bash
# Optional SEO overrides in .env
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
NEXT_PUBLIC_SITE_NAME="Your Site Name"
NEXT_PUBLIC_SITE_DESCRIPTION="Your site description"
```

## 🔧 **Configuration**

### **Basic Setup**

1. **Copy the example config:**

   ```bash
   cp src/config/seo.config.example.ts src/config/seo.config.ts
   ```

2. **Customize your settings:**

   ```typescript
   // src/config/seo.config.ts
   const defaultSeoConfig = {
     site: {
       name: 'Your Manga Site',
       description: 'Your site description',
       keywords: ['manga', 'comic', 'read manga'],
       language: 'en', // or 'ja'
       locale: 'en_US', // or 'ja_JP'
     },
     urls: {
       base: 'https://your-domain.com',
       logo: '/logo.png',
       ogImage: '/images/og-image.jpg',
     },
     // ... more config
   };
   ```

3. **Set environment variables (optional):**
   ```bash
   # .env.local
   NEXT_PUBLIC_SITE_URL="https://your-domain.com"
   NEXT_PUBLIC_SITE_NAME="Your Site Name"
   NEXT_PUBLIC_SITE_DESCRIPTION="Your description"
   ```

### **Environment-Based Configuration**

The system supports different configurations for development, staging, and production:

- **Development**: Uses `http://localhost:3000` as fallback
- **Staging**: Override with `NEXT_PUBLIC_SITE_URL`
- **Production**: Set production URL in environment variables

## 📝 **Usage**

### **Page Metadata**

#### **Basic Usage**

```typescript
import { constructMetadata } from '@/lib/seo/metadata';

export const metadata = constructMetadata({
  title: 'Page Title',
  description: 'Page description',
  keywords: ['keyword1', 'keyword2'],
});
```

#### **Manga Pages**

```typescript
import { constructMangaMetadata } from '@/lib/seo/metadata';

export const metadata = constructMangaMetadata({
  title: manga.title,
  description: manga.description,
  coverImage: manga.coverImage,
  author: manga.author,
  genres: manga.genres,
  slug: manga.slug,
  publishedAt: manga.createdAt,
  updatedAt: manga.updatedAt,
});
```

#### **Chapter Pages**

```typescript
import { constructChapterMetadata } from '@/lib/seo/metadata';

export const metadata = constructChapterMetadata({
  manga: {
    title: manga.title,
    slug: manga.slug,
    coverImage: manga.coverImage,
    genres: manga.genres,
  },
  chapter: {
    number: chapter.number,
    title: chapter.title,
    images: chapter.images,
    publishedAt: chapter.createdAt,
    updatedAt: chapter.updatedAt,
  },
  chapterSlug: chapter.slug,
});
```

### **JSON-LD Schema**

#### **Manga Schema**

```typescript
import { generateMangaJsonLd } from '@/lib/seo/jsonld';
import JsonLdScript from '@/components/seo/JsonLdScript';

const jsonLd = generateMangaJsonLd({
  title: manga.title,
  description: manga.description,
  coverImage: manga.coverImage,
  author: manga.author,
  genres: manga.genres,
  slug: manga.slug,
  publishedAt: manga.createdAt,
  updatedAt: manga.updatedAt,
});

// In your component
<JsonLdScript jsonLd={jsonLd} id="manga-schema" />
```

#### **Chapter Schema**

```typescript
import { generateChapterJsonLd } from '@/lib/seo/jsonld';

const jsonLd = generateChapterJsonLd({
  manga: { title, slug, coverImage, genres },
  chapter: { number, title, images, publishedAt, updatedAt },
  chapterSlug: chapter.slug,
});
```

## 🎨 **Templates**

The system includes pre-built templates for different page types:

### **Available Templates**

- `manga`: For manga detail pages
- `chapter`: For chapter reading pages
- `genre`: For genre listing pages
- `search`: For search result pages
- `profile`: For user profile pages

### **Custom Templates**

```typescript
import { getMangaTemplate } from '@/lib/seo/templates';

const template = getMangaTemplate({
  title: 'One Piece',
  description: 'Epic pirate adventure',
  genres: ['Action', 'Adventure'],
  author: 'Eiichiro Oda',
});

// Returns:
// {
//   title: 'One Piece - Read Online Free | Manga Next',
//   description: 'Read One Piece manga online for free...',
//   keywords: ['One Piece', 'manga', 'Action', 'Adventure'],
//   type: 'article'
// }
```

## 🔍 **SEO Best Practices**

### **Title Optimization**

- Use descriptive, unique titles for each page
- Include primary keywords naturally
- Keep titles under 60 characters
- Follow the pattern: `{Content} | {Site Name}`

### **Description Optimization**

- Write compelling meta descriptions (150-160 characters)
- Include target keywords naturally
- Make each description unique
- Include a call-to-action when appropriate

### **Image Optimization**

- Use high-quality Open Graph images (1200x630px)
- Include alt text for all images
- Optimize file sizes for fast loading
- Use WebP format when possible

### **Schema Markup**

- Implement relevant JSON-LD schemas
- Use specific types (Book, Chapter, Organization)
- Include all required properties
- Validate with Google's Rich Results Test

## 🚀 **Deployment**

### **Production Checklist**

1. **Update production URLs:**

   ```bash
   NEXT_PUBLIC_SITE_URL="https://your-domain.com"
   ```

2. **Verify configuration:**

   ```typescript
   import { validateSeoConfig } from '@/config/seo.config';
   console.log(validateSeoConfig()); // Should return true
   ```

3. **Test SEO elements:**
   - Check meta tags in browser dev tools
   - Validate JSON-LD with Google's tool
   - Test Open Graph with Facebook debugger
   - Verify sitemap generation

### **Environment Variables for Production**

```bash
# Required
NEXT_PUBLIC_SITE_URL="https://your-domain.com"

# Optional (uses config defaults if not set)
NEXT_PUBLIC_SITE_NAME="Your Site Name"
NEXT_PUBLIC_SITE_DESCRIPTION="Your description"
```

## 🔧 **Troubleshooting**

### **Common Issues**

1. **URLs not updating:**

   - Check `NEXT_PUBLIC_SITE_URL` environment variable
   - Restart development server after env changes
   - Verify config is imported correctly

2. **Missing metadata:**

   - Ensure all required props are passed
   - Check for TypeScript errors
   - Verify template variables are correct

3. **JSON-LD validation errors:**
   - Use Google's Rich Results Test
   - Check for missing required properties
   - Verify URL formats are correct

### **Debug Mode**

```typescript
import { seoConfig, validateSeoConfig } from '@/config/seo.config';

// Check current configuration
console.log('SEO Config:', seoConfig);
console.log('Config Valid:', validateSeoConfig());
```

## 📚 **API Reference**

### **Core Functions**

- `constructMetadata()`: Basic metadata generation
- `constructMangaMetadata()`: Manga-specific metadata
- `constructChapterMetadata()`: Chapter-specific metadata
- `constructGenreMetadata()`: Genre page metadata
- `constructSearchMetadata()`: Search page metadata

### **JSON-LD Functions**

- `generateMangaJsonLd()`: Manga schema
- `generateChapterJsonLd()`: Chapter schema
- `generateHomeJsonLd()`: Website schema
- `generateOrganizationJsonLd()`: Organization schema

### **Utility Functions**

- `getSiteUrl()`: Generate absolute URLs
- `getPageTitle()`: Format page titles
- `validateSeoConfig()`: Validate configuration

## 🎯 **Migration Guide**

If migrating from the old SEO system:

1. Update imports to use new functions
2. Replace hardcoded URLs with `getSiteUrl()`
3. Use typed metadata props instead of `any`
4. Update JSON-LD generation calls
5. Test all SEO functionality

For detailed migration steps, see the implementation examples in the codebase.

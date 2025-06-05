# SEO Environment Variables Guide

## 📋 **Tổng quan**

Hệ thống SEO đã được mở rộng để hỗ trợ đầy đủ cấu hình qua environment variables. Bạn có thể cấu hình tất cả các khía cạnh SEO thông qua file `.env` mà không cần chỉnh sửa code.

## 🔧 **Cấu hình Environment Variables**

### **1. Thông tin cơ bản của site**
```bash
# URL và thông tin cơ bản
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
NEXT_PUBLIC_SITE_NAME="Your Site Name"
NEXT_PUBLIC_SITE_DESCRIPTION="Your site description"
NEXT_PUBLIC_SITE_TAGLINE="Your tagline"
NEXT_PUBLIC_SITE_LANGUAGE="en"
NEXT_PUBLIC_SITE_LOCALE="en_US"

# Keywords (phân cách bằng dấu phẩy)
NEXT_PUBLIC_SITE_KEYWORDS="manga,comic,read manga,free manga"
```

### **2. Cấu hình Assets**
```bash
# Đường dẫn tới các file assets
NEXT_PUBLIC_LOGO_URL="/logo.png"
NEXT_PUBLIC_FAVICON_URL="/favicon.ico"
NEXT_PUBLIC_OG_IMAGE="/images/og-image.jpg"
```

### **3. Social Media Integration**
```bash
# Twitter/X configuration
NEXT_PUBLIC_TWITTER_HANDLE="@YourHandle"
NEXT_PUBLIC_TWITTER_CREATOR="@YourCreator"
NEXT_PUBLIC_TWITTER_CARD="summary_large_image"

# Facebook/Meta configuration
NEXT_PUBLIC_FACEBOOK_PAGE="YourPage"
NEXT_PUBLIC_OG_TYPE="website"
```

### **4. SEO Templates**
```bash
# Title configuration
NEXT_PUBLIC_TITLE_TEMPLATE="%s | Your Site"
NEXT_PUBLIC_DEFAULT_TITLE="Your Site - Description"
NEXT_PUBLIC_TITLE_SEPARATOR=" | "
```

### **5. Robots & Indexing**
```bash
# Search engine directives
NEXT_PUBLIC_ROBOTS_INDEX="true"
NEXT_PUBLIC_ROBOTS_FOLLOW="true"
```

### **6. Organization Schema**
```bash
# Structured data cho organization
NEXT_PUBLIC_ORG_NAME="Your Organization"
NEXT_PUBLIC_ORG_LEGAL_NAME="Your Legal Name"
NEXT_PUBLIC_ORG_FOUNDING_DATE="2024"
NEXT_PUBLIC_ORG_COUNTRY="US"
```

### **7. Analytics & Tracking**
```bash
# Google Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"

# Google Tag Manager
NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID="GTM-XXXXXXX"

# Google Site Verification
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION="your-verification-code"

# Facebook Pixel
NEXT_PUBLIC_FACEBOOK_PIXEL_ID="your-pixel-id"
```

## 🚀 **Cách sử dụng**

### **1. Development Environment**
```bash
# Copy file example
cp .env.example .env

# Chỉnh sửa các giá trị cần thiết
# Analytics sẽ không chạy trong development
```

### **2. Production Environment**
```bash
# Thêm analytics IDs cho production
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="G-REAL-ID"
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION="real-verification-code"
```

## 📊 **Analytics Integration**

### **Automatic Loading**
- Analytics chỉ load trong production environment
- Google Analytics, GTM, và Facebook Pixel được tự động cấu hình
- Google Site Verification được thêm vào metadata

### **Event Tracking**
```typescript
import { trackMangaView, trackChapterRead, trackSearch } from '@/components/analytics/Analytics';

// Track manga view
trackMangaView('manga-id', 'Manga Title');

// Track chapter read
trackChapterRead('manga-id', 'chapter-id', 1);

// Track search
trackSearch('search query', 10);
```

## 🔍 **Validation & Debugging**

### **Check Configuration**
```typescript
import { validateSeoConfigExtended } from '@/config/seo.config';

const validation = validateSeoConfigExtended();
console.log('SEO Config:', validation);
```

### **Helper Functions**
```typescript
import { 
  getGoogleAnalyticsId,
  getGoogleTagManagerId,
  getSiteUrl,
  getPageTitle 
} from '@/config/seo.config';

// Check if analytics is configured
const gaId = getGoogleAnalyticsId(); // returns null if not configured
const gtmId = getGoogleTagManagerId(); // returns null if not configured

// Generate URLs and titles
const fullUrl = getSiteUrl('/manga/some-manga');
const pageTitle = getPageTitle('Manga Title');
```

## ⚠️ **Lưu ý quan trọng**

### **Environment Variables**
- Tất cả biến SEO phải bắt đầu với `NEXT_PUBLIC_` để có thể sử dụng ở client-side
- Biến không có `NEXT_PUBLIC_` chỉ có thể dùng ở server-side

### **Analytics**
- Analytics chỉ chạy trong production (`NODE_ENV=production`)
- Trong development, analytics sẽ không load để tránh tracking không chính xác

### **Fallback Values**
- Nếu environment variable không được set, hệ thống sẽ sử dụng giá trị mặc định từ `seo.config.ts`
- Điều này đảm bảo site vẫn hoạt động ngay cả khi thiếu cấu hình

## 🔄 **Migration từ cấu hình cũ**

Nếu bạn đang sử dụng cấu hình SEO cũ:

1. **Backup** file `seo.config.ts` hiện tại
2. **Copy** các giá trị từ config file sang `.env`
3. **Test** để đảm bảo mọi thứ hoạt động đúng
4. **Deploy** với cấu hình mới

## 📝 **Example .env hoàn chỉnh**

```bash
# Basic site info
NEXT_PUBLIC_SITE_URL="https://manga-site.com"
NEXT_PUBLIC_SITE_NAME="Manga Reader"
NEXT_PUBLIC_SITE_DESCRIPTION="Read manga online for free"
NEXT_PUBLIC_SITE_KEYWORDS="manga,comic,read manga,free manga"

# Social media
NEXT_PUBLIC_TWITTER_HANDLE="@MangaReader"
NEXT_PUBLIC_FACEBOOK_PAGE="MangaReader"

# Analytics (production only)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION="verification-code"
```

Với cấu hình này, bạn có thể quản lý toàn bộ SEO của site thông qua environment variables một cách linh hoạt và an toàn.

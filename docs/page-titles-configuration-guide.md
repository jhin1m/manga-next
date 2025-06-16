# Page Titles Configuration Guide

## 📋 **Tổng quan**

Hệ thống Page Titles cho phép cấu hình linh hoạt các tiêu đề trang dựa trên filters và hỗ trợ đa ngôn ngữ. Thay vì hardcode các tiêu đề trong code, bạn có thể cấu hình chúng thông qua environment variables hoặc file config.

## 🌍 **Hỗ trợ đa ngôn ngữ**

### **Ngôn ngữ được hỗ trợ:**

- **English (en, en-US)**: Default language
- **Vietnamese (vi, vi-VN)**: Tiếng Việt
- **Japanese (ja, ja-JP)**: 日本語

### **Cấu hình ngôn ngữ:**

```bash
# Trong .env
NEXT_PUBLIC_SITE_LOCALE="vi_VN"  # Vietnamese
NEXT_PUBLIC_SITE_LOCALE="en_US"  # English
NEXT_PUBLIC_SITE_LOCALE="ja_JP"  # Japanese
```

## 🔧 **Cấu hình Page Titles**

### **1. Cấu hình mặc định trong code**

File `src/config/page-titles.config.ts` chứa cấu hình mặc định:

```typescript
const vietnameseTitles = {
  manga: {
    default: 'Truyện Tranh Mới Nhất',
    sort: {
      latest: 'Truyện Tranh Mới Nhất',
      popular: 'Truyện Tranh Phổ Biến',
      rating: 'Truyện Tranh Đánh Giá Cao',
      views: 'Truyện Tranh Xem Nhiều',
    },
    status: {
      ongoing: 'Truyện Tranh Đang Tiến Hành',
      completed: 'Truyện Tranh Hoàn Thành',
      hiatus: 'Truyện Tranh Tạm Dừng',
    },
    combined: {
      'popular+completed': 'Truyện Tranh Hoàn Thành Phổ Biến',
    },
  },
};
```

### **2. Override qua Environment Variables**

```bash
# Format: NEXT_PUBLIC_PAGE_TITLE_{SECTION}_{TYPE}_{FILTER}

# Manga page titles
NEXT_PUBLIC_PAGE_TITLE_MANGA_DEFAULT="Truyện Tranh Mới Nhất"
NEXT_PUBLIC_PAGE_TITLE_MANGA_SORT_POPULAR="Truyện Tranh Phổ Biến"
NEXT_PUBLIC_PAGE_TITLE_MANGA_SORT_RATING="Truyện Tranh Đánh Giá Cao"
NEXT_PUBLIC_PAGE_TITLE_MANGA_STATUS_COMPLETED="Truyện Tranh Hoàn Thành"
NEXT_PUBLIC_PAGE_TITLE_MANGA_STATUS_ONGOING="Truyện Tranh Đang Tiến Hành"

# Combined filters
NEXT_PUBLIC_PAGE_TITLE_MANGA_COMBINED_POPULAR_COMPLETED="Truyện Tranh Hoàn Thành Phổ Biến"
```

## 📖 **Cách sử dụng**

### **1. Server-side (generateMetadata)**

```typescript
import { getServerPageTitle } from '@/hooks/usePageTitle';
import { seoConfig } from '@/config/seo.config';

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const sort = params.sort;
  const status = params.status;
  const genre = params.genre;

  // Get current locale
  const currentLocale = seoConfig.site.locale.split('_')[0] || 'en';

  // Get localized page title
  const pageTitle = getServerPageTitle('manga', { sort, status, genre }, currentLocale);

  return constructMangaListMetadata({
    pageTitle,
    // ... other metadata
  });
}
```

### **2. Client-side (React components)**

```typescript
'use client';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function MangaComponent() {
  const { getMangaPageTitle } = usePageTitle();

  const pageTitle = getMangaPageTitle({
    sort: 'popular',
    status: 'completed'
  });

  return <h1>{pageTitle}</h1>;
}
```

## 🎯 **Ví dụ thực tế**

### **URL và Page Titles tương ứng:**

**English (en):**

- `/manga` → "Latest Manga"
- `/manga?sort=popular` → "Popular Manga"
- `/manga?sort=rating` → "Top Rated Manga"
- `/manga?status=completed` → "Completed Manga"
- `/manga?genre=action` → "Action Manga"
- `/manga?sort=popular&status=completed` → "Popular Completed Manga"

**Vietnamese (vi):**

- `/manga` → "Truyện Tranh Mới Nhất"
- `/manga?sort=popular` → "Truyện Tranh Phổ Biến"
- `/manga?sort=rating` → "Truyện Tranh Đánh Giá Cao"
- `/manga?status=completed` → "Truyện Tranh Hoàn Thành"
- `/manga?genre=action` → "Truyện Tranh Hành Động"
- `/manga?sort=popular&status=completed` → "Truyện Tranh Hoàn Thành Phổ Biến"

**Japanese (ja):**

- `/manga` → "最新マンガ"
- `/manga?sort=popular` → "人気マンガ"
- `/manga?sort=rating` → "高評価マンガ"
- `/manga?status=completed` → "完結マンガ"
- `/manga?genre=action` → "アクションマンガ"

## 🔄 **Priority System**

Hệ thống ưu tiên title theo thứ tự:

1. **Environment Variable Override** (cao nhất)
2. **Localized Config** (theo ngôn ngữ hiện tại)
3. **Default English Config** (fallback)

```typescript
// Ví dụ priority
// 1. NEXT_PUBLIC_PAGE_TITLE_MANGA_SORT_POPULAR="Custom Popular"
// 2. vietnameseTitles.manga.sort.popular = "Truyện Tranh Phổ Biến"
// 3. englishTitles.manga.sort.popular = "Popular Manga"
```

## 🎨 **Genre Titles**

Genres có hệ thống translation riêng:

```typescript
const genreTranslations = {
  en: {
    action: 'Action Manga',
    adventure: 'Adventure Manga',
    comedy: 'Comedy Manga',
    // ...
  },
  vi: {
    action: 'Truyện Tranh Hành Động',
    adventure: 'Truyện Tranh Phiêu Lưu',
    comedy: 'Truyện Tranh Hài Hước',
    // ...
  },
  ja: {
    action: 'アクションマンガ',
    adventure: 'アドベンチャーマンガ',
    comedy: 'コメディマンガ',
    // ...
  },
};
```

## 🛠️ **Thêm ngôn ngữ mới**

### **1. Thêm vào page-titles.config.ts:**

```typescript
const koreanTitles: PageTitleConfig = {
  manga: {
    default: '최신 만화',
    sort: {
      latest: '최신 만화',
      popular: '인기 만화',
      rating: '평점 높은 만화',
    },
    // ...
  },
};

export const localizedPageTitles: LocalizedPageTitles = {
  // ... existing languages
  ko: koreanTitles,
  'ko-KR': koreanTitles,
};
```

### **2. Thêm genre translations:**

```typescript
const genreTranslations = {
  // ... existing languages
  ko: {
    action: '액션 만화',
    adventure: '모험 만화',
    comedy: '코미디 만화',
    // ...
  },
};
```

## ✅ **Best Practices**

### **1. Naming Convention**

- Sử dụng format: `NEXT_PUBLIC_PAGE_TITLE_{SECTION}_{TYPE}_{FILTER}`
- SECTION: `MANGA`, `GENRE`, etc.
- TYPE: `SORT`, `STATUS`, `COMBINED`, `DEFAULT`
- FILTER: `POPULAR`, `COMPLETED`, etc.

### **2. Fallback Strategy**

- Luôn có English fallback
- Kiểm tra locale validity
- Graceful degradation khi thiếu translation

### **3. SEO Optimization**

- Titles phải descriptive và keyword-rich
- Tránh duplicate titles
- Consistent với URL structure

## 🧪 **Testing**

```bash
# Test với different locales
NEXT_PUBLIC_SITE_LOCALE="vi_VN" npm run dev
NEXT_PUBLIC_SITE_LOCALE="ja_JP" npm run dev

# Test với environment overrides
NEXT_PUBLIC_PAGE_TITLE_MANGA_SORT_POPULAR="Custom Title" npm run dev
```

Hệ thống này cho phép quản lý page titles một cách linh hoạt, hỗ trợ đa ngôn ngữ và có thể override dễ dàng qua environment variables.

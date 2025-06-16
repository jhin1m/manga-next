# Hướng dẫn triển khai i18n cho Manga Website

## Tổng quan

Triển khai đa ngôn ngữ (Tiếng Việt + Tiếng Anh) cho manga website sử dụng next-intl, tương thích với NextJS 15 + App Router + ShadcnUI.

## Bước 1: Cài đặt Dependencies

```bash
pnpm add next-intl
```

## Bước 2: Cấu hình next-intl

### 2.1 Tạo file cấu hình i18n

```typescript
// src/i18n/config.ts
export const locales = ['en', 'vi'] as const;
export const defaultLocale = 'en' as const;
export type Locale = (typeof locales)[number];

export const localeNames = {
  en: 'English',
  vi: 'Tiếng Việt',
} as const;
```

### 2.2 Cấu hình middleware

```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './src/i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localeDetection: true, // Tự động detect từ browser
  localePrefix: 'never', // Không dùng /en, /vi prefix
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
```

### 2.3 Cấu hình messages

```typescript
// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale } from './config';

export default getRequestConfig(async () => {
  // Lấy locale từ cookie hoặc dùng default
  const cookieStore = cookies();
  const locale = cookieStore.get('locale')?.value || defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

## Bước 3: Tạo Translation Files

### 3.1 English translations

```json
// src/messages/en.json
{
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "tryAgain": "Try Again",
    "search": "Search",
    "home": "Home",
    "latest": "Latest",
    "login": "Login",
    "logout": "Logout",
    "cancel": "Cancel",
    "submit": "Submit",
    "save": "Save"
  },
  "navigation": {
    "home": "Home",
    "latest": "Latest",
    "search": "Search",
    "searchManga": "Search manga"
  },
  "manga": {
    "hotManga": "Hot Manga",
    "latestManga": "Latest Manga",
    "recommendedManga": "Recommended Manga",
    "rating": "Rating",
    "views": "Views",
    "chapters": "Chapters",
    "status": "Status",
    "ongoing": "Ongoing",
    "completed": "Completed",
    "readNow": "Read Now",
    "addToFavorites": "Add to Favorites",
    "removeFromFavorites": "Remove from Favorites"
  },
  "search": {
    "placeholder": "Search manga...",
    "searching": "Searching...",
    "noResults": "No results found",
    "searchFor": "Search for",
    "recentSearches": "Recent Searches",
    "popularSearches": "Popular Searches",
    "suggestions": "Suggestions"
  },
  "auth": {
    "login": "Login",
    "register": "Register",
    "email": "Email",
    "password": "Password",
    "confirmPassword": "Confirm Password",
    "loginSuccess": "Logged in successfully",
    "loginError": "Invalid email or password",
    "loggingIn": "Logging in...",
    "enterCredentials": "Enter your credentials to access your account"
  },
  "errors": {
    "failedToLoad": "Failed to load",
    "tryAgainLater": "Please try again later",
    "somethingWentWrong": "Something went wrong",
    "networkError": "Network error",
    "invalidEmail": "Please enter a valid email address",
    "passwordRequired": "Password is required"
  },
  "footer": {
    "home": "Home",
    "privacy": "Privacy Policy",
    "terms": "Terms of Service",
    "dmca": "DMCA",
    "contact": "Contact",
    "allRightsReserved": "All rights reserved"
  }
}
```

### 3.2 Vietnamese translations

```json
// src/messages/vi.json
{
  "common": {
    "loading": "Đang tải...",
    "error": "Lỗi",
    "tryAgain": "Thử lại",
    "search": "Tìm kiếm",
    "home": "Trang chủ",
    "latest": "Mới nhất",
    "login": "Đăng nhập",
    "logout": "Đăng xuất",
    "cancel": "Hủy",
    "submit": "Gửi",
    "save": "Lưu"
  },
  "navigation": {
    "home": "Trang chủ",
    "latest": "Mới nhất",
    "search": "Tìm kiếm",
    "searchManga": "Tìm kiếm truyện"
  },
  "manga": {
    "hotManga": "Truyện Hot",
    "latestManga": "Truyện Mới Nhất",
    "recommendedManga": "Truyện Đề Xuất",
    "rating": "Đánh giá",
    "views": "Lượt xem",
    "chapters": "Chương",
    "status": "Trạng thái",
    "ongoing": "Đang tiến hành",
    "completed": "Hoàn thành",
    "readNow": "Đọc ngay",
    "addToFavorites": "Thêm vào yêu thích",
    "removeFromFavorites": "Xóa khỏi yêu thích"
  },
  "search": {
    "placeholder": "Tìm kiếm truyện...",
    "searching": "Đang tìm kiếm...",
    "noResults": "Không tìm thấy kết quả",
    "searchFor": "Tìm kiếm",
    "recentSearches": "Tìm kiếm gần đây",
    "popularSearches": "Tìm kiếm phổ biến",
    "suggestions": "Gợi ý"
  },
  "auth": {
    "login": "Đăng nhập",
    "register": "Đăng ký",
    "email": "Email",
    "password": "Mật khẩu",
    "confirmPassword": "Xác nhận mật khẩu",
    "loginSuccess": "Đăng nhập thành công",
    "loginError": "Email hoặc mật khẩu không đúng",
    "loggingIn": "Đang đăng nhập...",
    "enterCredentials": "Nhập thông tin đăng nhập của bạn"
  },
  "errors": {
    "failedToLoad": "Không thể tải",
    "tryAgainLater": "Vui lòng thử lại sau",
    "somethingWentWrong": "Đã có lỗi xảy ra",
    "networkError": "Lỗi mạng",
    "invalidEmail": "Vui lòng nhập địa chỉ email hợp lệ",
    "passwordRequired": "Mật khẩu là bắt buộc"
  },
  "footer": {
    "home": "Trang chủ",
    "privacy": "Chính sách bảo mật",
    "terms": "Điều khoản dịch vụ",
    "dmca": "DMCA",
    "contact": "Liên hệ",
    "allRightsReserved": "Tất cả quyền được bảo lưu"
  }
}
```

## Bước 4: Cập nhật next.config.ts

```typescript
// next.config.ts
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = {
  // ... existing config
};

export default withNextIntl(nextConfig);
```

## Bước 5: Tạo Language Switcher Component

```typescript
// src/components/language-switcher.tsx
'use client';

import { useState, useTransition } from 'react';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { locales, localeNames } from '@/i18n/config';

export function LanguageSwitcher() {
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: string) => {
    startTransition(() => {
      // Set cookie để lưu locale
      document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;
      window.location.reload();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isPending}>
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={locale === loc ? 'bg-accent' : ''}
          >
            {localeNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## Bước 6: Migration Strategy

### 6.1 Cập nhật Layout Root

### 6.2 Cập nhật Header Component

### 6.3 Cập nhật HotMangaSlider Component

### 6.4 Cập nhật SearchBar Component

### 6.5 Cập nhật Auth Components

### 6.6 Cập nhật Footer Component

## Bước 7: Testing & Validation

### 7.1 Test SSR/ISR compatibility

### 7.2 Test performance impact

### 7.3 Test all components với cả 2 ngôn ngữ

### 7.4 Test language switching

## Lưu ý quan trọng

1. **Không ảnh hưởng SSR/ISR performance**
2. **Type-safe với TypeScript**
3. **Tương thích với ShadcnUI patterns**
4. **Không cần thay đổi routing structure**
5. **Dễ dàng thêm ngôn ngữ mới sau này**

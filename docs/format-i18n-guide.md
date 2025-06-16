# Hướng dẫn sử dụng Format Functions với i18n

## Tổng quan

Dự án đã được cập nhật để hỗ trợ format functions với đa ngôn ngữ (i18n). Bạn có thể định dạng số, ngày tháng, và các giá trị khác theo ngôn ngữ hiện tại của người dùng.

## Cách sử dụng

### 1. Sử dụng useFormat Hook (Khuyến nghị)

```tsx
'use client';

import { useFormat } from '@/hooks/useFormat';

function MyComponent() {
  const { formatViews, formatDate, formatNumber, locale } = useFormat();

  return (
    <div>
      <p>Views: {formatViews(1234567)}</p> {/* 1.2M hoặc 1.2Tr */}
      <p>Date: {formatDate('2024-01-15T10:30:00Z')}</p> {/* 2 hours ago hoặc 2 giờ trước */}
      <p>Number: {formatNumber(1234567.89)}</p> {/* 1,234,567.89 hoặc 1.234.567,89 */}
      <p>Current locale: {locale}</p> {/* en hoặc vi */}
    </div>
  );
}
```

### 2. Sử dụng trực tiếp format functions

```tsx
'use client';

import { useTranslations } from 'next-intl';
import { formatViewsI18n, formatDateI18n } from '@/lib/utils/format-i18n';

function MyComponent() {
  const tNumbers = useTranslations('format.numbers');
  const tTimeAgo = useTranslations('format.timeAgo');
  const tMonths = useTranslations('format.months');

  return (
    <div>
      <p>Views: {formatViewsI18n(1234567, tNumbers)}</p>
      <p>Date: {formatDateI18n('2024-01-15T10:30:00Z', tTimeAgo, tMonths)}</p>
    </div>
  );
}
```

## Các hàm có sẵn

### formatViews(count: number)

Định dạng số lượt xem với đơn vị phù hợp:

- **English**: 1.2K, 1.2M, 1.2B
- **Tiếng Việt**: 1.2K, 1.2Tr, 1.2Tỷ

### formatDate(dateString: string)

Định dạng ngày thành dạng "time ago":

- **English**: "2 minutes ago", "1 hour ago", "Yesterday", "2 days ago", "1 week ago"
- **Tiếng Việt**: "2 phút trước", "1 giờ trước", "Hôm qua", "2 ngày trước", "1 tuần trước"

### formatNumber(number: number, options?)

Định dạng số theo locale:

- **English**: 1,234,567.89
- **Tiếng Việt**: 1.234.567,89

### formatDateLocale(date: Date | string, options?)

Định dạng ngày theo locale:

- **English**: "January 15, 2024"
- **Tiếng Việt**: "15 tháng 1, 2024"

### formatCurrency(amount: number, currency: string)

Định dạng tiền tệ:

- **English**: $1,234.56
- **Tiếng Việt**: 1.234.567 ₫

### formatPercentage(value: number, options?)

Định dạng phần trăm:

- **English**: 12.34%
- **Tiếng Việt**: 12,34%

## Translations được hỗ trợ

### English (en.json)

```json
{
  "format": {
    "timeAgo": {
      "minutesAgo": "{minutes} minutes ago",
      "hoursAgo": "{hours} hours ago",
      "yesterday": "Yesterday",
      "daysAgo": "{days} days ago",
      "weekAgo": "1 week ago",
      "weeksAgo": "{weeks} weeks ago"
    },
    "months": {
      "short": {
        "0": "Jan",
        "1": "Feb",
        "2": "Mar",
        "3": "Apr",
        "4": "May",
        "5": "Jun",
        "6": "Jul",
        "7": "Aug",
        "8": "Sep",
        "9": "Oct",
        "10": "Nov",
        "11": "Dec"
      },
      "long": {
        "0": "January",
        "1": "February",
        "2": "March",
        "3": "April",
        "4": "May",
        "5": "June",
        "6": "July",
        "7": "August",
        "8": "September",
        "9": "October",
        "10": "November",
        "11": "December"
      }
    },
    "numbers": {
      "thousand": "K",
      "million": "M",
      "billion": "B"
    }
  }
}
```

### Tiếng Việt (vi.json)

```json
{
  "format": {
    "timeAgo": {
      "minutesAgo": "{minutes} phút trước",
      "hoursAgo": "{hours} giờ trước",
      "yesterday": "Hôm qua",
      "daysAgo": "{days} ngày trước",
      "weekAgo": "1 tuần trước",
      "weeksAgo": "{weeks} tuần trước"
    },
    "months": {
      "short": {
        "0": "Th1",
        "1": "Th2",
        "2": "Th3",
        "3": "Th4",
        "4": "Th5",
        "5": "Th6",
        "6": "Th7",
        "7": "Th8",
        "8": "Th9",
        "9": "Th10",
        "10": "Th11",
        "11": "Th12"
      },
      "long": {
        "0": "Tháng 1",
        "1": "Tháng 2",
        "2": "Tháng 3",
        "3": "Tháng 4",
        "4": "Tháng 5",
        "5": "Tháng 6",
        "6": "Tháng 7",
        "7": "Tháng 8",
        "8": "Tháng 9",
        "9": "Tháng 10",
        "10": "Tháng 11",
        "11": "Tháng 12"
      }
    },
    "numbers": {
      "thousand": "K",
      "million": "Tr",
      "billion": "Tỷ"
    }
  }
}
```

## Migration từ format functions cũ

### Trước đây:

```tsx
import { formatViews, formatDate } from '@/lib/utils/format';

// Hardcoded English
<p>{formatViews(1234567)}</p> // 1.2M
<p>{formatDate('2024-01-15T10:30:00Z')}</p> // 2 hours ago
```

### Bây giờ:

```tsx
import { useFormat } from '@/hooks/useFormat';

function MyComponent() {
  const { formatViews, formatDate } = useFormat();

  // Tự động theo ngôn ngữ hiện tại
  return (
    <div>
      <p>{formatViews(1234567)}</p> {/* 1.2M hoặc 1.2Tr */}
      <p>{formatDate('2024-01-15T10:30:00Z')}</p> {/* 2 hours ago hoặc 2 giờ trước */}
    </div>
  );
}
```

## Lưu ý

1. **useFormat hook** chỉ hoạt động trong React components với 'use client'
2. **Legacy format functions** trong `/lib/utils/format.ts` vẫn hoạt động nhưng chỉ hỗ trợ tiếng Anh
3. **Intl.NumberFormat và Intl.DateTimeFormat** được sử dụng để đảm bảo định dạng chính xác theo locale
4. **Translations** có thể được mở rộng dễ dàng bằng cách thêm vào files JSON

## Ví dụ thực tế

Xem các component đã được cập nhật:

- `src/components/feature/HotMangaSlider.tsx`
- `src/components/feature/MangaCard.tsx`
- `src/components/i18n-demo.tsx`

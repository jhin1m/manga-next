# Manga Rankings System

This document describes the manga rankings system that displays top manga based on time-based view statistics in the sidebar.

## Overview

The manga rankings system provides:

- **Time-based rankings** (daily, weekly, monthly)
- **Top 10 manga** per time period
- **Visual ranking indicators** for top 3 positions
- **Responsive sidebar integration** with tabs
- **Real-time data** from view statistics system
- **i18n support** for multiple languages

## Features

### **Three Time-Based Tabs**

- **Daily**: Top manga by `daily_views` (last 24 hours)
- **Weekly**: Top manga by `weekly_views` (last 7 days)
- **Monthly**: Top manga by `monthly_views` (last 30 days)

### **Ranking Display**

- **Rank numbers** (1-10) with special styling for top 3
- **Crown icon** for #1 (gold)
- **Medal icon** for #2 (silver)
- **Award icon** for #3 (bronze)
- **Cover image thumbnails** (40px width)
- **Manga titles** with line clamping
- **Formatted view counts** using existing utilities
- **"Hot" badges** for top 3 trending manga

### **UI/UX Features**

- **Loading states** with skeleton animations
- **Error handling** with retry options
- **Empty states** for no data
- **Responsive design** optimized for sidebar width
- **Hover effects** and smooth transitions
- **Click-through links** to manga detail pages

## API Integration

### **Centralized API Client**

The manga rankings system uses the project's centralized API client pattern located at `src/lib/api/client.ts`:

```typescript
import { rankingsApi } from '@/lib/api/client';

// Get weekly rankings (default)
const data = await rankingsApi.getRankings();

// Get daily rankings with limit
const data = await rankingsApi.getRankings({ period: 'daily', limit: 5 });

// Get monthly rankings
const data = await rankingsApi.getRankings({ period: 'monthly' });
```

### **Manga Rankings Endpoint**

```typescript
GET /api/manga/rankings?period={period}&limit={limit}
```

**Parameters:**

- `period`: 'daily' | 'weekly' | 'monthly' (default: 'weekly')
- `limit`: number (default: 10, max: 50)

**Response:**

```typescript
{
  success: boolean
  data: {
    period: string
    rankings: MangaRankingItem[]
    total: number
    lastUpdated: string
  }
}
```

**MangaRankingItem:**

```typescript
{
  id: number;
  title: string;
  slug: string;
  cover_image_url: string | null;
  daily_views: number;
  weekly_views: number;
  monthly_views: number;
  total_views: number;
  rank: number;
}
```

### **API Client Benefits**

- **Centralized endpoint management** - All endpoints defined in one place
- **Consistent error handling** - Standardized error format across all requests
- **Automatic caching** - Built-in cache management with proper tags
- **Type safety** - Full TypeScript support with parameter validation
- **Retry logic** - Built-in retry mechanisms for failed requests
- **Better maintainability** - Follows established project patterns

### **Caching Strategy**

- **Daily rankings**: 30 minutes cache (`revalidate: 1800`)
- **Weekly rankings**: 1 hour cache (`revalidate: 3600`)
- **Monthly rankings**: 2 hours cache (`revalidate: 7200`)
- **Cache tags**: `['rankings', 'rankings-{period}', 'manga-rankings']`
- **Stale-while-revalidate** for better UX

### **Database Queries**

```sql
-- Example weekly rankings query
SELECT id, title, slug, cover_image_url,
       daily_views, weekly_views, monthly_views, total_views
FROM comics
WHERE weekly_views > 0
ORDER BY weekly_views DESC, total_views DESC, id ASC
LIMIT 10;
```

## Component Structure

### **MangaRankings Component**

```typescript
// Location: src/components/feature/sidebar/MangaRankings.tsx
export default function MangaRankings({ className }: MangaRankingsProps);
```

**Key Features:**

- State management for three periods
- Lazy loading of tab data
- Error boundaries and loading states
- Responsive design with proper spacing

### **Sidebar Integration**

```typescript
// Location: src/components/feature/Sidebar.tsx
<Card>
  <CardHeader className="pb-3 text-2xl">
    <CardTitle>{t('rankings')}</CardTitle>
  </CardHeader>
  <CardContent>
    <MangaRankings />
  </CardContent>
</Card>
```

## Internationalization

### **Translation Keys**

**English (`src/messages/en.json`):**

```json
{
  "sidebar": {
    "rankings": "Manga Rankings",
    "rankingsData": {
      "daily": "Daily",
      "weekly": "Weekly",
      "monthly": "Monthly",
      "trending": "Hot",
      "errorLoading": "Failed to load rankings",
      "noRankings": "No rankings available"
    }
  }
}
```

**Vietnamese (`src/messages/vi.json`):**

```json
{
  "sidebar": {
    "rankings": "Bảng xếp hạng",
    "rankingsData": {
      "daily": "Hôm nay",
      "weekly": "Tuần này",
      "monthly": "Tháng này",
      "trending": "Hot",
      "errorLoading": "Không thể tải bảng xếp hạng",
      "noRankings": "Chưa có dữ liệu xếp hạng"
    }
  }
}
```

## Integration with View Statistics

### **Database Dependencies**

The rankings system relies on the view statistics fields:

- `Comics.daily_views`
- `Comics.weekly_views`
- `Comics.monthly_views`
- `Comics.total_views`

### **Data Flow**

1. **View tracking** → Updates view statistics
2. **Aggregation jobs** → Calculate time-based views
3. **Rankings API** → Query sorted manga
4. **UI components** → Display rankings

### **Performance Considerations**

- **Indexed queries** on view statistics fields
- **Filtered results** (only manga with views > 0)
- **Secondary sorting** by total_views for consistency
- **Cached responses** to reduce database load

## Testing

### **Test Script**

```bash
pnpm test:rankings
```

**Test Coverage:**

- API endpoint validation
- Mock data formatting
- Component structure verification
- Translation key validation
- Integration testing
- Caching strategy validation

### **Manual Testing**

1. **Load sidebar** → Verify rankings appear
2. **Switch tabs** → Check data loading
3. **Click manga** → Verify navigation
4. **Change language** → Test i18n
5. **Responsive design** → Test mobile/desktop

## Deployment

### **Prerequisites**

1. **View statistics system** must be implemented
2. **Database migration** applied for view fields
3. **Aggregation jobs** running to populate data

### **Deployment Steps**

1. **Build project**: `pnpm build`
2. **Run aggregation**: `pnpm view-stats`
3. **Test API**: `GET /api/manga/rankings?period=weekly`
4. **Verify UI**: Check sidebar rankings display

### **Monitoring**

- **API response times** for rankings endpoint
- **Cache hit rates** for different periods
- **Error rates** and failed requests
- **User engagement** with rankings

## Future Enhancements

### **Planned Features**

- **Trending indicators** (up/down arrows)
- **Historical comparison** (vs. previous period)
- **Genre-specific rankings**
- **User personalization** (favorite genres)
- **Real-time updates** via WebSocket

### **Performance Optimizations**

- **Pre-computed rankings** stored in cache
- **Background refresh** jobs
- **CDN caching** for static data
- **Database read replicas** for queries

## Troubleshooting

### **Common Issues**

1. **Empty rankings** → Run view statistics aggregation
2. **Stale data** → Check cache expiration
3. **Loading errors** → Verify API endpoint
4. **Missing translations** → Check i18n files

### **Debug Commands**

```bash
# Test rankings API
curl "http://localhost:3000/api/manga/rankings?period=weekly"

# Run view statistics
pnpm view-stats

# Test component
pnpm test:rankings
```

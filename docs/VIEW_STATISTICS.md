# View Statistics System

This document describes the time-based view statistics system that tracks daily, weekly, and monthly view counts for manga and chapters.

## Overview

The view statistics system provides:

- **Real-time view tracking** with detailed logging
- **Time-based aggregation** (daily, weekly, monthly)
- **Historical data storage** for analytics
- **Efficient querying** with proper indexing
- **Automated aggregation jobs** for data processing

## Database Schema

### New Fields Added

**Comics Table:**

```sql
daily_views    INT DEFAULT 0    -- Views in last 24 hours
weekly_views   INT DEFAULT 0    -- Views in last 7 days
monthly_views  INT DEFAULT 0    -- Views in last 30 days
```

**Chapters Table:**

```sql
daily_views    INT DEFAULT 0    -- Views in last 24 hours
weekly_views   INT DEFAULT 0    -- Views in last 7 days
monthly_views  INT DEFAULT 0    -- Views in last 30 days
```

**New View_Statistics Table:**

```sql
CREATE TABLE "View_Statistics" (
  id            BIGSERIAL PRIMARY KEY,
  entity_type   VARCHAR(20) NOT NULL,  -- 'comic' or 'chapter'
  entity_id     INTEGER NOT NULL,
  date          DATE NOT NULL,
  daily_views   INTEGER DEFAULT 0,
  weekly_views  INTEGER DEFAULT 0,
  monthly_views INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ(6) DEFAULT NOW(),
  updated_at    TIMESTAMPTZ(6) DEFAULT NOW(),

  UNIQUE(entity_type, entity_id, date)
);
```

### Enhanced Indexes

- `idx_comic_views_viewed_at` - For time-based comic view queries
- `idx_chapter_views_viewed_at` - For time-based chapter view queries
- `idx_view_stats_entity_date` - For view statistics queries
- `idx_view_stats_date` - For date-based cleanup operations

## API Endpoints

### View Tracking

**Track Chapter View:**

```
GET /api/chapters/[id]
```

- Automatically increments view count and records detailed view
- Updates time-based statistics asynchronously

**Track Manga View:**

```
POST /api/manga/[slug]/view
```

- Records manga view with IP and user agent
- Updates time-based statistics asynchronously

### View Statistics

**Get Statistics:**

```
GET /api/view-statistics/[entityType]/[entityId]?period=current&days=30
```

Parameters:

- `entityType`: 'comic' or 'chapter'
- `entityId`: Entity ID
- `period`: 'current' or 'historical'
- `days`: Number of days for historical data

**Update Statistics:**

```
POST /api/view-statistics/[entityType]/[entityId]
```

- Manually trigger statistics update for specific entity

### Aggregation Jobs

**Run Aggregation Job:**

```
POST /api/jobs/view-stats-aggregation
```

Body:

```json
{
  "action": "full|comics|chapters|snapshots|cleanup",
  "daysToKeep": 90,
  "secret": "optional-security-key"
}
```

## Utility Functions

### Core Functions

```typescript
// Calculate current time-based statistics
calculateViewStatistics(entityType: EntityType, entityId: number): Promise<ViewStatistics>

// Update entity with calculated statistics
updateEntityViewStatistics(entityType: EntityType, entityId: number): Promise<void>

// Batch update multiple entities
batchUpdateViewStatistics(entityType: EntityType, entityIds: number[]): Promise<void>

// Store daily snapshot for historical data
storeDailyViewSnapshot(entityType: EntityType, entityId: number, date?: Date): Promise<void>

// Get historical aggregated data
getAggregatedViewStatistics(entityType: EntityType, entityId: number, days: number): Promise<Array<{date: Date, views: number}>>
```

### Job Functions

```typescript
// Update all comics view statistics
updateAllComicsViewStats(): Promise<JobResult>

// Update all chapters view statistics
updateAllChaptersViewStats(): Promise<JobResult>

// Store daily snapshots for all entities
storeDailySnapshots(): Promise<JobResult>

// Run complete aggregation job
runViewStatsAggregation(): Promise<JobResult>

// Clean up old view statistics data
cleanupOldViewStats(daysToKeep: number): Promise<JobResult>
```

## Scheduled Jobs

### Manual Execution

```bash
# Run complete aggregation
pnpm view-stats

# Update only comics
pnpm view-stats:comics

# Update only chapters
pnpm view-stats:chapters

# Store daily snapshots
pnpm view-stats:snapshots

# Clean up old data
pnpm view-stats:cleanup
```

### Cron Schedule (Recommended)

```bash
# Full aggregation every 6 hours
0 */6 * * * cd /path/to/project && pnpm view-stats

# Daily snapshots at midnight
0 0 * * * cd /path/to/project && pnpm view-stats:snapshots

# Weekly cleanup on Sundays at 2 AM
0 2 * * 0 cd /path/to/project && pnpm view-stats:cleanup
```

## UI Components

### ViewStatistics Component

```tsx
import { ViewStatistics } from '@/components/ui/ViewStatistics'

// Full statistics display
<ViewStatistics
  entityType="comic"
  entityId={mangaId}
  showTrends={true}
/>

// Compact display
<ViewStatistics
  entityType="chapter"
  entityId={chapterId}
  compact={true}
/>
```

### InlineViewStats Component

```tsx
import { InlineViewStats } from '@/components/ui/ViewStatistics';

<InlineViewStats
  statistics={{
    daily_views: 150,
    weekly_views: 1200,
    monthly_views: 5000,
    total_views: 25000,
  }}
  showLabels={true}
/>;
```

## Performance Considerations

### Caching Strategy

- Time-based statistics are cached in entity tables
- Real-time calculations only when needed
- Asynchronous updates to prevent blocking

### Batch Processing

- Updates processed in batches of 10 entities
- Small delays between batches to prevent overload
- Error handling for individual entity failures

### Database Optimization

- Proper indexing for time-based queries
- Efficient aggregation using raw SQL
- Regular cleanup of old historical data

## Migration Guide

### Database Migration

1. **Apply Schema Changes:**

```bash
pnpm prisma migrate dev --name add_time_based_view_statistics
```

2. **Initial Data Population:**

```bash
# Calculate initial statistics for existing data
pnpm view-stats
```

### Code Integration

1. **Update API calls** to use new view tracking endpoints
2. **Replace view components** with new ViewStatistics components
3. **Set up cron jobs** for automated aggregation
4. **Configure monitoring** for job execution

## Monitoring & Maintenance

### Health Checks

- Monitor aggregation job success rates
- Track database performance metrics
- Alert on failed statistics updates

### Data Cleanup

- Automatic cleanup of data older than 90 days
- Manual cleanup available via script
- Configurable retention periods

### Troubleshooting

**Common Issues:**

- Database connection timeouts during large aggregations
- Memory usage spikes during batch processing
- Stale statistics due to failed job execution

**Solutions:**

- Increase batch processing delays
- Monitor and restart failed jobs
- Implement retry logic for critical operations

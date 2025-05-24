# Reading History Synchronization System

## Overview

The reading history synchronization system provides seamless, transparent data persistence for both logged-in and non-logged-in users. It maintains backward compatibility with the existing localStorage system while adding silent database synchronization for authenticated users.

## Features

### For Non-Logged-In Users
- ✅ Reading history stored in localStorage
- ✅ Automatic tracking when reading chapters
- ✅ Manual history management (clear, remove items)
- ✅ Cross-tab synchronization via storage events

### For Logged-In Users
- ✅ All localStorage features
- ✅ Silent automatic sync to database upon login
- ✅ Silent real-time sync when reading chapters
- ✅ Conflict resolution (most recent wins)
- ✅ Transparent operation (no UI indicators)

## Architecture

### Components

1. **Enhanced Reading History Types** (`src/lib/utils/readingHistory.ts`)
   - Extended `ReadingHistory` type with sync fields
   - `DatabaseReadingProgress` type for API responses
   - Utility functions for data conversion and merging

2. **API Endpoints**
   - `GET /api/reading-progress` - Fetch user's reading history
   - `POST /api/reading-progress` - Update reading progress
   - `POST /api/reading-progress/sync` - Bulk sync localStorage to database
   - `DELETE /api/reading-progress` - Clear all reading progress
   - `GET/DELETE /api/reading-progress/[comicId]` - Manage specific comic progress

3. **Hooks**
   - `useReadingHistorySync` - Main sync management hook
   - Enhanced `useReadingHistory` - Auto-sync for authenticated users

4. **Updated Components**
   - `HistoryReading` - Enhanced with sync UI and controls
   - `MangaReader` - Auto-sync when reading chapters

### Database Schema

Uses existing `Reading_Progress` table:
```sql
Reading_Progress {
  user_id               Int
  comic_id              Int
  last_read_chapter_id  Int?
  last_read_page_number Int?
  progress_percentage   Float?
  updated_at            DateTime
}
```

## Usage

### Basic Usage

The system works automatically:

1. **Non-logged-in users**: History saved to localStorage only
2. **Logged-in users**: History saved to both localStorage and database
3. **Login sync**: Existing localStorage data automatically synced to database

### Transparent Operation

The synchronization system operates completely transparently:

- **No User Notifications**: All sync operations happen silently in the background
- **No Manual Controls**: Sync is fully automatic - no user intervention required
- **No Visual Indicators**: Clean UI without sync status badges or buttons

### Programmatic Usage

```typescript
import { useReadingHistorySync } from '@/hooks/useReadingHistorySync';

function MyComponent() {
  const {
    history,              // Current reading history
    clearDatabaseHistory, // Clear database history
    refreshHistory,       // Refresh from localStorage
  } = useReadingHistorySync();

  // Sync happens automatically - no manual intervention needed
  // Just use the history data as normal
}
```

### Auto-tracking Usage

```typescript
import { useReadingHistory } from '@/hooks/useReadingHistory';

function ChapterPage({ manga, chapter }) {
  // Automatically tracks reading and syncs for authenticated users
  useReadingHistory({
    mangaId: manga.id,
    mangaTitle: manga.title,
    mangaSlug: manga.slug,
    coverImage: manga.coverImage,
    chapterId: chapter.id,
    chapterNumber: chapter.number,
    chapterSlug: chapter.slug,
  });

  return <div>Chapter content...</div>;
}
```

## Sync Logic

### Conflict Resolution

When merging localStorage and database history:

1. **Duplicate Detection**: Items matched by `manga.id + chapter.id` combination
2. **Most Recent Wins**: Item with latest `readAt` timestamp is kept
3. **Limit Enforcement**: Final history limited to `MAX_HISTORY_ITEMS` (20)

### Sync Triggers

1. **Login**: Automatic full sync triggered 1 second after authentication
2. **Reading**: Real-time sync when `useReadingHistory` hook is used
3. **Manual**: User-triggered sync via UI controls
4. **Storage Events**: Cross-tab localStorage changes trigger UI updates

### Error Handling

- **Network Failures**: Graceful fallback to localStorage
- **Invalid Data**: Validation with detailed error messages
- **Partial Sync**: Individual item failures don't block entire sync
- **User Feedback**: Toast notifications for sync status

## Visual Indicators

### Sync Status Badges

- 🗄️ **Database Icon**: Item is synced to database
- 💾 **Hard Drive Icon**: Item is localStorage-only
- 🔄 **Refresh Icon**: Sync in progress (animated)

### Component States

- **Loading**: Skeleton placeholders during initial load
- **Syncing**: Disabled controls with loading indicators
- **Error**: Error messages with retry options
- **Success**: Confirmation toasts for completed operations

## Migration Guide

### From localStorage-only to Sync System

The system is fully backward compatible:

1. **Existing Data**: All localStorage history preserved
2. **No Breaking Changes**: Existing components continue to work
3. **Gradual Enhancement**: Sync features only activate for authenticated users
4. **Automatic Migration**: Login triggers automatic sync of existing data

### API Integration

For custom implementations:

```typescript
// Check if user is authenticated
const { data: session, status } = useSession();

// Sync existing localStorage data
if (status === 'authenticated') {
  const unsyncedItems = getUnsyncedHistory();
  const dbFormatItems = convertLocalToDbHistory(unsyncedItems);

  await fetch('/api/reading-progress/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ progressItems: dbFormatItems }),
  });
}
```

## Performance Considerations

### Optimization Strategies

1. **Debounced Sync**: Reading progress updates debounced to prevent excessive API calls
2. **Incremental Sync**: Only unsynced items sent to database
3. **Lazy Loading**: Database sync only triggered when needed
4. **Caching**: localStorage acts as local cache for quick access

### Monitoring

- **Sync Metrics**: Track sync success/failure rates
- **Performance**: Monitor API response times
- **Storage Usage**: Monitor localStorage size limits
- **Error Rates**: Track and alert on sync failures

## Security

### Data Protection

1. **Authentication**: All database operations require valid session
2. **Authorization**: Users can only access their own reading progress
3. **Validation**: All API inputs validated with Zod schemas
4. **Rate Limiting**: Prevent abuse of sync endpoints

### Privacy

- **Local Storage**: Non-authenticated data stays local
- **Data Ownership**: Users control their reading history
- **Deletion**: Complete data removal available
- **Transparent Operation**: Sync happens silently without exposing technical details

## Troubleshooting

### Common Issues

1. **Sync Not Working**: Check authentication status and network connectivity
2. **Data Loss**: Verify localStorage permissions and storage limits
3. **Slow Performance**: Check for large history sizes or network issues
4. **Duplicate Entries**: Conflict resolution should handle this automatically

### Debug Tools

```typescript
// Check localStorage data
const localHistory = getReadingHistory();
console.log('Local history:', localHistory);

// Check all items (for sync debugging)
const allItems = getUnsyncedHistory();
console.log('All items:', allItems);

// Check browser console for sync errors
// Sync operations log errors silently to console
```

## Future Enhancements

### Planned Features

1. **Offline Support**: Queue sync operations when offline
2. **Bulk Operations**: Batch multiple reading sessions
3. **Analytics**: Reading pattern insights
4. **Export/Import**: Data portability features
5. **Advanced Filtering**: Search and filter reading history

### API Extensions

1. **Reading Statistics**: Time spent reading, pages read
2. **Reading Goals**: Progress tracking and achievements
3. **Social Features**: Share reading progress
4. **Recommendations**: Based on reading history

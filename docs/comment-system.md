# Comment System Documentation

## Overview

The comment system provides comprehensive commenting functionality for the manga website, including user comments, replies, moderation, and engagement features like likes/dislikes and reporting.

## Features

### Core Functionality

- ✅ User comments on manga and chapters
- ✅ Threaded replies (nested comments)
- ✅ Like/dislike system
- ✅ Comment reporting and moderation
- ✅ Real-time comment counts
- ✅ Pagination for large comment threads
- ✅ User authentication integration
- ✅ Admin moderation interface

### Content Management

- ✅ Rich text content support
- ✅ Character limits (2000 characters)
- ✅ Spam detection and filtering
- ✅ Comment editing (24-hour window)
- ✅ Comment deletion (by author or admin)
- ✅ Comment status management (PENDING, APPROVED, REJECTED, FLAGGED)

### User Experience

- ✅ Responsive design for mobile and desktop
- ✅ Loading states and error handling
- ✅ Optimistic UI updates
- ✅ Sort options (newest, oldest, most liked)
- ✅ User role badges (admin, moderator)
- ✅ Avatar integration with fallback

## Database Schema

### Comments Table

```sql
CREATE TABLE "Comments" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "comic_id" INTEGER,
  "chapter_id" INTEGER,
  "parent_comment_id" INTEGER,
  "content" TEXT NOT NULL,
  "status" "CommentStatus" DEFAULT 'APPROVED',
  "likes_count" INTEGER DEFAULT 0,
  "dislikes_count" INTEGER DEFAULT 0,
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### CommentLike Table

```sql
CREATE TABLE "CommentLike" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "comment_id" INTEGER NOT NULL,
  "is_like" BOOLEAN NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("user_id", "comment_id")
);
```

### CommentReport Table

```sql
CREATE TABLE "CommentReport" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "comment_id" INTEGER NOT NULL,
  "reason" VARCHAR(255) NOT NULL,
  "details" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("user_id", "comment_id")
);
```

## API Endpoints

### Public Endpoints

#### GET /api/comments

Get paginated comments for a manga or chapter.

**Query Parameters:**

- `comic_id` (optional): Manga ID
- `chapter_id` (optional): Chapter ID
- `page` (default: 1): Page number
- `limit` (default: 20, max: 100): Items per page
- `sort` (default: newest): Sort order (newest, oldest, most_liked)

#### GET /api/comments/recent

Get recent approved comments across all manga.

**Query Parameters:**

- `limit` (default: 10, max: 50): Number of comments to return

### Authenticated Endpoints

#### POST /api/comments

Create a new comment (requires authentication).

**Request Body:**

```json
{
  "content": "Comment content",
  "comic_id": 123,
  "chapter_id": 456,
  "parent_comment_id": 789
}
```

#### PUT /api/comments/[commentId]

Update a comment (only by author, within 24 hours).

#### DELETE /api/comments/[commentId]

Delete a comment (by author or admin).

#### POST /api/comments/[commentId]/like

Toggle like/dislike on a comment.

**Request Body:**

```json
{
  "is_like": true
}
```

#### POST /api/comments/[commentId]/report

Report a comment for moderation.

**Request Body:**

```json
{
  "reason": "spam",
  "details": "Optional additional details"
}
```

### Admin Endpoints

#### GET /api/admin/comments

Get comments for moderation with filtering options.

#### POST /api/admin/comments

Bulk moderation actions (approve, reject, flag, delete).

#### PUT /api/admin/comments/[commentId]

Update comment status.

## Components

### CommentSection

Main container component that handles:

- Comment fetching and pagination
- Sort options
- Comment form integration
- Loading and error states

**Props:**

```typescript
interface CommentSectionProps {
  mangaId?: number;
  chapterId?: number;
  mangaSlug?: string;
  chapterSlug?: string;
  initialCommentsCount?: number;
}
```

### CommentItem

Individual comment display component with:

- User information and avatars
- Like/dislike buttons
- Reply functionality
- Edit/delete actions
- Nested replies

### CommentForm

Comment creation and editing form with:

- Rich text input
- Character count
- Validation
- Community guidelines

### CommentPagination

Pagination controls for comment navigation.

### CommentReportDialog

Modal for reporting inappropriate comments.

## Rate Limiting

- **Comments per hour:** 10 per user
- **Comments per day:** 50 per user
- **Minimum time between comments:** 30 seconds
- **Auto-flagging:** Comments with 3+ reports are automatically flagged

## Moderation Features

### Automatic Moderation

- Spam keyword detection
- Rate limiting enforcement
- Auto-flagging based on reports

### Manual Moderation

- Admin dashboard for comment review
- Bulk actions (approve, reject, flag, delete)
- User comment history
- Report management

### Comment Status Flow

1. **PENDING** - New comments with spam indicators
2. **APPROVED** - Visible to all users
3. **REJECTED** - Hidden from public view
4. **FLAGGED** - Requires admin review

## Integration Guide

### Adding Comments to a Page

```tsx
import CommentSection from '@/components/feature/comments/CommentSection';

export default function MangaPage({ manga }) {
  return (
    <div>
      {/* Manga content */}

      <CommentSection
        mangaId={manga.id}
        mangaSlug={manga.slug}
        initialCommentsCount={manga.commentsCount}
      />
    </div>
  );
}
```

### Adding Comments to Chapter Pages

```tsx
import CommentSection from '@/components/feature/comments/CommentSection';

export default function ChapterPage({ chapter }) {
  return (
    <div>
      {/* Chapter content */}

      <CommentSection
        mangaId={chapter.comic_id}
        chapterId={chapter.id}
        mangaSlug={chapter.Comics.slug}
        chapterSlug={chapter.slug}
      />
    </div>
  );
}
```

## Security Considerations

- All user input is validated and sanitized
- Rate limiting prevents spam
- CSRF protection on all endpoints
- Authentication required for posting
- XSS prevention through content sanitization
- SQL injection prevention through Prisma ORM

## Performance Optimizations

- Database indexes on frequently queried fields
- Cursor-based pagination for large datasets
- Optimistic UI updates for better UX
- Efficient query patterns with Prisma
- Comment count caching strategies

## Testing

### Unit Tests

- API endpoint validation
- Comment CRUD operations
- Rate limiting functionality
- Spam detection algorithms

### Integration Tests

- Complete comment workflows
- Authentication integration
- Database operations
- Error handling scenarios

### E2E Tests

- User comment posting flow
- Moderation workflows
- Mobile responsiveness
- Cross-browser compatibility

## Future Enhancements

- [ ] Real-time comments with WebSocket
- [ ] Comment notifications
- [ ] User mention system (@username)
- [ ] Comment search functionality
- [ ] Advanced rich text editor
- [ ] Comment analytics dashboard
- [ ] Mobile app API support
- [ ] Comment export functionality

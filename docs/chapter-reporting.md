# Chapter Error Reporting System

## Overview

The chapter error reporting system allows users to report technical issues with manga chapters, such as broken images, missing pages, or content quality problems. This helps maintain content quality and provides a way for users to communicate issues to administrators.

## Features

### User Features

- **Report Chapter Issues**: Users can report various types of chapter problems
- **Issue Categories**: Predefined categories for common issues
- **Additional Details**: Optional text field for detailed descriptions
- **One Report Per Chapter**: Users can only report each chapter once
- **Authentication Required**: Users must be logged in to report issues

### Admin Features

- **View All Reports**: Admins can view all chapter reports
- **Report Management**: Update report status (pending, resolved, dismissed)
- **Detailed Information**: See reporter details and chapter information
- **Filtering**: Filter reports by status

## Issue Categories

1. **Broken Images** - Images that fail to load or display incorrectly
2. **Missing Pages** - Pages that are missing from the chapter
3. **Wrong Order** - Pages displayed in incorrect sequence
4. **Duplicate Pages** - Same page appears multiple times
5. **Poor Quality** - Low resolution or unreadable images
6. **Wrong Chapter** - Incorrect chapter content uploaded
7. **Corrupted Content** - Damaged or unreadable content
8. **Other** - Any other issues not covered above

## User Interface

### Report Button Locations

1. **Navigation Bar**: Icon-only button in the chapter reader navigation
2. **End of Chapter**: Full button with text at the end of each chapter

### Report Dialog

- **Issue Type Selection**: Dropdown with predefined categories
- **Details Field**: Optional text area for additional information
- **Validation**: Required fields and character limits
- **Success Feedback**: Toast notification on successful submission

## API Endpoints

### User Endpoints

- `POST /api/chapters/[id]/report` - Submit a chapter report
- `GET /api/chapters/[id]/report` - Get reports for a chapter (admin only)

### Admin Endpoints

- `GET /api/admin/chapter-reports` - Get all chapter reports with pagination
- `PATCH /api/admin/chapter-reports` - Update report status

## Database Schema

### ChapterReport Model

```prisma
model ChapterReport {
  id         Int      @id @default(autoincrement())
  user_id    Int      // User who reported
  chapter_id Int      // Chapter being reported
  reason     String   // Issue category
  details    String?  // Additional details
  status     String   @default("pending") // pending, resolved, dismissed
  created_at DateTime @default(now())
  updated_at DateTime @default(now())

  // Relations
  Users    Users    @relation(fields: [user_id], references: [id])
  Chapters Chapters @relation(fields: [chapter_id], references: [id])

  @@unique([user_id, chapter_id])
}
```

## Implementation Details

### Components

- `ChapterReportButton` - Reusable report button component
- `ChapterReportDialog` - Modal dialog for submitting reports
- Integrated into `MangaReader` and `ReaderNavigation` components

### Validation

- Zod schemas for request validation
- TypeScript types for type safety
- Client-side and server-side validation

### Security

- Authentication required for reporting
- Rate limiting through unique constraint
- Admin-only access for report management

## Usage Examples

### Basic Report Button

```tsx
<ChapterReportButton chapterId={123} chapterTitle='Chapter 1' mangaTitle='Example Manga' />
```

### Icon-Only Button

```tsx
<ChapterReportButton
  chapterId={123}
  chapterTitle='Chapter 1'
  mangaTitle='Example Manga'
  variant='ghost'
  size='icon'
  iconOnly={true}
/>
```

## Future Enhancements

- Email notifications for admins when reports are submitted
- Automatic issue detection (e.g., broken image links)
- Report analytics and trending issues
- User reputation system for report quality
- Integration with content management workflow

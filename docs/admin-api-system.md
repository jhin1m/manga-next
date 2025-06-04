# Admin API System Documentation

## Overview

The Admin API System provides comprehensive administrative functionality for the manga website, including user management, content moderation, analytics, and system administration. The system is built with NextJS 15 API routes, Prisma ORM, and follows role-based access control (RBAC) principles.

## Architecture

### Core Components

1. **Admin Middleware** (`src/lib/admin/middleware.ts`)
   - Authentication and authorization
   - Role-based permissions
   - Rate limiting and audit logging
   - Utility functions for pagination and error handling

2. **Admin Types** (`src/types/admin.ts`)
   - TypeScript interfaces and enums
   - Zod validation schemas
   - Request/response type definitions

3. **Centralized API Client** (`src/lib/api/client.ts`)
   - Type-safe API endpoints
   - Consistent fetch configuration
   - Admin-specific API functions

## Role Hierarchy

The system implements a hierarchical role structure:

```
super_admin > admin > moderator > editor > user
```

### Role Permissions

| Permission | Editor | Moderator | Admin | Super Admin |
|------------|--------|-----------|-------|-------------|
| Manage Manga | ✅ | ✅ | ✅ | ✅ |
| Delete Manga | ❌ | ❌ | ✅ | ✅ |
| Manage Chapters | ✅ | ✅ | ✅ | ✅ |
| Delete Chapters | ❌ | ❌ | ✅ | ✅ |
| Moderate Comments | ❌ | ✅ | ✅ | ✅ |
| Ban Users | ❌ | ✅ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ✅ | ✅ |
| Delete Users | ❌ | ❌ | ❌ | ✅ |
| Change User Roles | ❌ | ❌ | ❌ | ✅ |
| System Management | ❌ | ❌ | ❌ | ✅ |
| Access Analytics | ❌ | ❌ | ✅ | ✅ |

## API Endpoints

### Authentication

#### POST `/api/admin/auth/login`
Admin login with enhanced security features.

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "password123",
  "remember": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "avatar_url": null
  }
}
```

#### POST `/api/admin/auth/logout`
Admin logout with audit logging.

#### GET `/api/admin/auth/session`
Get current admin session with permissions.

**Response:**
```json
{
  "success": true,
  "authenticated": true,
  "isAdmin": true,
  "user": { ... },
  "permissions": {
    "canManageUsers": true,
    "canBanUsers": true,
    "canDeleteUsers": false,
    ...
  }
}
```

### Dashboard

#### GET `/api/admin/dashboard`
Get dashboard statistics and overview data.

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "users": {
        "total": 1250,
        "active": 890,
        "banned": 15,
        "newToday": 12,
        "newThisWeek": 85
      },
      "manga": {
        "total": 450,
        "published": 380,
        "pending": 25,
        "draft": 45,
        "newToday": 3
      },
      ...
    },
    "recentActivities": { ... }
  }
}
```

### Manga Management

#### GET `/api/admin/manga`
Get manga list with admin details and filters.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `sort` (string): Sort field (title, status, views, created_at)
- `order` (string): Sort order (asc, desc)
- `search` (string): Search query
- `status` (string): Filter by status

#### POST `/api/admin/manga`
Create new manga.

**Request:**
```json
{
  "title": "New Manga Title",
  "slug": "new-manga-title",
  "description": "Manga description...",
  "cover_url": "https://example.com/cover.jpg",
  "author_id": 1,
  "genre_ids": [1, 2, 3],
  "status": "draft"
}
```

#### GET `/api/admin/manga/[id]`
Get detailed manga information.

#### PUT `/api/admin/manga/[id]`
Update manga information.

#### DELETE `/api/admin/manga/[id]`
Delete manga (admin+ only).

#### POST `/api/admin/manga/bulk`
Perform bulk operations on manga.

**Request:**
```json
{
  "action": "approve",
  "ids": [1, 2, 3],
  "reason": "Bulk approval",
  "notify": true
}
```

**Available Actions:**
- `approve`: Approve and publish manga
- `reject`: Reject manga submissions
- `publish`: Publish draft/pending manga
- `archive`: Archive manga
- `delete`: Permanently delete manga (admin+ only)

### User Management

#### GET `/api/admin/users`
Get users list with admin details and filters.

#### POST `/api/admin/users`
Create new user.

#### GET `/api/admin/users/[id]`
Get detailed user information.

#### PUT `/api/admin/users/[id]`
Update user information.

#### DELETE `/api/admin/users/[id]`
Delete user (super admin only).

#### POST `/api/admin/users/[id]/ban`
Ban a user.

**Request:**
```json
{
  "reason": "Violation of community guidelines",
  "duration": 30,
  "notify": true
}
```

#### DELETE `/api/admin/users/[id]/ban`
Unban a user.

### Analytics

#### GET `/api/admin/analytics`
Get analytics data for admin dashboard.

**Query Parameters:**
- `period` (string): Time period (day, week, month, year)
- `startDate` (string): Start date (ISO format)
- `endDate` (string): End date (ISO format)
- `type` (string): Analytics type (views, users, manga, chapters)

**Response:**
```json
{
  "success": true,
  "data": {
    "analytics": {
      "userRegistrations": {
        "labels": ["Jan", "Feb", "Mar"],
        "datasets": [{
          "label": "New Users",
          "data": [45, 67, 89],
          "backgroundColor": "rgba(59, 130, 246, 0.5)"
        }]
      },
      "views": { ... },
      "manga": { ... },
      "chapters": { ... }
    },
    "popularContent": {
      "popularManga": [...],
      "popularChapters": [...],
      "topGenres": [...]
    }
  }
}
```

## Security Features

### Rate Limiting
- Login attempts: 5 attempts per 15 minutes per IP
- Admin actions: 10 attempts per 15 minutes per user

### Audit Logging
All admin actions are logged with:
- Admin user ID
- Action performed
- Resource type and ID
- Additional details
- IP address and user agent
- Timestamp

### Permission Checks
- Route-level authentication middleware
- Action-specific permission validation
- Role hierarchy enforcement
- Self-action prevention (e.g., can't ban yourself)

## Usage Examples

### Using the Admin API Client

```typescript
import { adminApi } from '@/lib/api/client'

// Login
const loginResult = await adminApi.auth.login({
  email: 'admin@example.com',
  password: 'password123'
})

// Get dashboard stats
const dashboardData = await adminApi.dashboard.getStats()

// Get manga list
const mangaList = await adminApi.manga.getList({
  page: 1,
  limit: 20,
  status: 'pending'
})

// Ban a user
const banResult = await adminApi.users.ban(userId, {
  reason: 'Spam posting',
  duration: 7,
  notify: true
})

// Get analytics
const analytics = await adminApi.analytics.getData({
  period: 'week',
  type: 'views'
})
```

### Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```

Common HTTP status codes:
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (not authenticated)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate data)
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error

## Development Guidelines

### Adding New Admin Endpoints

1. Create the API route in `src/app/api/admin/`
2. Use `withAdminAuth()` wrapper for authentication
3. Implement proper permission checks
4. Add audit logging for important actions
5. Update the API client in `src/lib/api/client.ts`
6. Add TypeScript types in `src/types/admin.ts`

### Testing Admin APIs

```bash
# Test admin login
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Test dashboard (requires authentication)
curl -X GET http://localhost:3000/api/admin/dashboard \
  -H "Cookie: next-auth.session-token=..."
```

## Future Enhancements

1. **Audit Log Database Table**: Store audit logs in database for better tracking
2. **Real-time Notifications**: WebSocket-based admin notifications
3. **Advanced Analytics**: More detailed analytics and reporting
4. **Bulk Import/Export**: CSV/JSON import/export functionality
5. **Content Scheduling**: Schedule manga/chapter publications
6. **Advanced Moderation**: AI-powered content moderation
7. **Multi-language Support**: Admin interface internationalization

## Security Considerations

1. Always validate input data with Zod schemas
2. Implement proper rate limiting for all endpoints
3. Log all admin actions for audit trails
4. Use HTTPS in production
5. Implement CSRF protection
6. Regular security audits and updates
7. Monitor for suspicious admin activities

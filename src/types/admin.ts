import { z } from 'zod'

// Admin Role Enums
export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  EDITOR = 'editor'
}

export enum UserStatus {
  ACTIVE = 'active',
  BANNED = 'banned',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

export enum MangaStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PUBLISHED = 'published',
  REJECTED = 'rejected',
  ARCHIVED = 'archived'
}

export enum BulkAction {
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject',
  BAN = 'ban',
  UNBAN = 'unban',
  ARCHIVE = 'archive',
  PUBLISH = 'publish'
}

// Admin Authentication Types
export interface AdminLoginRequest {
  email: string
  password: string
  remember?: boolean
}

export interface AdminLoginResponse {
  success: boolean
  user: {
    id: number
    username: string
    email: string
    role: string
    avatar_url?: string
  }
  token?: string
  message?: string
}

// Dashboard Statistics Types
export interface DashboardStats {
  users: {
    total: number
    active: number
    banned: number
    newToday: number
    newThisWeek: number
  }
  manga: {
    total: number
    published: number
    pending: number
    draft: number
    newToday: number
  }
  chapters: {
    total: number
    newToday: number
    newThisWeek: number
  }
  comments: {
    total: number
    pending: number
    flagged: number
    newToday: number
  }
  reports: {
    total: number
    pending: number
    resolved: number
    newToday: number
  }
  views: {
    totalToday: number
    totalThisWeek: number
    totalThisMonth: number
  }
}

// User Management Types
export interface AdminUser {
  id: number
  username: string
  email: string
  role: string
  status: UserStatus
  avatar_url?: string
  created_at: string
  updated_at: string
  last_login?: string
  
  // Statistics
  stats?: {
    commentsCount: number
    favoritesCount: number
    ratingsCount: number
    reportsCount: number
    chaptersRead: number
  }
  
  // Moderation info
  banInfo?: {
    bannedAt: string
    bannedBy: number
    reason: string
    expiresAt?: string
  }
}

export interface UserCreateRequest {
  username: string
  email: string
  password: string
  role: string
  avatar_url?: string
}

export interface UserUpdateRequest {
  username?: string
  email?: string
  role?: string
  avatar_url?: string
  status?: UserStatus
}

export interface UserBanRequest {
  reason: string
  duration?: number // days, null for permanent
  notify?: boolean
}

// Manga Management Types
export interface AdminManga {
  id: number
  title: string
  slug: string
  description?: string
  cover_url?: string
  status: MangaStatus
  author_id?: number
  created_at: string
  updated_at: string
  published_at?: string
  
  // Relations
  Authors?: {
    id: number
    name: string
  }
  Genres?: Array<{
    id: number
    name: string
    slug: string
  }>
  
  // Statistics
  stats?: {
    chaptersCount: number
    viewsCount: number
    favoritesCount: number
    ratingsCount: number
    averageRating: number
  }
}

export interface MangaCreateRequest {
  title: string
  slug: string
  description?: string
  cover_url?: string
  author_id?: number
  genre_ids?: number[]
  status?: MangaStatus
}

export interface MangaUpdateRequest {
  title?: string
  slug?: string
  description?: string
  cover_url?: string
  author_id?: number
  genre_ids?: number[]
  status?: MangaStatus
}

// Chapter Management Types
export interface AdminChapter {
  id: number
  title: string
  slug: string
  chapter_number: number
  comic_id: number
  content?: string
  images?: string[]
  status: string
  created_at: string
  updated_at: string
  published_at?: string
  
  // Relations
  Comics: {
    id: number
    title: string
    slug: string
  }
  Users?: {
    id: number
    username: string
  }
  
  // Statistics
  stats?: {
    viewsCount: number
    reportsCount: number
  }
}

export interface ChapterCreateRequest {
  title: string
  slug: string
  chapter_number: number
  comic_id: number
  content?: string
  images?: string[]
  status?: string
}

export interface ChapterUpdateRequest {
  title?: string
  slug?: string
  chapter_number?: number
  content?: string
  images?: string[]
  status?: string
}

export interface ChapterReorderRequest {
  chapterId: number
  newOrder: number
}

// Bulk Operations Types
export interface BulkOperationRequest {
  action: BulkAction
  ids: number[]
  reason?: string
  duration?: number
  notify?: boolean
}

export interface BulkOperationResponse {
  success: boolean
  processed: number
  failed: number
  errors?: Array<{
    id: number
    error: string
  }>
  message: string
}

// Analytics Types
export interface AnalyticsQuery {
  period: 'day' | 'week' | 'month' | 'year'
  startDate?: string
  endDate?: string
  type?: 'views' | 'users' | 'manga' | 'chapters'
}

export interface AnalyticsData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
  }>
}

// System Management Types
export interface SystemSettings {
  siteName: string
  siteDescription: string
  siteUrl: string
  maintenanceMode: boolean
  registrationEnabled: boolean
  commentsEnabled: boolean
  ratingsEnabled: boolean
  maxFileSize: number
  allowedImageTypes: string[]
  cacheEnabled: boolean
  cacheTtl: number
}

export interface CacheStats {
  totalKeys: number
  memoryUsage: number
  hitRate: number
  missRate: number
  evictions: number
}

// Validation Schemas
export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional()
})

export const userCreateSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['user', 'moderator', 'editor', 'admin', 'super_admin']),
  avatar_url: z.string().url().optional()
})

export const userUpdateSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  email: z.string().email().optional(),
  role: z.enum(['user', 'moderator', 'editor', 'admin', 'super_admin']).optional(),
  avatar_url: z.string().url().optional(),
  status: z.enum(['active', 'banned', 'suspended', 'pending']).optional()
})

export const userBanSchema = z.object({
  reason: z.string().min(10).max(500),
  duration: z.number().int().positive().optional(),
  notify: z.boolean().default(true)
})

export const mangaCreateSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  cover_url: z.string().url().optional(),
  author_id: z.number().int().positive().optional(),
  genre_ids: z.array(z.number().int().positive()).optional(),
  status: z.enum(['draft', 'pending', 'published', 'rejected', 'archived']).default('draft')
})

export const mangaUpdateSchema = mangaCreateSchema.partial()

export const chapterCreateSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  chapter_number: z.number().positive(),
  comic_id: z.number().int().positive(),
  content: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  status: z.string().default('draft')
})

export const chapterUpdateSchema = chapterCreateSchema.partial().omit({ comic_id: true })

export const bulkOperationSchema = z.object({
  action: z.enum(['delete', 'approve', 'reject', 'ban', 'unban', 'archive', 'publish']),
  ids: z.array(z.number().int().positive()).min(1),
  reason: z.string().min(10).max(500).optional(),
  duration: z.number().int().positive().optional(),
  notify: z.boolean().default(true)
})

export const analyticsQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']).default('week'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  type: z.enum(['views', 'users', 'manga', 'chapters']).optional()
})

import { z } from 'zod'

// Enums
export enum CommentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  FLAGGED = 'FLAGGED'
}

// Base comment interface
export interface Comment {
  id: number
  user_id: number
  comic_id?: number
  chapter_id?: number
  parent_comment_id?: number
  content: string
  status: CommentStatus
  likes_count: number
  dislikes_count: number
  created_at: string
  updated_at: string
  
  // Relations
  Users: {
    id: number
    username: string
    avatar_url?: string
    role: string
  }
  Comics?: {
    id: number
    title: string
    slug: string
  }
  Chapters?: {
    id: number
    title: string
    chapter_number: number
    slug: string
  }
  Comments?: Comment // Parent comment
  other_Comments?: Comment[] // Replies
  CommentLikes?: CommentLike[]
  
  // Computed fields
  userLikeStatus?: 'like' | 'dislike' | null
  repliesCount?: number
}

export interface CommentLike {
  id: number
  user_id: number
  comment_id: number
  is_like: boolean
  created_at: string
}

export interface CommentReport {
  id: number
  user_id: number
  comment_id: number
  reason: string
  details?: string
  created_at: string
}

// API Request/Response types
export interface CommentListResponse {
  comments: Comment[]
  pagination: {
    total: number
    currentPage: number
    totalPages: number
    perPage: number
  }
}

export interface CommentCreateRequest {
  content: string
  comic_id?: number
  chapter_id?: number
  parent_comment_id?: number
}

export interface CommentUpdateRequest {
  content: string
}

export interface CommentLikeRequest {
  is_like: boolean // true for like, false for dislike
}

export interface CommentReportRequest {
  reason: string
  details?: string
}

// Validation schemas
export const commentCreateSchema = z.object({
  content: z.string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment cannot exceed 2000 characters')
    .refine(content => content.trim().length > 0, 'Comment cannot be only whitespace'),
  comic_id: z.number().int().positive().optional(),
  chapter_id: z.number().int().positive().optional(),
  parent_comment_id: z.number().int().positive().optional(),
}).refine(data => data.comic_id || data.chapter_id, {
  message: 'Either comic_id or chapter_id must be provided',
})

export const commentUpdateSchema = z.object({
  content: z.string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment cannot exceed 2000 characters')
    .refine(content => content.trim().length > 0, 'Comment cannot be only whitespace'),
})

export const commentLikeSchema = z.object({
  is_like: z.boolean(),
})

export const commentReportSchema = z.object({
  reason: z.enum([
    'spam',
    'harassment',
    'inappropriate_content',
    'spoilers',
    'off_topic',
    'other'
  ]),
  details: z.string().max(500).optional(),
})

export const commentModerationSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'FLAGGED']),
})

// Query parameters for comment listing
export const commentQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1),
  limit: z.string().transform(val => Math.min(parseInt(val) || 20, 100)),
  sort: z.enum(['newest', 'oldest', 'most_liked']).default('newest'),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'FLAGGED']).optional(),
})

// Rate limiting constants
export const COMMENT_RATE_LIMITS = {
  MAX_COMMENTS_PER_HOUR: 10,
  MAX_COMMENTS_PER_DAY: 50,
  MIN_TIME_BETWEEN_COMMENTS: 30, // seconds
} as const

// Comment content validation
export const COMMENT_VALIDATION = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 2000,
  SPAM_KEYWORDS: [
    'spam', 'advertisement', 'promotion', 'buy now', 'click here',
    'free money', 'get rich', 'make money fast'
  ],
} as const

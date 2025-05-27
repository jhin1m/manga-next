import { z } from 'zod'

// Chapter report types
export interface ChapterReport {
  id: number
  user_id: number
  chapter_id: number
  reason: string
  details?: string
  status: 'pending' | 'resolved' | 'dismissed'
  created_at: string
  updated_at: string
  Users?: {
    id: number
    username: string
    role: string
  }
  Chapters?: {
    id: number
    title?: string
    chapter_number: number
    Comics: {
      id: number
      title: string
      slug: string
    }
  }
}

export interface ChapterReportRequest {
  reason: string
  details?: string
}

export interface ChapterReportResponse {
  message: string
  report: {
    id: number
    reason: string
    created_at: string
  }
}

// Validation schemas
export const chapterReportSchema = z.object({
  reason: z.enum([
    'broken_images',
    'missing_pages',
    'wrong_order',
    'duplicate_pages',
    'poor_quality',
    'wrong_chapter',
    'corrupted_content',
    'other'
  ]),
  details: z.string().max(500).optional(),
})

export const chapterReportModerationSchema = z.object({
  status: z.enum(['pending', 'resolved', 'dismissed']),
})

// Report reason labels for UI
export const CHAPTER_REPORT_REASONS = {
  broken_images: 'Broken or missing images',
  missing_pages: 'Missing pages',
  wrong_order: 'Pages in wrong order',
  duplicate_pages: 'Duplicate pages',
  poor_quality: 'Poor image quality',
  wrong_chapter: 'Wrong chapter content',
  corrupted_content: 'Corrupted or unreadable content',
  other: 'Other issue'
} as const

export type ChapterReportReason = keyof typeof CHAPTER_REPORT_REASONS

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
  details: z.string()
    .max(300, 'Details cannot exceed 50 words (approximately 300 characters)')
    .optional()
    .refine(
      (value) => {
        if (!value || value.trim().length === 0) return true;
        const wordCount = value.trim().split(/\s+/).length;
        return wordCount <= 50;
      },
      {
        message: 'Details cannot exceed 50 words'
      }
    ),
})

// Schema factory with i18n support
export function createChapterReportSchema(t: (key: string) => string) {
  return z.object({
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
    details: z.string()
      .max(300, t('characterLimitExceeded'))
      .optional()
      .refine(
        (value) => {
          if (!value || value.trim().length === 0) return true;
          const wordCount = value.trim().split(/\s+/).length;
          return wordCount <= 50;
        },
        {
          message: t('wordLimitExceeded')
        }
      ),
  })
}

export const chapterReportModerationSchema = z.object({
  status: z.enum(['pending', 'resolved', 'dismissed']),
})

// Report reason labels for UI (fallback - use i18n translations instead)
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

// Function to get translated reason labels
export function getTranslatedReasons(t: (key: string) => string) {
  return {
    broken_images: t('reasons.broken_images'),
    missing_pages: t('reasons.missing_pages'),
    wrong_order: t('reasons.wrong_order'),
    duplicate_pages: t('reasons.duplicate_pages'),
    poor_quality: t('reasons.poor_quality'),
    wrong_chapter: t('reasons.wrong_chapter'),
    corrupted_content: t('reasons.corrupted_content'),
    other: t('reasons.other')
  } as const
}

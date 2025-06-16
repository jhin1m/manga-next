import { z } from 'zod';

// Rating submission schema
export const ratingSubmissionSchema = z.object({
  mangaId: z.number().int().positive('Manga ID must be a positive integer'),
  rating: z
    .number()
    .min(0.5, 'Rating must be at least 0.5')
    .max(5.0, 'Rating must be at most 5.0')
    .refine(val => val % 0.5 === 0, 'Rating must be in 0.5 increments (0.5, 1.0, 1.5, etc.)'),
});

// Rating query schema for GET requests
export const ratingQuerySchema = z.object({
  mangaId: z.string().transform(val => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num <= 0) {
      throw new Error('Invalid manga ID');
    }
    return num;
  }),
});

// Rating response schema
export const ratingResponseSchema = z.object({
  averageRating: z.number().min(0).max(5),
  totalRatings: z.number().int().min(0),
  userRating: z.number().min(0).max(5).optional(),
});

// Rating statistics schema for database aggregation
export const ratingStatsSchema = z.object({
  _avg: z.object({
    rating: z.number().nullable(),
  }),
  _count: z.object({
    rating: z.number(),
  }),
});

// Types derived from schemas
export type RatingSubmission = z.infer<typeof ratingSubmissionSchema>;
export type RatingQuery = z.infer<typeof ratingQuerySchema>;
export type RatingResponse = z.infer<typeof ratingResponseSchema>;
export type RatingStats = z.infer<typeof ratingStatsSchema>;

// API response types
export interface RatingSubmissionResponse {
  success: boolean;
  message: string;
  data: {
    averageRating: number;
    totalRatings: number;
    userRating: number;
    wasFirstRating: boolean;
  };
}

export interface RatingGetResponse {
  success: boolean;
  data: RatingResponse;
}

// Error response type
export interface RatingErrorResponse {
  success: false;
  error: string;
  details?: string;
}

// Rate limiting constants for ratings
export const RATING_RATE_LIMITS = {
  MAX_RATINGS_PER_HOUR: 20, // Maximum ratings per user per hour
  MAX_RATINGS_PER_DAY: 100, // Maximum ratings per user per day
  MIN_TIME_BETWEEN_RATINGS: 10, // Minimum seconds between ratings for same manga
} as const;

// Rating validation constants
export const RATING_VALIDATION = {
  MIN_RATING: 0.5,
  MAX_RATING: 5.0,
  RATING_INCREMENT: 0.5,
} as const;

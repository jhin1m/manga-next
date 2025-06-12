'use client'

import { useState, useRef } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useRating } from '@/hooks/useRating'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface StarRatingProps {
  mangaId: number
  mangaSlug: string
  initialRating?: number
  initialUserRating?: number
  initialTotalRatings?: number
  className?: string
}

export function StarRating({
  mangaId,
  mangaSlug,
  initialRating = 0,
  initialUserRating = 0,
  initialTotalRatings = 0,
  className,
}: StarRatingProps) {
  const router = useRouter()
  const [hoveredRating, setHoveredRating] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // i18n translations
  const t = useTranslations('manga')
  const tCommon = useTranslations('common')

  const { ratingData, isLoading, isAuthenticated, submitRating } = useRating({
    mangaId,
    initialRating,
    initialUserRating,
    initialTotalRatings,
  })

  const handleStarClick = async (rating: number) => {
    if (!isAuthenticated) {
      toast.error(t('loginToRate'), {
        action: {
          label: tCommon('login'),
          onClick: () => router.push(`/auth/login?callbackUrl=/manga/${mangaSlug}`)
        }
      })
      return
    }

    if (isLoading) return

    try {
      const result = await submitRating(rating)
      toast.success(result.wasFirstRating ? t('ratingSubmitted') : t('ratingUpdated'))
    } catch (error) {
      console.error('Error submitting rating:', error)
      toast.error(t('ratingFailed'))
    }
  }

  const handleStarInteraction = (event: React.MouseEvent, starIndex: number) => {
    if (!containerRef.current) return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const width = rect.width
    const isLeftHalf = x < width / 2

    // Calculate rating: left half = X.5, right half = X.0
    const rating = isLeftHalf ? starIndex - 0.5 : starIndex
    return rating
  }

  const handleStarHover = (event: React.MouseEvent, starIndex: number) => {
    if (!isLoading) {
      const rating = handleStarInteraction(event, starIndex)
      if (rating !== undefined) {
        setHoveredRating(rating)
      }
    }
  }

  const handleStarClickEvent = async (event: React.MouseEvent, starIndex: number) => {
    const rating = handleStarInteraction(event, starIndex)
    if (rating !== undefined) {
      await handleStarClick(rating)
    }
  }

  const handleMouseLeave = () => {
    setHoveredRating(0)
  }

  const getStarFillState = (starIndex: number, rating: number) => {
    if (rating >= starIndex) {
      return 'full' // Fully filled
    } else if (rating >= starIndex - 0.5) {
      return 'half' // Half filled
    }
    return 'empty' // Empty
  }

  const getDisplayRating = () => {
    // Convert 5-star rating to 10-point scale
    const scaledRating = (ratingData.averageRating * 2).toFixed(1)
    // Show default rating of 8.0 when no ratings exist (as per user preference)
    return ratingData.averageRating > 0 ? scaledRating : '8.0'
  }

  const formatRatingCount = (count: number) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
    }
    return count.toString()
  }

  // Determine which rating to show for star fill (hover takes priority, then user rating, then average)
  // Show default rating of 4 stars (8/10) when no ratings exist
  const getDefaultRating = () => ratingData.averageRating > 0 ? ratingData.averageRating : 4.0
  const displayRatingForStars = hoveredRating || (isAuthenticated ? ratingData.userRating : getDefaultRating()) || 0

  return (
    <div className={cn('w-full', className)} ref={containerRef}>
      {/* Enhanced Rating Display with Border/Frame */}
      <div className="w-full border border-border rounded-lg bg-card/30 p-4 shadow-sm">
        {/* Full Width Layout: Rating Info Left, Stars Right */}
        <div className="flex items-center justify-between w-full">
          {/* Left Side - Rating Score and Count Display */}
          <div className="flex flex-col items-start text-left flex-shrink-0 min-w-0">
            {/* Large Rating Score */}
            <div className="text-xl font-bold text-foreground whitespace-nowrap">
              {getDisplayRating()}/10
            </div>
            {/* Rating Count */}
            <div className="text-xs lg:text-sm text-muted-foreground whitespace-nowrap">
              {formatRatingCount(ratingData.totalRatings)} {t('rating')}{ratingData.totalRatings !== 1}
            </div>
          </div>

          {/* Right Side - Interactive Star Rating */}
          <div className="flex items-center justify-end flex-shrink-0 overflow-hidden">
            <div
              className="flex items-center"
              onMouseLeave={handleMouseLeave}
              role="radiogroup"
              aria-label={`${t('rating')}: ${getDisplayRating()}/10`}
            >
              {[1, 2, 3, 4, 5].map((starIndex) => {
                const fillState = getStarFillState(starIndex, displayRatingForStars)

                return (
                  <Button
                    key={`star-${starIndex}`}
                    variant="ghost"
                    size="sm"
                    className="relative h-7 w-7 lg:h-8 lg:w-8 xl:h-10 xl:w-10 p-0 hover:bg-transparent group flex-shrink-0 rounded-none"
                    disabled={isLoading}
                    onClick={(e) => handleStarClickEvent(e, starIndex)}
                    onMouseMove={(e) => handleStarHover(e, starIndex)}
                    aria-label={`Rate ${starIndex} star${starIndex !== 1}`}
                  >
                    {/* Background star (empty state) */}
                    <Star
                      className={cn(
                        'absolute h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 transition-all duration-150',
                        'text-muted-foreground group-hover:text-yellow-400',
                        isLoading && 'opacity-50'
                      )}
                    />

                    {/* Half-filled star */}
                    {fillState === 'half' && (
                      <Star
                        className={cn(
                          'absolute h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 transition-all duration-150',
                          'fill-yellow-500 text-yellow-500',
                          hoveredRating > 0 && 'scale-110',
                          isLoading && 'opacity-50'
                        )}
                        style={{
                          clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)'
                        }}
                      />
                    )}

                    {/* Fully filled star */}
                    {fillState === 'full' && (
                      <Star
                        className={cn(
                          'absolute h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 transition-all duration-150',
                          'fill-yellow-500 text-yellow-500',
                          hoveredRating > 0 && 'scale-110',
                          isLoading && 'opacity-50'
                        )}
                      />
                    )}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-3 pt-3 border-t border-border">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>{tCommon('loading')}</span>
          </div>
        )}
      </div>
    </div>
  )
}

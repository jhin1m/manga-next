'use client'

import { useState, useRef } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useRating } from '@/hooks/useRating'
import { cn } from '@/lib/utils'

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

  const { ratingData, isLoading, isAuthenticated, submitRating } = useRating({
    mangaId,
    initialRating,
    initialUserRating,
    initialTotalRatings,
  })

  const handleStarClick = async (rating: number) => {
    if (!isAuthenticated) {
      toast.error('Please login to rate this manga', {
        action: {
          label: 'Login',
          onClick: () => router.push(`/auth/login?callbackUrl=/manga/${mangaSlug}`)
        }
      })
      return
    }

    if (isLoading) return

    try {
      const result = await submitRating(rating)
      toast.success(result.wasFirstRating ? 'Rating submitted!' : 'Rating updated!')
    } catch (error) {
      console.error('Error submitting rating:', error)
      toast.error('Failed to submit rating. Please try again.')
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
    return ratingData.averageRating > 0 ? scaledRating : '0.0'
  }

  const formatRatingCount = (count: number) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
    }
    return count.toString()
  }

  // Determine which rating to show for star fill (hover takes priority, then user rating, then average)
  const displayRatingForStars = hoveredRating || (isAuthenticated ? ratingData.userRating : ratingData.averageRating) || 0

  return (
    <div className={cn('space-y-3', className)} ref={containerRef}>
      {/* Unified Rating Display and Interaction */}
      <div className="space-y-2">
        {/* Interactive Star Rating with Inline Score */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {/* Star Rating Interface */}
          <div
            className="flex items-center gap-1 flex-shrink-0"
            onMouseLeave={handleMouseLeave}
          >
            {[1, 2, 3, 4, 5].map((starIndex) => {
              const fillState = getStarFillState(starIndex, displayRatingForStars)

              return (
                <Button
                  key={`star-${starIndex}`}
                  variant="ghost"
                  size="sm"
                  className="relative h-8 w-8 p-0 hover:bg-transparent group"
                  disabled={isLoading}
                  onClick={(e) => handleStarClickEvent(e, starIndex)}
                  onMouseMove={(e) => handleStarHover(e, starIndex)}
                  aria-label={`Rate ${starIndex} star${starIndex !== 1 ? 's' : ''}`}
                >
                  {/* Background star (empty state) */}
                  <Star
                    className={cn(
                      'absolute h-5 w-5 transition-all duration-150',
                      'text-muted-foreground group-hover:text-yellow-400',
                      isLoading && 'opacity-50'
                    )}
                  />

                  {/* Half-filled star */}
                  {fillState === 'half' && (
                    <Star
                      className={cn(
                        'absolute h-5 w-5 transition-all duration-150',
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
                        'absolute h-5 w-5 transition-all duration-150',
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

          {/* Rating Score and Count - Inline */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-light whitespace-nowrap">
              {getDisplayRating()}/10
            </span>
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              ({formatRatingCount(ratingData.totalRatings)} rating{ratingData.totalRatings !== 1 ? 's' : ''})
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

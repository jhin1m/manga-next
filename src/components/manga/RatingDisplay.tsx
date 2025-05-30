import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingDisplayProps {
  rating: number
  totalRatings?: number
  showCount?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function RatingDisplay({
  rating,
  totalRatings,
  showCount = true,
  size = 'sm',
  className,
}: RatingDisplayProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  const getDisplayRating = () => {
    return rating > 0 ? rating.toFixed(1) : '0.0'
  }

  const getStarFillState = (starIndex: number) => {
    if (rating >= starIndex) {
      return 'full' // Fully filled
    } else if (rating >= starIndex - 0.5) {
      return 'half' // Half filled
    }
    return 'empty' // Empty
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* Stars */}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const fillState = getStarFillState(starIndex)

          return (
            <div key={starIndex} className="relative">
              {/* Background star (empty state) */}
              <Star
                className={cn(
                  sizeClasses[size],
                  'transition-colors text-muted-foreground/50'
                )}
              />

              {/* Half-filled star */}
              {fillState === 'half' && (
                <Star
                  className={cn(
                    sizeClasses[size],
                    'absolute top-0 left-0 transition-colors fill-yellow-500 text-yellow-500'
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
                    sizeClasses[size],
                    'absolute top-0 left-0 transition-colors fill-yellow-500 text-yellow-500'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Rating Value */}
      <span className={cn('font-medium', textSizeClasses[size])}>
        {getDisplayRating()}
      </span>

      {/* Rating Count */}
      {showCount && totalRatings !== undefined && (
        <span className={cn('text-muted-foreground', textSizeClasses[size])}>
          ({totalRatings})
        </span>
      )}
    </div>
  )
}

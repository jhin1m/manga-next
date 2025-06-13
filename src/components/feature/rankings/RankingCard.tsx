'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Eye,
  Star,
  Heart,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ExternalLink
} from 'lucide-react'
import { useFormat } from '@/hooks/useFormat'
import { cn } from '@/lib/utils'
import type { MangaRankingItem } from '@/app/api/manga/rankings/route'

type RankingCategory = 'most_viewed' | 'highest_rated' | 'most_bookmarked' | 'trending'
type RankingPeriod = 'daily' | 'weekly' | 'monthly' | 'all_time'

interface RankingCardProps {
  manga: MangaRankingItem
  category: RankingCategory
  period: RankingPeriod
  rankIcon?: ReactNode
}

export default function RankingCard({
  manga,
  category,
  period,
  rankIcon
}: RankingCardProps) {
  const t = useTranslations('rankings')
  const { formatViews } = useFormat()
  const [showMobileStats] = useState(false)

  // Determine if this is a top 3 ranking
  const isTopThree = manga.rank <= 3
  const isTopOne = manga.rank === 1

  // Get the primary stat based on category
  const getPrimaryStat = () => {
    switch (category) {
      case 'most_viewed': {
        const viewCount = period === 'daily'
          ? manga.daily_views
          : period === 'weekly'
            ? manga.weekly_views
            : period === 'monthly'
              ? manga.monthly_views
              : manga.total_views
        return {
          value: formatViews(viewCount),
          label: t('stats.views'),
          icon: <Eye className="w-4 h-4" />
        }
      }
      case 'highest_rated':
        return {
          value: manga.average_rating ? `${manga.average_rating}/10` : 'N/A',
          label: `${manga.rating_count} ${t('stats.rating')}`,
          icon: <Star className="w-4 h-4" />
        }
      case 'most_bookmarked':
        return {
          value: formatViews(manga.total_favorites),
          label: t('stats.bookmarks'),
          icon: <Heart className="w-4 h-4" />
        }
      case 'trending': {
        const trendingViews = period === 'daily'
          ? manga.daily_views
          : period === 'weekly'
            ? manga.weekly_views
            : manga.monthly_views
        return {
          value: formatViews(trendingViews),
          label: t('stats.views'),
          icon: <TrendingUp className="w-4 h-4" />
        }
      }
      default:
        return {
          value: formatViews(manga.total_views),
          label: t('stats.views'),
          icon: <Eye className="w-4 h-4" />
        }
    }
  }

  // Get trend indicator
  const getTrendIndicator = () => {
    if (!manga.trend_direction || manga.trend_direction === 'stable') return null

    switch (manga.trend_direction) {
      case 'up':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
            <TrendingUp className="w-3 h-3 mr-1" />
            {t('stats.rising')}
          </Badge>
        )
      case 'down':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200">
            <TrendingDown className="w-3 h-3 mr-1" />
            Down
          </Badge>
        )
      case 'new':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
            <Sparkles className="w-3 h-3 mr-1" />
            {t('stats.newEntry')}
          </Badge>
        )
      default:
        return null
    }
  }

  // Get rank styling
  const getRankStyling = () => {
    if (isTopOne) {
      return "text-2xl font-bold text-yellow-600 bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-300"
    } else if (manga.rank === 2) {
      return "text-xl font-bold text-gray-600 bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300"
    } else if (manga.rank === 3) {
      return "text-xl font-bold text-amber-600 bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-300"
    } else if (manga.rank <= 10) {
      return "text-lg font-semibold text-primary bg-primary/10 border border-primary/20"
    } else {
      return "text-base font-medium text-muted-foreground bg-muted border border-border"
    }
  }

  const primaryStat = getPrimaryStat()
  const trendIndicator = getTrendIndicator()

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      isTopThree && "ring-2 ring-primary/20 bg-gradient-to-r from-primary/5 to-transparent",
      isTopOne && "ring-primary/40 shadow-lg"
    )}>
      <CardContent className="p-3 sm:p-4">
        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center gap-4">
          {/* Rank Number/Icon */}
          <div className="flex-shrink-0">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              getRankStyling()
            )}>
              {rankIcon || (
                <span className="font-bold">
                  #{manga.rank}
                </span>
              )}
            </div>
          </div>

          {/* Manga Cover */}
          <div className="flex-shrink-0">
            <Link href={`/manga/${manga.slug}`} className="block group">
              <div className="relative w-16 h-20 rounded-md overflow-hidden bg-muted">
                {manga.cover_image_url ? (
                  <Image
                    src={manga.cover_image_url}
                    alt={manga.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">No Image</span>
                  </div>
                )}
              </div>
            </Link>
          </div>

          {/* Manga Info */}
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <Link
                href={`/manga/${manga.slug}`}
                className="block group"
              >
                <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {manga.title}
                </h3>
              </Link>

              {/* Trend Indicator */}
              {trendIndicator && (
                <div className="mt-1">
                  {trendIndicator}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {/* Primary Stat */}
              <div className="flex items-center gap-1">
                {primaryStat.icon}
                <span className="font-medium text-foreground">{primaryStat.value}</span>
                <span>{primaryStat.label}</span>
              </div>

              {/* Secondary Stats */}
              {category !== 'highest_rated' && manga.average_rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  <span className="font-medium text-foreground">{manga.average_rating}</span>
                  <span>/10</span>
                </div>
              )}

              {category !== 'most_bookmarked' && manga.total_favorites > 0 && (
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span className="font-medium text-foreground">{formatViews(manga.total_favorites)}</span>
                </div>
              )}
            </div>

            {/* Rank Badge */}
            <div className="flex items-center gap-2">
              <Badge variant={isTopThree ? "default" : "secondary"} className="text-xs">
                {t('stats.rank', { rank: manga.rank })}
              </Badge>

              {isTopThree && (
                <Badge variant="outline" className="text-xs">
                  {t('stats.topRanked')}
                </Badge>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex-shrink-0">
            <Link href={`/manga/${manga.slug}`}>
              <Button variant="outline" size="sm">
                {t('actions.viewDetails')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="sm:hidden space-y-3">
          {/* Top Row: Rank + Cover + Title + Action */}
          <div className="flex items-start gap-3">
            {/* Rank Number/Icon */}
            <div className="flex-shrink-0">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                getRankStyling()
              )}>
                {rankIcon || (
                  <span className="font-bold text-xs">
                    #{manga.rank}
                  </span>
                )}
              </div>
            </div>

            {/* Manga Cover */}
            <div className="flex-shrink-0">
              <Link href={`/manga/${manga.slug}`} className="block group">
                <div className="relative w-12 h-16 rounded-md overflow-hidden bg-muted">
                  {manga.cover_image_url ? (
                    <Image
                      src={manga.cover_image_url}
                      alt={manga.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="48px"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">No Image</span>
                    </div>
                  )}
                </div>
              </Link>
            </div>

            {/* Title and Basic Info */}
            <div className="flex-1 min-w-0">
              <Link
                href={`/manga/${manga.slug}`}
                className="block group"
              >
                <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {manga.title}
                </h3>
              </Link>

              {/* Primary Stat - Mobile */}
              <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                {primaryStat.icon}
                <span className="font-medium text-foreground">{primaryStat.value}</span>
                <span className="text-xs">{primaryStat.label}</span>
              </div>

              {/* Trend Indicator - Mobile */}
              {trendIndicator && (
                <div className="mt-1">
                  {trendIndicator}
                </div>
              )}
            </div>

            {/* Mobile Action Button */}
            <div className="flex-shrink-0">
              <Link href={`/manga/${manga.slug}`}>
                <Button variant="outline" size="sm" className="h-8 px-2">
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Expandable Stats Section - Mobile */}
          <div className="space-y-2">

            {/* Expandable Content */}
            {showMobileStats && (
              <div className="space-y-2 pt-2 border-t border-border/50">
                {/* Secondary Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {category !== 'highest_rated' && manga.average_rating && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Star className="w-3 h-3" />
                      <span className="font-medium text-foreground">{manga.average_rating}</span>
                      <span>/10</span>
                    </div>
                  )}

                  {category !== 'most_bookmarked' && manga.total_favorites > 0 && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Heart className="w-3 h-3" />
                      <span className="font-medium text-foreground">{formatViews(manga.total_favorites)}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Eye className="w-3 h-3" />
                    <span className="font-medium text-foreground">{formatViews(manga.total_views)}</span>
                    <span>total</span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={isTopThree ? "default" : "secondary"} className="text-xs">
                    {t('stats.rank', { rank: manga.rank })}
                  </Badge>

                  {isTopThree && (
                    <Badge variant="outline" className="text-xs">
                      {t('stats.topRanked')}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

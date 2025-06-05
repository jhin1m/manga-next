'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Crown, Medal, Award, TrendingUp, Eye } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useFormat } from '@/hooks/useFormat'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { rankingsApi } from '@/lib/api/client'
import type { MangaRankingItem, MangaRankingsResponse } from '@/app/api/manga/rankings/route'

type RankingPeriod = 'daily' | 'weekly' | 'monthly'

interface MangaRankingsProps {
  className?: string
}

export default function MangaRankings({ className }: MangaRankingsProps) {
  const [activeTab, setActiveTab] = useState<RankingPeriod>('weekly')
  const [rankings, setRankings] = useState<Record<RankingPeriod, MangaRankingItem[]>>({
    daily: [],
    weekly: [],
    monthly: []
  })
  const [loading, setLoading] = useState<Record<RankingPeriod, boolean>>({
    daily: false,
    weekly: true, // Load weekly by default
    monthly: false
  })
  const [error, setError] = useState<Record<RankingPeriod, string | null>>({
    daily: null,
    weekly: null,
    monthly: null
  })

  const { formatViews } = useFormat()
  const t = useTranslations('sidebar.rankingsData')

  // Fetch rankings for a specific period
  const fetchRankings = async (period: RankingPeriod) => {
    if (rankings[period].length > 0) return // Already loaded

    setLoading(prev => ({ ...prev, [period]: true }))
    setError(prev => ({ ...prev, [period]: null }))

    try {
      const data: MangaRankingsResponse = await rankingsApi.getRankings({
        period,
        limit: 10
      })

      if (data.success) {
        setRankings(prev => ({
          ...prev,
          [period]: data.data.rankings
        }))
      } else {
        throw new Error(data.error || 'Unknown error')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to fetch ${period} rankings`
      setError(prev => ({ ...prev, [period]: errorMessage }))
      console.error(`Error fetching ${period} rankings:`, err)
    } finally {
      setLoading(prev => ({ ...prev, [period]: false }))
    }
  }

  // Load initial data
  useEffect(() => {
    fetchRankings('weekly')
  }, [])

  // Handle tab change
  const handleTabChange = (period: RankingPeriod) => {
    setActiveTab(period)
    fetchRankings(period)
  }

  // Get rank icon based on position
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-4 w-4 text-yellow-500" />
      case 2:
        return <Medal className="h-4 w-4 text-gray-400" />
      case 3:
        return <Award className="h-4 w-4 text-amber-600" />
      default:
        return null
    }
  }

  // Get rank styling
  const getRankStyling = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-500 font-bold text-lg"
      case 2:
        return "text-gray-400 font-semibold text-base"
      case 3:
        return "text-amber-600 font-semibold text-base"
      default:
        return "text-muted-foreground font-medium text-sm"
    }
  }

  // Get view count for current period
  const getViewCount = (manga: MangaRankingItem, period: RankingPeriod) => {
    switch (period) {
      case 'daily':
        return manga.daily_views
      case 'weekly':
        return manga.weekly_views
      case 'monthly':
        return manga.monthly_views
      default:
        return manga.weekly_views
    }
  }

  // Render ranking item
  const renderRankingItem = (manga: MangaRankingItem, period: RankingPeriod) => {
    const viewCount = getViewCount(manga, period)
    const isTopThree = manga.rank <= 3

    return (
      <Link
        key={manga.id}
        href={`/manga/${manga.slug}`}
        className="group block"
      >
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-lg transition-all duration-200",
          "hover:bg-muted/50 hover:shadow-sm",
          isTopThree && "bg-gradient-to-r from-primary/5 to-transparent border border-primary/10"
        )}>
          {/* Rank Number */}
          <div className="flex items-center justify-center w-8 h-8 flex-shrink-0">
            {getRankIcon(manga.rank) || (
              <span className={getRankStyling(manga.rank)}>
                {manga.rank}
              </span>
            )}
          </div>

          {/* Cover Image */}
          <div className="relative w-10 h-14 flex-shrink-0 overflow-hidden rounded-md shadow-sm">
            <img
              src={manga.cover_image_url || 'https://placehold.co/300x450/png'}
              alt={manga.title}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          </div>

          {/* Manga Info */}
          <div className="flex-1 min-w-0">
            <h4 className={cn(
              "font-medium text-sm leading-tight mb-1 transition-colors",
              "group-hover:text-primary",
              isTopThree ? "text-foreground" : "text-foreground/90"
            )}>
              <span className="line-clamp-2">
                {manga.title}
              </span>
            </h4>
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              <span>{formatViews(viewCount)}</span>
              {isTopThree && (
                <Badge variant="secondary" className="ml-1 text-xs px-1 py-0">
                  <TrendingUp className="h-2 w-2 mr-1" />
                  {t('trending')}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // Render loading state
  const renderLoading = () => (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 p-2">
          <div className="w-8 h-8 bg-muted rounded animate-pulse" />
          <div className="w-10 h-14 bg-muted rounded animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )

  // Render error state
  const renderError = (errorMessage: string) => (
    <div className="text-center py-8 text-muted-foreground">
      <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p className="text-sm">{t('errorLoading')}</p>
      <p className="text-xs mt-1">{errorMessage}</p>
    </div>
  )

  // Render empty state
  const renderEmpty = () => (
    <div className="text-center py-8 text-muted-foreground">
      <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p className="text-sm">{t('noRankings')}</p>
    </div>
  )

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as RankingPeriod)}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="daily" className="text-xs">
            {t('daily')}
          </TabsTrigger>
          <TabsTrigger value="weekly" className="text-xs">
            {t('weekly')}
          </TabsTrigger>
          <TabsTrigger value="monthly" className="text-xs">
            {t('monthly')}
          </TabsTrigger>
        </TabsList>

        {(['daily', 'weekly', 'monthly'] as RankingPeriod[]).map((period) => (
          <TabsContent key={period} value={period} className="mt-0">
            {loading[period] ? (
              renderLoading()
            ) : error[period] ? (
              renderError(error[period]!)
            ) : rankings[period].length === 0 ? (
              renderEmpty()
            ) : (
              <div className="space-y-1">
                {rankings[period].map((manga) => renderRankingItem(manga, period))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

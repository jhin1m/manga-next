'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// Removed loading overlay - using instant navigation
import { TrendingUp, Eye, Star, Heart, Trophy, Crown, Medal, Award } from 'lucide-react';
import { rankingsApi } from '@/lib/api/client';
import RankingCard from '@/components/feature/rankings/RankingCard';
import RankingFilters from '@/components/feature/rankings/RankingFilters';
import type { MangaRankingItem, MangaRankingsResponse } from '@/app/api/manga/rankings/route';

type RankingCategory = 'most_viewed' | 'highest_rated' | 'most_bookmarked' | 'trending';
type RankingPeriod = 'daily' | 'weekly' | 'monthly' | 'all_time';

interface RankingsState {
  rankings: MangaRankingItem[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

interface RankingsPageProps {
  initialCategory?: RankingCategory;
  initialPeriod?: RankingPeriod;
}

export default function RankingsPage({
  initialCategory = 'most_viewed',
  initialPeriod = 'weekly',
}: RankingsPageProps) {
  const [activeCategory, setActiveCategory] = useState<RankingCategory>(initialCategory);
  const [activePeriod, setActivePeriod] = useState<RankingPeriod>(initialPeriod);
  const [currentPage, setCurrentPage] = useState(1);
  const [rankingsState, setRankingsState] = useState<RankingsState>({
    rankings: [],
    loading: true,
    error: null,
    pagination: {
      page: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    },
  });

  const t = useTranslations('rankings');

  // Fetch rankings data
  const fetchRankings = async (
    category: RankingCategory,
    period: RankingPeriod,
    page: number = 1,
    append: boolean = false
  ) => {
    if (!append) {
      setRankingsState(prev => ({ ...prev, loading: true, error: null }));
    }

    try {
      const data: MangaRankingsResponse = await rankingsApi.getRankings({
        category,
        period,
        page,
        limit: 20,
      });

      if (data.success) {
        setRankingsState(prev => ({
          ...prev,
          rankings: append ? [...prev.rankings, ...data.data.rankings] : data.data.rankings,
          loading: false,
          pagination: {
            page: data.data.pagination?.page || 1,
            totalPages: data.data.pagination?.totalPages || 1,
            hasNext: data.data.pagination?.hasNext || false,
            hasPrevious: data.data.pagination?.hasPrevious || false,
          },
        }));
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch rankings';
      setRankingsState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      console.error('Error fetching rankings:', err);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchRankings(activeCategory, activePeriod, 1);
    setCurrentPage(1);
  }, [activeCategory, activePeriod]);

  // Handle category change
  const handleCategoryChange = (category: RankingCategory) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  // Handle period change
  const handlePeriodChange = (period: RankingPeriod) => {
    setActivePeriod(period);
    setCurrentPage(1);
  };

  // Handle load more
  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchRankings(activeCategory, activePeriod, nextPage, true);
  };

  // Get category icon
  const getCategoryIcon = (category: RankingCategory) => {
    switch (category) {
      case 'most_viewed':
        return <Eye className='w-5 h-5' />;
      case 'highest_rated':
        return <Star className='w-5 h-5' />;
      case 'most_bookmarked':
        return <Heart className='w-5 h-5' />;
      case 'trending':
        return <TrendingUp className='w-5 h-5' />;
      default:
        return <Trophy className='w-5 h-5' />;
    }
  };

  // Get rank icon for top 3
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className='w-6 h-6 text-yellow-500' />;
      case 2:
        return <Medal className='w-6 h-6 text-gray-400' />;
      case 3:
        return <Award className='w-6 h-6 text-amber-600' />;
      default:
        return null;
    }
  };

  // Render loading state
  const renderLoading = () => (
    <div className='flex items-center justify-center p-8'>
      <div className='flex items-center gap-2'>
        <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary'></div>
        <span>Loading rankings...</span>
      </div>
    </div>
  );

  // Render error state
  const renderError = () => (
    <Card className='p-8 text-center'>
      <CardContent>
        <div className='space-y-4'>
          <div className='text-muted-foreground'>
            <Trophy className='w-12 h-12 mx-auto mb-4 opacity-50' />
            <h3 className='text-lg font-semibold'>{t('error.title')}</h3>
            <p className='text-sm'>{t('error.description')}</p>
          </div>
          <Button onClick={() => fetchRankings(activeCategory, activePeriod, 1)} variant='outline'>
            {t('error.retry')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Render empty state
  const renderEmpty = () => (
    <Card className='p-8 text-center'>
      <CardContent>
        <div className='space-y-4'>
          <div className='text-muted-foreground'>
            <Trophy className='w-12 h-12 mx-auto mb-4 opacity-50' />
            <h3 className='text-lg font-semibold'>{t('empty.title')}</h3>
            <p className='text-sm'>{t('empty.description')}</p>
            <p className='text-xs'>{t('empty.suggestion')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className='container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8'>
      {/* Header */}
      <div className='text-center space-y-3 sm:space-y-4'>
        <h1 className='text-2xl sm:text-4xl font-bold tracking-tight'>{t('title')}</h1>
        <p className='text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto'>
          {t('subtitle')}
        </p>
      </div>

      {/* Filters */}
      <RankingFilters
        activeCategory={activeCategory}
        activePeriod={activePeriod}
        onCategoryChange={handleCategoryChange}
        onPeriodChange={handlePeriodChange}
      />

      {/* Current Selection Display */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-3'>
            {getCategoryIcon(activeCategory)}
            <span>{t(`categories.${activeCategory}`)}</span>
            <Badge variant='secondary'>{t(`periods.${activePeriod}`)}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rankingsState.loading && rankingsState.rankings.length === 0 ? (
            renderLoading()
          ) : rankingsState.error ? (
            renderError()
          ) : rankingsState.rankings.length === 0 ? (
            renderEmpty()
          ) : (
            <div className='space-y-4'>
              {/* Rankings List */}
              <div className='space-y-3'>
                {rankingsState.rankings.map(manga => (
                  <RankingCard
                    key={`${manga.id}-${manga.rank}`}
                    manga={manga}
                    category={activeCategory}
                    period={activePeriod}
                    rankIcon={getRankIcon(manga.rank)}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {rankingsState.pagination.hasNext && (
                <div className='text-center pt-6'>
                  <Button
                    onClick={handleLoadMore}
                    disabled={rankingsState.loading}
                    variant='outline'
                    size='lg'
                    className='w-full sm:w-auto'
                  >
                    {rankingsState.loading ? t('loading.title') : t('pagination.loadMore')}
                  </Button>
                </div>
              )}

              {/* Pagination Info */}
              <div className='text-center text-xs sm:text-sm text-muted-foreground pt-4'>
                {t('pagination.showingResults', {
                  start: 1,
                  end: rankingsState.rankings.length,
                  total: rankingsState.rankings.length,
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

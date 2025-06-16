'use client';

import { useState, useEffect, useCallback } from 'react';
import { Eye, TrendingUp, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFormat } from '@/hooks/useFormat';
import { useTranslations } from 'next-intl';

export interface ViewStatisticsData {
  daily_views: number;
  weekly_views: number;
  monthly_views: number;
  total_views?: number;
}

interface ViewStatisticsProps {
  entityType: 'comic' | 'chapter';
  entityId: number;
  initialData?: ViewStatisticsData;
  showTrends?: boolean;
  compact?: boolean;
  className?: string;
}

export function ViewStatistics({
  entityType,
  entityId,
  initialData,
  showTrends = false,
  compact = false,
  className = '',
}: ViewStatisticsProps) {
  const [statistics, setStatistics] = useState<ViewStatisticsData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const { formatViews } = useFormat();
  const t = useTranslations('viewStats');

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/view-statistics/${entityType}/${entityId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch view statistics');
      }

      const data = await response.json();

      if (data.success) {
        setStatistics(data.data.stored);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching view statistics:', err);
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    if (!initialData) {
      fetchStatistics();
    }
  }, [entityType, entityId, initialData, fetchStatistics]);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className='h-20 bg-muted rounded-lg'></div>
      </div>
    );
  }

  if (error || !statistics) {
    return (
      <div className={`text-center text-muted-foreground text-sm ${className}`}>
        <Eye className='h-4 w-4 mx-auto mb-1' />
        <p>{error || 'No statistics available'}</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-4 text-sm ${className}`}>
        <div className='flex items-center gap-1'>
          <Eye className='h-3 w-3 text-muted-foreground' />
          <span>{formatViews(statistics.total_views || 0)}</span>
        </div>
        <div className='flex items-center gap-1'>
          <Calendar className='h-3 w-3 text-muted-foreground' />
          <span>{formatViews(statistics.daily_views)} today</span>
        </div>
        <div className='flex items-center gap-1'>
          <TrendingUp className='h-3 w-3 text-muted-foreground' />
          <span>{formatViews(statistics.weekly_views)} this week</span>
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className='pb-3'>
        <CardTitle className='text-base flex items-center gap-2'>
          <Eye className='h-4 w-4' />
          {t('title', { type: entityType })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue='overview' className='w-full'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='overview'>{t('overview')}</TabsTrigger>
            {showTrends && <TabsTrigger value='trends'>{t('trends')}</TabsTrigger>}
          </TabsList>

          <TabsContent value='overview' className='space-y-4 mt-4'>
            <div className='grid grid-cols-2 gap-4'>
              {/* Total Views */}
              {statistics.total_views !== undefined && (
                <div className='text-center p-3 bg-muted/50 rounded-lg'>
                  <div className='text-2xl font-bold text-primary'>
                    {formatViews(statistics.total_views)}
                  </div>
                  <div className='text-xs text-muted-foreground'>{t('totalViews')}</div>
                </div>
              )}

              {/* Daily Views */}
              <div className='text-center p-3 bg-muted/50 rounded-lg'>
                <div className='text-lg font-semibold flex items-center justify-center gap-1'>
                  <Clock className='h-4 w-4 text-blue-500' />
                  {formatViews(statistics.daily_views)}
                </div>
                <div className='text-xs text-muted-foreground'>{t('dailyViews')}</div>
              </div>

              {/* Weekly Views */}
              <div className='text-center p-3 bg-muted/50 rounded-lg'>
                <div className='text-lg font-semibold flex items-center justify-center gap-1'>
                  <Calendar className='h-4 w-4 text-green-500' />
                  {formatViews(statistics.weekly_views)}
                </div>
                <div className='text-xs text-muted-foreground'>{t('weeklyViews')}</div>
              </div>

              {/* Monthly Views */}
              <div className='text-center p-3 bg-muted/50 rounded-lg'>
                <div className='text-lg font-semibold flex items-center justify-center gap-1'>
                  <TrendingUp className='h-4 w-4 text-purple-500' />
                  {formatViews(statistics.monthly_views)}
                </div>
                <div className='text-xs text-muted-foreground'>{t('monthlyViews')}</div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className='flex flex-wrap gap-2 pt-2'>
              <Badge variant='secondary' className='text-xs'>
                <Clock className='h-3 w-3 mr-1' />
                {formatViews(statistics.daily_views)} {t('today')}
              </Badge>
              <Badge variant='secondary' className='text-xs'>
                <Calendar className='h-3 w-3 mr-1' />
                {formatViews(statistics.weekly_views)} {t('thisWeek')}
              </Badge>
              <Badge variant='secondary' className='text-xs'>
                <TrendingUp className='h-3 w-3 mr-1' />
                {formatViews(statistics.monthly_views)} {t('thisMonth')}
              </Badge>
            </div>
          </TabsContent>

          {showTrends && (
            <TabsContent value='trends' className='mt-4'>
              <div className='text-center text-muted-foreground text-sm py-8'>
                <TrendingUp className='h-8 w-8 mx-auto mb-2 opacity-50' />
                <p>{t('trendsComingSoon')}</p>
                <p className='text-xs mt-1'>{t('trendsDescription')}</p>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Simplified version for inline display
export function InlineViewStats({
  statistics,
  showLabels = true,
  className = '',
}: {
  statistics: ViewStatisticsData;
  showLabels?: boolean;
  className?: string;
}) {
  const { formatViews } = useFormat();
  const t = useTranslations('viewStats');

  return (
    <div className={`flex items-center gap-3 text-sm ${className}`}>
      <div className='flex items-center gap-1'>
        <Eye className='h-3 w-3 text-muted-foreground' />
        <span>{formatViews(statistics.total_views || 0)}</span>
        {showLabels && <span className='text-muted-foreground text-xs'>total</span>}
      </div>

      <div className='flex items-center gap-1'>
        <Clock className='h-3 w-3 text-blue-500' />
        <span>{formatViews(statistics.daily_views)}</span>
        {showLabels && <span className='text-muted-foreground text-xs'>today</span>}
      </div>

      <div className='flex items-center gap-1'>
        <Calendar className='h-3 w-3 text-green-500' />
        <span>{formatViews(statistics.weekly_views)}</span>
        {showLabels && <span className='text-muted-foreground text-xs'>week</span>}
      </div>
    </div>
  );
}

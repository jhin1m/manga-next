'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Eye,
  Star,
  Heart,
  TrendingUp,
  Clock,
  Calendar,
  CalendarDays,
  Infinity as InfinityIcon,
} from 'lucide-react';

type RankingCategory = 'most_viewed' | 'highest_rated' | 'most_bookmarked' | 'trending';
type RankingPeriod = 'daily' | 'weekly' | 'monthly' | 'all_time';

interface RankingFiltersProps {
  activeCategory: RankingCategory;
  activePeriod: RankingPeriod;
  onCategoryChange: (category: RankingCategory) => void;
  onPeriodChange: (period: RankingPeriod) => void;
}

export default function RankingFilters({
  activeCategory,
  activePeriod,
  onCategoryChange,
  onPeriodChange,
}: RankingFiltersProps) {
  const t = useTranslations('rankings');

  // Category configurations
  const categories = [
    {
      id: 'most_viewed' as const,
      icon: <Eye className='w-4 h-4' />,
      label: t('categories.mostViewed'),
      description: t('categoryDescriptions.mostViewed'),
      color: 'bg-blue-500/10 text-blue-700 border-blue-200',
    },
    {
      id: 'highest_rated' as const,
      icon: <Star className='w-4 h-4' />,
      label: t('categories.highestRated'),
      description: t('categoryDescriptions.highestRated'),
      color: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
    },
    {
      id: 'most_bookmarked' as const,
      icon: <Heart className='w-4 h-4' />,
      label: t('categories.mostBookmarked'),
      description: t('categoryDescriptions.mostBookmarked'),
      color: 'bg-red-500/10 text-red-700 border-red-200',
    },
    {
      id: 'trending' as const,
      icon: <TrendingUp className='w-4 h-4' />,
      label: t('categories.trending'),
      description: t('categoryDescriptions.trending'),
      color: 'bg-green-500/10 text-green-700 border-green-200',
    },
  ];

  // Period configurations
  const periods = [
    {
      id: 'daily' as const,
      icon: <Clock className='w-4 h-4' />,
      label: t('periods.daily'),
      description: 'Last 24 hours',
    },
    {
      id: 'weekly' as const,
      icon: <Calendar className='w-4 h-4' />,
      label: t('periods.weekly'),
      description: 'Last 7 days',
    },
    {
      id: 'monthly' as const,
      icon: <CalendarDays className='w-4 h-4' />,
      label: t('periods.monthly'),
      description: 'Last 30 days',
    },
    {
      id: 'all_time' as const,
      icon: <InfinityIcon className='w-4 h-4' />,
      label: t('periods.allTime'),
      description: 'Since the beginning',
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Category Selection */}
      <Card>
        <CardContent className='p-6'>
          <div className='space-y-4'>
            <div>
              <h3 className='text-lg font-semibold mb-2'>{t('filters.category')}</h3>
              <p className='text-sm text-muted-foreground'>{t('filters.selectCategory')}</p>
            </div>

            {/* Desktop Category Tabs */}
            <div className='hidden md:block'>
              <Tabs
                value={activeCategory}
                onValueChange={value => onCategoryChange(value as RankingCategory)}
              >
                <TabsList className='grid w-full grid-cols-4 h-auto p-1'>
                  {categories.map(category => (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className='flex flex-col items-center gap-2 p-4 h-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
                    >
                      <div className='flex items-center gap-2'>
                        {category.icon}
                        <span className='font-medium'>{category.label}</span>
                      </div>
                      <span className='text-xs opacity-70'>{category.description}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Mobile Category Select */}
            <div className='md:hidden'>
              <Select
                value={activeCategory}
                onValueChange={value => onCategoryChange(value as RankingCategory)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('filters.selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className='flex items-center gap-2'>
                        {category.icon}
                        <span>{category.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Period Selection */}
      <Card>
        <CardContent className='p-6'>
          <div className='space-y-4'>
            <div>
              <h3 className='text-lg font-semibold mb-2'>{t('filters.timePeriod')}</h3>
              <p className='text-sm text-muted-foreground'>{t('filters.selectPeriod')}</p>
            </div>

            {/* Desktop Period Buttons */}
            <div className='hidden sm:flex gap-2 flex-wrap'>
              {periods.map(period => (
                <Button
                  key={period.id}
                  variant={activePeriod === period.id ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => onPeriodChange(period.id)}
                  className='flex items-center gap-2'
                >
                  {period.icon}
                  <span>{period.label}</span>
                </Button>
              ))}
            </div>

            {/* Mobile Period Select */}
            <div className='sm:hidden'>
              <Select
                value={activePeriod}
                onValueChange={value => onPeriodChange(value as RankingPeriod)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('filters.selectPeriod')} />
                </SelectTrigger>
                <SelectContent>
                  {periods.map(period => (
                    <SelectItem key={period.id} value={period.id}>
                      <div className='flex items-center gap-2'>
                        {period.icon}
                        <span>{period.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Selection Summary */}
      <div className='flex items-center justify-center gap-4 p-4 bg-muted/50 rounded-lg'>
        <div className='flex items-center gap-2 text-sm'>
          <span className='text-muted-foreground'>Showing:</span>
          <Badge variant='secondary' className='flex items-center gap-1'>
            {categories.find(c => c.id === activeCategory)?.icon}
            {categories.find(c => c.id === activeCategory)?.label}
          </Badge>
          <span className='text-muted-foreground'>for</span>
          <Badge variant='outline' className='flex items-center gap-1'>
            {periods.find(p => p.id === activePeriod)?.icon}
            {periods.find(p => p.id === activePeriod)?.label}
          </Badge>
        </div>
      </div>
    </div>
  );
}

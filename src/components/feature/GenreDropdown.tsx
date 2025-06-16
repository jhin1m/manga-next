'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronDown, LayoutGrid } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { genreApi } from '@/lib/api/client';
import { useTranslations } from 'next-intl';

interface Genre {
  id: number;
  name: string;
  slug: string;
  mangaCount?: number;
}

export function GenreDropdown() {
  const [genres, setGenres] = React.useState<Genre[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const t = useTranslations('navigation');

  React.useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await genreApi.getList();
        // Lấy top 10 genres phổ biến nhất
        const sortedGenres = data.genres
          .sort((a: Genre, b: Genre) => (b.mangaCount || 0) - (a.mangaCount || 0))
          .slice(0, 10);
        setGenres(sortedGenres);
      } catch (error) {
        console.error('Error fetching genres:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenres();
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='text-sm font-medium transition-colors hover:text-primary flex items-center gap-1'
        >
          {t('genres')}
          <ChevronDown className='h-3 w-3' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-56'>
        {isLoading ? (
          <DropdownMenuItem disabled>{t('loading')}...</DropdownMenuItem>
        ) : (
          <>
            {genres.map(genre => (
              <DropdownMenuItem key={genre.id} asChild>
                <Link
                  href={`/genres/${genre.slug}`}
                  className='flex items-center justify-between w-full'
                >
                  <span>{genre.name}</span>
                  {genre.mangaCount && (
                    <span className='text-xs text-muted-foreground'>{genre.mangaCount}</span>
                  )}
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href='/genres' className='flex items-center gap-2 font-medium text-primary'>
                <LayoutGrid className='h-4 w-4' />
                {t('viewAllGenres')}
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Mobile version for sheet menu
export function MobileGenreDropdown() {
  const [genres, setGenres] = React.useState<Genre[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const t = useTranslations('navigation');

  React.useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await genreApi.getList();
        // Lấy top 8 genres cho mobile
        const sortedGenres = data.genres
          .sort((a: Genre, b: Genre) => (b.mangaCount || 0) - (a.mangaCount || 0))
          .slice(0, 8);
        setGenres(sortedGenres);
      } catch (error) {
        console.error('Error fetching genres:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenres();
  }, []);

  return (
    <div className='space-y-1'>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='flex items-center justify-between w-full py-3 px-4 -mx-4 text-base font-medium transition-colors hover:bg-accent hover:text-primary rounded-lg'
      >
        <div className='flex items-center'>
          <LayoutGrid className='mr-3 h-5 w-5' />
          {t('genres')}
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className='ml-8 space-y-1'>
          {isLoading ? (
            <div className='py-2 px-4 text-sm text-muted-foreground'>{t('loading')}...</div>
          ) : (
            <>
              {genres.map(genre => (
                <Link
                  key={genre.id}
                  href={`/genres/${genre.slug}`}
                  className='flex items-center justify-between py-2 px-4 -mx-4 text-sm transition-colors hover:bg-accent hover:text-primary rounded-lg'
                >
                  <span>{genre.name}</span>
                  {genre.mangaCount && (
                    <span className='text-xs text-muted-foreground'>{genre.mangaCount}</span>
                  )}
                </Link>
              ))}
              <Link
                href='/genres'
                className='flex items-center gap-2 py-2 px-4 -mx-4 text-sm font-medium text-primary transition-colors hover:bg-accent rounded-lg'
              >
                {t('viewAllGenres')}
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

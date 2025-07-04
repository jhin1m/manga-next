'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFavorites } from '@/hooks/useFavorites';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  comicId: number;
  initialIsFavorite?: boolean;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
  className?: string;
  onToggleComplete?: (
    result: { action: 'added' | 'removed'; isFavorite: boolean } | undefined
  ) => void;
}

export function FavoriteButton({
  comicId,
  initialIsFavorite = false,
  variant = 'ghost',
  size = 'icon',
  showText = false,
  className,
  onToggleComplete,
}: FavoriteButtonProps) {
  const router = useRouter();
  const t = useTranslations('manga');
  const { isFavorite, isLoading, toggleFavorite, isAuthenticated } = useFavorites({
    comicId,
    initialIsFavorite,
  });
  const [isHovering, setIsHovering] = useState(false);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Redirect to login page if not authenticated
      router.push('/auth/login?callbackUrl=' + encodeURIComponent(window.location.pathname));
      return;
    }

    const result = await toggleFavorite();

    // Call the callback if provided
    if (onToggleComplete) {
      onToggleComplete(result);
    }

    // No need for router.refresh() - state is managed by the hook
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={cn(
              'group relative',
              {
                'text-red-500': isFavorite,
              },
              className
            )}
            disabled={isLoading}
            onClick={handleToggleFavorite}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            aria-label={isFavorite ? t('removeFromFavorites') : t('addToFavorites')}
          >
            <Heart
              className={cn('h-5 w-5 transition-all', {
                'fill-red-500': isFavorite,
                'fill-red-500/20 group-hover:fill-red-500/40': !isFavorite && isHovering,
              })}
            />
            {showText && (
              <span className='ml-2 md:hidden'>
                {isFavorite ? t('removeFromFavorites') : t('addToFavorites')}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isFavorite ? t('removeFromFavorites') : t('addToFavorites')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

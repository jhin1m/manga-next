import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, BookOpen, Heart, ArrowLeft } from 'lucide-react';
import { constructMetadata } from '@/lib/seo/metadata';
import { defaultViewport } from '@/lib/seo/viewport';
import { getTranslations } from 'next-intl/server';

// Generate metadata for the 404 page
export const metadata: Metadata = constructMetadata({
  title: '404 - Page Not Found',
  description:
    'The page you are looking for could not be found. Return to our manga collection and discover amazing stories.',
  noIndex: true,
});

export const viewport = defaultViewport;

export default async function NotFound() {
  const t = await getTranslations('notFound');
  const _tNav = await getTranslations('navigation');

  return (
    <div className='min-h-[80vh] flex items-center justify-center px-4 py-8'>
      <div className='max-w-2xl mx-auto text-center space-y-8'>
        {/* Main 404 Content */}
        <div className='space-y-6'>
          {/* Large 404 Number with Manga Theme */}
          <div className='relative'>
            <h1 className='text-8xl md:text-9xl font-bold text-primary/20 select-none'>404</h1>
            <div className='absolute inset-0 flex items-center justify-center'>
              <BookOpen className='h-16 w-16 md:h-20 md:w-20 text-primary/60' />
            </div>
          </div>

          {/* Error Message */}
          <div className='space-y-4'>
            <h2 className='text-2xl md:text-3xl font-bold text-foreground'>{t('heading')}</h2>
            <p className='text-lg text-muted-foreground max-w-lg mx-auto'>{t('description')}</p>
            <p className='text-sm text-muted-foreground max-w-md mx-auto'>{t('subDescription')}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
          <Button asChild size='lg' className='w-full sm:w-auto'>
            <Link href='/'>
              <Home className='mr-2 h-4 w-4' />
              {t('homeButton')}
            </Link>
          </Button>
          <Button asChild variant='outline' size='lg' className='w-full sm:w-auto'>
            <Link href='/manga'>
              <BookOpen className='mr-2 h-4 w-4' />
              {t('browseButton')}
            </Link>
          </Button>
        </div>

        {/* Helpful Suggestions */}
        <Card className='max-w-lg mx-auto'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg'>{t('suggestions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className='space-y-3 text-sm text-muted-foreground'>
              <li className='flex items-center gap-2'>
                <ArrowLeft className='h-4 w-4 text-primary' />
                <Link href='/manga' className='hover:text-primary transition-colors'>
                  {t('checkLatest')}
                </Link>
              </li>
              <li className='flex items-center gap-2'>
                <ArrowLeft className='h-4 w-4 text-primary' />
                <Link href='/genres' className='hover:text-primary transition-colors'>
                  {t('exploreGenres')}
                </Link>
              </li>
              <li className='flex items-center gap-2'>
                <Heart className='h-4 w-4 text-primary' />
                <Link href='/profile' className='hover:text-primary transition-colors'>
                  {t('viewFavorites')}
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Support Contact */}
        <p className='text-xs text-muted-foreground'>{t('contactSupport')}</p>
      </div>
    </div>
  );
}

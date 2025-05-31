'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFormat } from '@/hooks/useFormat';

export function I18nDemo() {
  const t = useTranslations('manga');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('navigation');
  const tAuth = useTranslations('auth');
  const { formatViews, formatDate, formatNumber, locale } = useFormat();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🌐 i18n Demo - Kiểm tra đa ngôn ngữ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Navigation:</h3>
          <ul className="space-y-1 text-sm">
            <li>• {tNav('home')}</li>
            <li>• {tNav('latest')}</li>
            <li>• {tNav('search')}</li>
            <li>• {tNav('profile')}</li>
            <li>• {tNav('myFavorites')}</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Manga:</h3>
          <ul className="space-y-1 text-sm">
            <li>• {t('hotManga')}</li>
            <li>• {t('latestManga')}</li>
            <li>• {t('recommendedManga')}</li>
            <li>• {t('rating')}</li>
            <li>• {t('views')}</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Auth:</h3>
          <ul className="space-y-1 text-sm">
            <li>• {tAuth('login')}</li>
            <li>• {tAuth('register')}</li>
            <li>• {tAuth('email')}</li>
            <li>• {tAuth('password')}</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Common:</h3>
          <ul className="space-y-1 text-sm">
            <li>• {tCommon('loading')}</li>
            <li>• {tCommon('error')}</li>
            <li>• {tCommon('tryAgain')}</li>
            <li>• {tCommon('save')}</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Format Functions (Locale: {locale}):</h3>
          <ul className="space-y-1 text-sm">
            <li>• Views: {formatViews(1234)} | {formatViews(1234567)}</li>
            <li>• Date: {formatDate('2024-01-15T10:30:00Z')}</li>
            <li>• Number: {formatNumber(1234567.89)}</li>
            <li>• Chapters: {t('chaptersCount', { count: 25 })}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

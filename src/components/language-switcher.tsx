'use client';

import { useTransition } from 'react';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { locales, localeNames } from '@/i18n/config';

// Flag mapping for each locale
const flagEmojis = {
  en: '🇺🇸', // US flag for English
  vi: '🇻🇳', // Vietnam flag for Vietnamese
} as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: string) => {
    startTransition(() => {
      // Set cookie để lưu locale
      document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;
      window.location.reload();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' disabled={isPending}>
          <span className='text-lg'>{flagEmojis[locale as keyof typeof flagEmojis]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {locales.map(loc => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={locale === loc ? 'bg-accent' : ''}
          >
            <span className='mr-2'>{flagEmojis[loc]}</span>
            {localeNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

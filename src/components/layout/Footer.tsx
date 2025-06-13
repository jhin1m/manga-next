'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LanguageSwitcher } from '@/components/language-switcher';
import {
  ArrowUp,
  Home,
  Search,
  TrendingUp,
  Clock,
  HelpCircle,
  Info,
  Shield,
  FileText,
  Mail,
} from 'lucide-react';
import { seoConfig } from '@/config/seo.config';
import HomeNavigationLink from '@/components/navigation/HomeNavigationLink';

export default function Footer() {
  const [mounted, setMounted] = useState(false);
  const currentYear = new Date().getFullYear();
  const t = useTranslations('footer');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className='border-t border-border/40 bg-background'>
      <div className='container mx-auto px-4 py-8 sm:px-14 2xl:px-21'>
        {/* Main Footer Content */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>

          {/* Site Information Section */}
          <div className='space-y-4 lg:col-span-2'>
            <div>
              <Link href='/' className='flex items-center space-x-2 mb-3'>
              <Image
                src="/logo.svg"
                alt={seoConfig.site.name}
                width={120}
                height={40}
                className="h-8 sm:h-10 lg:h-12 w-auto"
                priority
              />
              </Link>
              <p className='text-sm text-muted-foreground leading-relaxed'>
                { seoConfig.site.tagline }
              </p>
            </div>

            {/* Language Switcher */}
            <div className='flex items-center space-x-2'>
              <span className='text-sm text-muted-foreground'>Language:</span>
              <LanguageSwitcher />
            </div>

            {/* Back to Top Button */}
            {mounted && (
              <div className='pt-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={scrollToTop}
                  className='w-full sm:w-auto'
                >
                  <ArrowUp className='h-4 w-4 mr-2' />
                  {t('backToTop')}
                </Button>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className='space-y-4'>
            <h3 className='text-sm font-semibold text-foreground uppercase tracking-wider'>
              {t('navigation.title')}
            </h3>
            <nav className='space-y-2'>
              <HomeNavigationLink className='flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors'>
                <Home className='h-4 w-4' />
                <span>{t('home')}</span>
              </HomeNavigationLink>
              <Link
                href='/manga'
                className='flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors'
              >
                <Clock className='h-4 w-4' />
                <span>{t('navigation.latest')}</span>
              </Link>
              <Link
                href='/search'
                className='flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors'
              >
                <Search className='h-4 w-4' />
                <span>{t('navigation.search')}</span>
              </Link>
              <Link
                href='/manga?sort=popular'
                className='flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors'
              >
                <TrendingUp className='h-4 w-4' />
                <span>{t('navigation.popular')}</span>
              </Link>
            </nav>
          </div>

          {/* Legal & Help Links */}
          <div className='space-y-4 lg:text-left'>
            <h3 className='text-sm font-semibold text-foreground uppercase tracking-wider'>
              {t('legal.title')}
            </h3>
            <nav className='space-y-2'>
              <Link
                href='/about'
                className='flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors lg:justify-start'
              >
                <span>{t('legal.about')}</span>
                <Info className='h-4 w-4' />
              </Link>
              <Link
                href='/help'
                className='flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors lg:justify-start'
              >
                <span>{t('legal.help')}</span>
                <HelpCircle className='h-4 w-4' />
              </Link>
              <Link
                href='/privacy'
                className='flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors lg:justify-start'
              >
                <span>{t('privacy')}</span>
                <Shield className='h-4 w-4' />
              </Link>
              <Link
                href='/terms'
                className='flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors lg:justify-start'
              >
                <span>{t('terms')}</span>
                <FileText className='h-4 w-4' />
              </Link>
              <Link
                href='/dmca'
                className='flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors lg:justify-start'
              >
                <span>{t('dmca')}</span>
                <FileText className='h-4 w-4' />
              </Link>
              <Link
                href='/contact'
                className='flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors lg:justify-start'
              >
                <span>{t('contact')}</span>
                <Mail className='h-4 w-4' />
              </Link>
            </nav>
          </div>
        </div>

        <Separator className='my-6' />

        {/* Copyright Section */}
        <div className='flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0'>
          <div className='text-center sm:text-left'>
            <p className='text-xs text-muted-foreground'>
              { seoConfig.site.description }
            </p>
          </div>

          <div className='text-center sm:text-right'>
            {mounted ? (
              <p className='text-xs text-muted-foreground'>
                {t('copyright', {
                  year: currentYear,
                  siteName: seoConfig.site.name,
                  allRightsReserved: t('allRightsReserved')
                })}
              </p>
            ) : (
              <p className='text-xs text-muted-foreground'>
                © {seoConfig.site.name}. {t('allRightsReserved')}
              </p>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

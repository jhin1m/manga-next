'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  User,
  Heart,
  Settings,
  LogOut,
  History,
  Bell,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { SearchButton, DesktopSearchButton } from '@/components/feature/SearchBar';
import { Home } from 'lucide-react';
import { UserMenu } from '@/components/layout/user-menu';
import { signOut } from 'next-auth/react';
import { GenreDropdown, MobileGenreDropdown } from '@/components/feature/GenreDropdown';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useTranslations } from 'next-intl';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useRouteDetection } from '@/hooks/useRouteDetection';
import { toast } from 'sonner';
import { seoConfig } from '@/config/seo.config';
import { useAuthStatus } from '@/hooks/useAuthStatus';

// Header Skeleton Component
function HeaderAuthSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
    </div>
  );
}

export default function Header() {
  // Sử dụng hook mới thay vì useSession
  const { isAuthenticated, user, isLoading, error, refreshAuthStatus } = useAuthStatus();
  
  const t = useTranslations('navigation');
  const tAuth = useTranslations('auth');
  const { shouldHeaderBeSticky } = useRouteDetection();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch by only applying route-based styling after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use safe defaults during SSR/hydration
  const safeShouldHeaderBeSticky = isMounted ? shouldHeaderBeSticky : true;

  const handleMobileSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ redirect: false });
      toast.success('Logged out successfully');
      
      // Refresh auth status sau khi logout
      setTimeout(() => {
        refreshAuthStatus();
      }, 100);
      
      router.push('/');
      router.refresh();
    } catch (error) {
      toast.error('Failed to log out');
      console.error('Sign out error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Show error state nếu có lỗi trong việc check auth
  useEffect(() => {
    if (error) {
      console.warn('[HEADER_AUTH_ERROR]', error);
      // Có thể show toast hoặc retry logic ở đây nếu cần
    }
  }, [error]);

  return (
    <header
      className={`border-b border-border/40 bg-background/90 backdrop-blur-sm top-0 z-50 ${
        safeShouldHeaderBeSticky ? 'sticky' : 'relative'
      }`}
    >
      <div className='container mx-auto px-4 py-3'>
        <div className='flex justify-between items-center sm:px-14 2xl:px-18'>
          <Link
            href='/'
            className='group relative flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-all duration-300'
          >
            <div className='relative'>
              <div className='absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10'></div>
              <Image
                src='/logo.svg'
                alt={seoConfig.site.name}
                width={120}
                height={40}
                className='h-8 sm:h-10 lg:h-12 w-auto'
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center space-x-6'>
            <Link
              href='/'
              className='flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary'
            >
              <Home className='h-4 w-4' />
              {t('home')}
            </Link>
            <Link
              href='/manga'
              className='flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary'
            >
              <BookOpen className='h-4 w-4' />
              {t('latest')}
            </Link>
            <Link
              href='/rankings'
              className='flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary'
            >
              <TrendingUp className='h-4 w-4' />
              {t('ranking')}
            </Link>

            <GenreDropdown />
            <DesktopSearchButton />
            <LanguageSwitcher />
            <ThemeToggle />
            
            {/* Auth Section với loading state */}
            {isLoading ? (
              <HeaderAuthSkeleton />
            ) : isAuthenticated && user ? (
              <>
                <NotificationBell />
                <UserMenu />
              </>
            ) : (
              <Button variant='ghost' size='icon' className='text-foreground' asChild>
                <Link href='/auth/login'>
                  <User className='h-5 w-5' />
                </Link>
              </Button>
            )}
          </nav>

          {/* Mobile Navigation */}
          <div className='md:hidden flex items-center gap-2'>
            <SearchButton />
            {isAuthenticated && !isLoading && <NotificationBell />}
            <LanguageSwitcher />
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant='ghost' size='icon' className='text-foreground'>
                  <Menu className='h-5 w-5' />
                  <span className='sr-only'>Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side='right' className='w-80 flex flex-col h-full'>
                <SheetHeader className='flex-shrink-0'>
                  <SheetTitle className='sr-only'>Navigation Menu</SheetTitle>
                </SheetHeader>

                {/* User Profile Section for Authenticated Users */}
                {isAuthenticated && user && !isLoading && (
                  <div className='flex items-center gap-3 p-4 border-b border-border/40 mt-4 flex-shrink-0'>
                    <Avatar className='h-12 w-12' key={user.image || 'no-avatar'}>
                      <AvatarImage
                        src={user.image || undefined}
                        alt={user.name || 'User'}
                      />
                      <AvatarFallback className='text-lg font-semibold'>
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col space-y-1 leading-none min-w-0 flex-1'>
                      {user.name && (
                        <p className='font-medium text-base truncate'>{user.name}</p>
                      )}
                      {user.email && (
                        <p className='text-sm text-muted-foreground truncate'>
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Loading state cho mobile */}
                {isLoading && (
                  <div className='flex items-center gap-3 p-4 border-b border-border/40 mt-4 flex-shrink-0'>
                    <div className='h-12 w-12 bg-muted rounded-full animate-pulse' />
                    <div className='flex flex-col space-y-2 flex-1'>
                      <div className='h-4 bg-muted rounded animate-pulse' />
                      <div className='h-3 bg-muted rounded animate-pulse w-2/3' />
                    </div>
                  </div>
                )}

                {/* Scrollable Navigation Container */}
                <div className='flex-1 overflow-y-auto'>
                  <nav className='flex flex-col mt-6 mx-2 space-y-1 pb-6'>
                    {/* Main Navigation */}
                    <div className='space-y-1'>
                      <Link
                        href='/'
                        className='flex items-center py-3 px-4 -mx-4 text-base font-medium transition-colors hover:bg-accent hover:text-primary rounded-lg'
                      >
                        <Home className='mr-3 h-5 w-5' />
                        {t('home')}
                      </Link>
                      <Link
                        href='/manga'
                        className='flex items-center py-3 px-4 -mx-4 text-base font-medium transition-colors hover:bg-accent hover:text-primary rounded-lg'
                      >
                        <BookOpen className='mr-3 h-5 w-5' />
                        {t('latest')}
                      </Link>
                      <Link
                        href='/rankings'
                        className='flex items-center py-3 px-4 -mx-4 text-base font-medium transition-colors hover:bg-accent hover:text-primary rounded-lg'
                      >
                        <TrendingUp className='mr-3 h-5 w-5' />
                        {t('ranking')}
                      </Link>
                      <MobileGenreDropdown />
                    </div>

                    {/* User Section */}
                    {!isLoading && (
                      <>
                        {isAuthenticated && user ? (
                          <>
                            <Separator className='my-4' />
                            <div className='space-y-1'>
                              <Link
                                href='/profile'
                                className='flex items-center py-3 px-4 -mx-4 text-base font-medium transition-colors hover:bg-accent hover:text-primary rounded-lg'
                              >
                                <User className='mr-3 h-5 w-5' />
                                {t('profile')}
                              </Link>
                              <Link
                                href='/profile?tab=favorites'
                                className='flex items-center py-3 px-4 -mx-4 text-base font-medium transition-colors hover:bg-accent hover:text-primary rounded-lg'
                              >
                                <Heart className='mr-3 h-5 w-5' />
                                {t('myFavorites')}
                              </Link>
                              <Link
                                href='/profile?tab=history'
                                className='flex items-center py-3 px-4 -mx-4 text-base font-medium transition-colors hover:bg-accent hover:text-primary rounded-lg'
                              >
                                <History className='mr-3 h-5 w-5' />
                                {t('history')}
                              </Link>
                              <Link
                                href='/profile?tab=notifications'
                                className='flex items-center py-3 px-4 -mx-4 text-base font-medium transition-colors hover:bg-accent hover:text-primary rounded-lg'
                              >
                                <Bell className='mr-3 h-5 w-5' />
                                {t('notifications')}
                              </Link>
                              <Link
                                href='/profile/settings'
                                className='flex items-center py-3 px-4 -mx-4 text-base font-medium transition-colors hover:bg-accent hover:text-primary rounded-lg'
                              >
                                <Settings className='mr-3 h-5 w-5' />
                                {t('settings')}
                              </Link>
                            </div>

                            <Separator className='my-4' />
                            <div className='space-y-1'>
                              <button
                                onClick={handleMobileSignOut}
                                disabled={isLoggingOut}
                                className='flex items-center py-3 px-4 -mx-4 text-base font-medium transition-colors hover:bg-accent hover:text-destructive rounded-lg w-full text-left disabled:opacity-50'
                              >
                                <LogOut className='mr-3 h-5 w-5' />
                                <span>{isLoggingOut ? 'Signing out...' : tAuth('logout')}</span>
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <Separator className='my-4' />
                            <div className='space-y-1'>
                              <Link
                                href='/auth/login'
                                className='flex items-center py-3 px-4 -mx-4 text-base font-medium transition-colors hover:bg-accent hover:text-primary rounded-lg'
                              >
                                <User className='mr-3 h-5 w-5' />
                                {tAuth('login')}
                              </Link>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

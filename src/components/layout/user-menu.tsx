'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { User, Settings, Heart, History, LogOut, Bell } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { toast } from 'sonner';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { locales, localeNames } from '@/i18n/config';

// Flag mapping for each locale
const flagEmojis = {
  en: '🇺🇸', // US flag for English
  vi: '🇻🇳', // Vietnam flag for Vietnamese
} as const;

export function UserMenu() {
  // Sử dụng auth state từ hook mới
  const { user, refreshAuthStatus } = useAuthStatus();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const t = useTranslations('navigation');
  const tAuth = useTranslations('auth');

  const handleSignOut = async () => {
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

  // Nếu không có user data, không render menu
  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
          <Avatar className='h-8 w-8' key={user.image || 'no-avatar'}>
            <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
            <AvatarFallback className='text-sm font-semibold'>
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            {user.name && <p className='text-sm font-medium leading-none'>{user.name}</p>}
            {user.email && (
              <p className='text-xs leading-none text-muted-foreground'>{user.email}</p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href='/profile' className='cursor-pointer'>
            <User className='mr-2 h-4 w-4' />
            <span>{t('profile')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href='/profile?tab=favorites' className='cursor-pointer'>
            <Heart className='mr-2 h-4 w-4' />
            <span>{t('myFavorites')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href='/profile?tab=history' className='cursor-pointer'>
            <History className='mr-2 h-4 w-4' />
            <span>{t('history')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href='/profile?tab=notifications' className='cursor-pointer'>
            <Bell className='mr-2 h-4 w-4' />
            <span>{t('notifications')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href='/profile/settings' className='cursor-pointer'>
            <Settings className='mr-2 h-4 w-4' />
            <span>{t('settings')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='cursor-pointer text-destructive focus:text-destructive'
          onClick={handleSignOut}
          disabled={isLoggingOut}
        >
          <LogOut className='mr-2 h-4 w-4' />
          <span>{isLoggingOut ? 'Signing out...' : tAuth('logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

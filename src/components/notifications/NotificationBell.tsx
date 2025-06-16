'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const t = useTranslations('notifications');
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { unreadCount, fetchNotifications, isAuthenticated } = useNotifications(); // Now uses context - no duplicate instances!

  // Ensure component is mounted before rendering dropdown
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // REMOVED: fetchUnreadCount call - now handled by context automatically

  // Handle dropdown open - only fetch notifications when opening for the first time
  const handleOpenChange = useCallback(
    (open: boolean) => {
      // Only allow opening if user is authenticated
      if (!isAuthenticated) {
        return;
      }

      setIsOpen(open);
      if (open) {
        // Only fetch notifications when opening the dropdown
        fetchNotifications({ limit: 10 });
      }
    },
    [isAuthenticated, fetchNotifications]
  );

  // Reset dropdown state when user logs out
  useEffect(() => {
    if (!isAuthenticated && isOpen) {
      setIsOpen(false);
    }
  }, [isAuthenticated, isOpen]);

  // Don't render if user is not authenticated or not mounted
  if (!isAuthenticated || !isMounted) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className={cn('relative', className)}
          aria-label={t('title')}
        >
          <Bell className='h-5 w-5' />
          {unreadCount > 0 && (
            <Badge
              variant='destructive'
              className='absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs'
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='w-80 max-w-[calc(100vw-2rem)] p-0'
        sideOffset={5}
        avoidCollisions={true}
        collisionPadding={10}
        onCloseAutoFocus={e => {
          // Prevent focus issues that might cause the contains error
          e.preventDefault();
        }}
        onEscapeKeyDown={e => {
          // Ensure proper cleanup on escape
          setIsOpen(false);
        }}
        onPointerDownOutside={e => {
          // Ensure proper cleanup on outside click
          setIsOpen(false);
        }}
      >
        <NotificationPanel onClose={() => setIsOpen(false)} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

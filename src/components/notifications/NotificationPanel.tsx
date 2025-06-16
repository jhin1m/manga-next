'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/contexts/NotificationContext';
import { Bell, Settings, CheckCheck, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationPanelProps {
  onClose?: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const locale = useLocale();
  const t = useTranslations('notifications');
  const [isLoading, setIsLoading] = useState(false);

  const { notifications, unreadCount, markAsRead, isAuthenticated } = useNotifications(); // Now uses shared context

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;

    setIsLoading(true);
    try {
      await markAsRead(undefined, true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = async (notificationId: number, isRead: boolean) => {
    if (!isRead) {
      await markAsRead([notificationId]);
    }
    onClose?.();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dateLocale = locale === 'vi' ? vi : enUS;
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: dateLocale,
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_chapter':
        return <Bell className='h-4 w-4 text-blue-500' />;
      default:
        return <Bell className='h-4 w-4 text-gray-500' />;
    }
  };

  const getNotificationLink = (notification: any) => {
    if (notification.type === 'new_chapter' && notification.data) {
      const { manga_slug, chapter_slug } = notification.data;
      if (manga_slug && chapter_slug) {
        return `/manga/${manga_slug}/${chapter_slug}`;
      }
      if (manga_slug) {
        return `/manga/${manga_slug}`;
      }
    }
    return null;
  };

  if (!isAuthenticated) {
    return (
      <div className='p-4 text-center'>
        <Bell className='h-8 w-8 mx-auto mb-2 text-muted-foreground' />
        <p className='text-sm text-muted-foreground'>{t('loginRequired')}</p>
      </div>
    );
  }

  return (
    <div className='w-full'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b'>
        <h3 className='font-semibold text-sm'>{t('title')}</h3>
        <div className='flex items-center gap-2'>
          {unreadCount > 0 && (
            <Button
              variant='ghost'
              size='sm'
              onClick={handleMarkAllRead}
              disabled={isLoading}
              className='text-xs'
            >
              <CheckCheck className='h-3 w-3 mr-1' />
              {t('markAllRead')}
            </Button>
          )}
          <Button variant='ghost' size='icon' asChild className='h-8 w-8'>
            <Link href='/profile/settings?tab=notifications'>
              <Settings className='h-4 w-4' />
            </Link>
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className='max-h-80 min-h-[200px] overflow-y-auto overscroll-contain'>
        {notifications.length === 0 ? (
          <div className='p-4 text-center'>
            <Bell className='h-8 w-8 mx-auto mb-2 text-muted-foreground' />
            <p className='text-sm text-muted-foreground'>{t('noNotifications')}</p>
          </div>
        ) : (
          <div className='divide-y'>
            {notifications.map(notification => {
              const link = getNotificationLink(notification);
              const NotificationContent = (
                <div
                  className={cn(
                    'p-3 hover:bg-accent/50 transition-colors cursor-pointer border-l-2 border-transparent',
                    !notification.is_read && 'bg-blue-50/50 dark:bg-blue-950/20 border-l-blue-500'
                  )}
                  onClick={() => handleNotificationClick(notification.id, notification.is_read)}
                >
                  <div className='flex items-start gap-3'>
                    <div className='flex-shrink-0 mt-0.5'>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between gap-2'>
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium line-clamp-2 break-words'>
                            {notification.title}
                          </p>
                          <p className='text-xs text-muted-foreground mt-1 line-clamp-3 break-words'>
                            {notification.message}
                          </p>
                        </div>
                        <div className='flex items-center gap-1 flex-shrink-0'>
                          {!notification.is_read && (
                            <div className='w-2 h-2 bg-blue-500 rounded-full' />
                          )}
                          {link && <ExternalLink className='h-3 w-3 text-muted-foreground' />}
                        </div>
                      </div>
                      <div className='mt-2'>
                        <span className='text-xs text-muted-foreground'>
                          {formatDate(notification.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );

              return (
                <div key={notification.id}>
                  {link ? (
                    <Link href={link} className='block'>
                      {NotificationContent}
                    </Link>
                  ) : (
                    NotificationContent
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <>
          <Separator />
          <div className='p-2'>
            <Button variant='ghost' size='sm' asChild className='w-full justify-center text-xs'>
              <Link href='/profile?tab=notifications'>{t('viewAllNotifications')}</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

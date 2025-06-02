'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { vi, enUS } from 'date-fns/locale'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useNotifications } from '@/hooks/useNotifications'
import { Bell, CheckCheck, ExternalLink, RefreshCw, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function NotificationsList() {
  const locale = useLocale()
  const t = useTranslations('notifications')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  
  const {
    notifications,
    unreadCount,
    pagination,
    fetchNotifications,
    markAsRead,
    isAuthenticated,
    isLoading,
  } = useNotifications()

  // Fetch notifications on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications({ page: 1, limit: 20 })
    }
  }, [isAuthenticated, fetchNotifications])

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return
    await markAsRead(undefined, true)
  }

  const handleNotificationClick = async (notificationId: number, isRead: boolean) => {
    if (!isRead) {
      await markAsRead([notificationId])
    }
  }

  const handleLoadMore = async () => {
    if (!pagination || currentPage >= pagination.totalPages) return
    
    setIsLoadingMore(true)
    try {
      const nextPage = currentPage + 1
      await fetchNotifications({ page: nextPage, limit: 20 })
      setCurrentPage(nextPage)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleRefresh = async () => {
    setCurrentPage(1)
    await fetchNotifications({ page: 1, limit: 20 })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const dateLocale = locale === 'vi' ? vi : enUS
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: dateLocale 
    })
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_chapter':
        return <Bell className="h-4 w-4 text-blue-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getNotificationLink = (notification: any) => {
    if (notification.type === 'new_chapter' && notification.data) {
      const { manga_slug, chapter_slug } = notification.data
      if (manga_slug && chapter_slug) {
        return `/manga/${manga_slug}/${chapter_slug}`
      }
      if (manga_slug) {
        return `/manga/${manga_slug}`
      }
    }
    return null
  }

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t('title')}
          </CardTitle>
          <CardDescription>
            {t('loginRequired')}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            {t('title')}
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </h2>
          <p className="text-muted-foreground">
            Manage your notifications and stay updated with your favorite manga.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              {t('markAllRead')}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href="/profile/settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      <Separator />

      {/* Notifications List */}
      {isLoading && notifications.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading notifications...</span>
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">{t('noNotifications')}</h3>
              <p className="text-muted-foreground mb-4">
                You'll receive notifications here when your favorited manga get new chapters.
              </p>
              <Button asChild variant="outline">
                <Link href="/manga">
                  Browse Manga
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const link = getNotificationLink(notification)
            const NotificationContent = (
              <Card
                className={cn(
                  "transition-colors cursor-pointer border-l-4",
                  !notification.is_read 
                    ? "border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20" 
                    : "border-l-transparent hover:bg-accent/50"
                )}
                onClick={() => handleNotificationClick(notification.id, notification.is_read)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm mb-1">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatDate(notification.created_at)}</span>
                            {notification.data?.manga_title && (
                              <>
                                <span>•</span>
                                <span>{notification.data.manga_title}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                          {link && (
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )

            return (
              <div key={notification.id}>
                {link ? (
                  <Link href={link} className="block">
                    {NotificationContent}
                  </Link>
                ) : (
                  NotificationContent
                )}
              </div>
            )
          })}

          {/* Load More Button */}
          {pagination && currentPage < pagination.totalPages && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}

          {/* Pagination Info */}
          {pagination && (
            <div className="text-center text-sm text-muted-foreground pt-4">
              Showing {notifications.length} of {pagination.total} notifications
            </div>
          )}
        </div>
      )}
    </div>
  )
}

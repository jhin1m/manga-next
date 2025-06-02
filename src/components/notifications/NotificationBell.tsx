'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useNotifications } from '@/hooks/useNotifications'
import { NotificationPanel } from './NotificationPanel'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface NotificationBellProps {
  className?: string
}

export function NotificationBell({ className }: NotificationBellProps) {
  const t = useTranslations('notifications')
  const [isOpen, setIsOpen] = useState(false)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)

  const {
    unreadCount,
    fetchUnreadCount,
    fetchNotifications,
    isAuthenticated
  } = useNotifications({
    autoRefresh: true,
    refreshInterval: 30000
  })

  // Fetch unread count on mount and when authenticated
  useEffect(() => {
    if (isAuthenticated && !hasLoadedOnce) {
      fetchUnreadCount()
      setHasLoadedOnce(true)
    }
  }, [isAuthenticated, fetchUnreadCount, hasLoadedOnce])

  // Handle dropdown open - only fetch notifications when opening for the first time
  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open)
    if (open && isAuthenticated) {
      // Only fetch notifications when opening the dropdown
      fetchNotifications({ limit: 10 })
    }
  }, [isAuthenticated, fetchNotifications])

  // Don't render if user is not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
          aria-label={t('title')}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-w-[calc(100vw-2rem)] p-0"
        sideOffset={5}
        avoidCollisions={true}
        collisionPadding={10}
      >
        <NotificationPanel onClose={() => setIsOpen(false)} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

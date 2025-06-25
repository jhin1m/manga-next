'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationPanel } from './NotificationPanel';
import { useAuthStatus } from '@/hooks/useAuthStatus';

export function NotificationBell() {
  const { isAuthenticated, isLoading } = useAuthStatus();
  const [isOpen, setIsOpen] = useState(false);
  
  // Chỉ sử dụng notifications hook khi user đã authenticated
  const {
    unreadCount,
    isLoading: notificationsLoading,
    error
  } = useNotifications({ autoRefresh: isAuthenticated || false });

  // Không render nếu đang loading auth hoặc user chưa login
  if (isLoading || !isAuthenticated) {
    return null;
  }

  // Show error state nếu có lỗi
  if (error) {
    console.warn('[NOTIFICATION_BELL_ERROR]', error);
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-foreground"
          disabled={notificationsLoading}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <NotificationPanel onClose={() => setIsOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}

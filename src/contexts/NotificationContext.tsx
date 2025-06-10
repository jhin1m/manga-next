'use client'

import React, { createContext, useContext, useCallback, useRef, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { notificationApi } from '@/lib/api/client'

interface Notification {
  id: number
  type: string
  title: string
  message: string
  data?: any
  is_read: boolean
  created_at: string
  read_at?: string
}

interface NotificationSettings {
  in_app_notifications: boolean
  new_chapter_alerts: boolean
}

interface CacheEntry {
  data: any
  timestamp: number
  expiry: number
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  settings: NotificationSettings | null
  isLoading: boolean
  error: string | null
  pagination: any
  fetchNotifications: (params?: any) => Promise<any>
  fetchSettings: () => Promise<any>
  updateSettings: (newSettings: Partial<NotificationSettings>) => Promise<any>
  markAsRead: (notificationIds?: number[], markAll?: boolean) => Promise<any>
  fetchUnreadCount: () => Promise<any>
  isAuthenticated: boolean
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
  children: React.ReactNode
  autoRefresh?: boolean
  refreshInterval?: number
}

export function NotificationProvider({
  children,
  autoRefresh = false,
  refreshInterval = 30000
}: NotificationProviderProps) {
  const { data: session, status } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<any>(null)

  // Cache for notifications and settings
  const cache = useRef<Map<string, CacheEntry>>(new Map())
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  const UNREAD_COUNT_CACHE_DURATION = 30 * 1000 // 30 seconds

  // Cache helper functions - STABLE REFERENCES
  const getCacheKey = (key: string, params?: any) => {
    return params ? `${key}_${JSON.stringify(params)}` : key
  }

  const getCachedData = (key: string) => {
    const entry = cache.current.get(key)
    if (entry && Date.now() < entry.expiry) {
      return entry.data
    }
    cache.current.delete(key)
    return null
  }

  const setCachedData = (key: string, data: any, duration: number) => {
    cache.current.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + duration
    })
  }

  // Clear cache when user changes
  useEffect(() => {
    cache.current.clear()
  }, [session?.user?.id])

  // Fetch notifications with caching
  const fetchNotifications = useCallback(async (params: {
    page?: number
    limit?: number
    unread_only?: boolean
  } = {}) => {
    if (status !== 'authenticated') {
      return
    }

    const cacheKey = getCacheKey('notifications', params)
    const cachedData = getCachedData(cacheKey)

    if (cachedData) {
      setNotifications(cachedData.notifications)
      setUnreadCount(cachedData.unread_count)
      setPagination(cachedData.pagination)
      return cachedData
    }

    try {
      setIsLoading(true)
      setError(null)

      const data = await notificationApi.getList(params)
      setNotifications(data.notifications)
      setUnreadCount(data.unread_count)
      setPagination(data.pagination)

      // Cache the data
      setCachedData(cacheKey, data, CACHE_DURATION)

      return data
    } catch (err) {
      setError('Failed to fetch notifications')
    } finally {
      setIsLoading(false)
    }
  }, [status]) // FIXED: Remove unstable dependencies

  // Fetch notification settings with caching
  const fetchSettings = useCallback(async () => {
    if (status !== 'authenticated') {
      return
    }

    const cacheKey = 'settings'
    const cachedData = getCachedData(cacheKey)

    if (cachedData) {
      setSettings(cachedData)
      return cachedData
    }

    try {
      const data = await notificationApi.getSettings()
      setSettings(data.settings)

      // Cache the settings
      setCachedData(cacheKey, data.settings, CACHE_DURATION)

      return data.settings
    } catch (err) {
      setError('Failed to fetch notification settings')
    }
  }, [status]) // FIXED: Remove unstable dependencies

  // Update notification settings
  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    if (status !== 'authenticated') {
      toast.error('Please log in to update notification settings')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const data = await notificationApi.updateSettings(newSettings)
      setSettings(data.settings)

      // Update cache
      setCachedData('settings', data.settings, CACHE_DURATION)

      toast.success('Notification settings updated successfully')
      return data.settings
    } catch (err) {
      setError('Failed to update notification settings')
      toast.error('Failed to update notification settings')
    } finally {
      setIsLoading(false)
    }
  }, [status, setCachedData])

  // Mark notifications as read
  const markAsRead = useCallback(async (notificationIds?: number[], markAll = false) => {
    if (status !== 'authenticated') {
      return
    }

    try {
      setError(null)

      const data = await notificationApi.markRead({
        notification_ids: notificationIds,
        mark_all: markAll,
      })

      // Update local state
      if (markAll) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })))
        setUnreadCount(0)
      } else if (notificationIds) {
        setNotifications(prev => prev.map(n =>
          notificationIds.includes(n.id)
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        ))
        setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
      }

      // Clear relevant cache entries
      cache.current.clear()

      return data
    } catch (err) {
      setError('Failed to mark notifications as read')
    }
  }, [status])

  // Fetch unread count only with caching - OPTIMIZED
  const fetchUnreadCount = useCallback(async () => {
    if (status !== 'authenticated') {
      return
    }

    const cacheKey = 'unread_count'
    const cachedData = getCachedData(cacheKey)

    if (cachedData !== null) {
      setUnreadCount(cachedData)
      return cachedData
    }

    try {
      // OPTIMIZATION: Use dedicated unread count endpoint
      const data = await notificationApi.getUnreadCount()
      setUnreadCount(data.unread_count)

      // Cache unread count with shorter duration
      setCachedData(cacheKey, data.unread_count, UNREAD_COUNT_CACHE_DURATION)

      return data.unread_count
    } catch (err) {
      // Silent error handling
      setError('Failed to fetch unread count')
    }
  }, [status]) // FIXED: Remove unstable dependencies

  // Initial fetch on authentication
  useEffect(() => {
    if (status === 'authenticated') {
      fetchUnreadCount() // Initial fetch
    }
  }, [status, fetchUnreadCount])

  // Auto-refresh notifications
  useEffect(() => {
    if (!autoRefresh || status !== 'authenticated') {
      return
    }

    const interval = setInterval(() => {
      fetchUnreadCount()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, status, fetchUnreadCount])

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    settings,
    isLoading,
    error,
    pagination,
    fetchNotifications,
    fetchSettings,
    updateSettings,
    markAsRead,
    fetchUnreadCount,
    isAuthenticated: status === 'authenticated',
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

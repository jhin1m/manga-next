'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { notificationApi } from '@/lib/api/client'
import { useNotifications } from '@/hooks/useNotifications'
import { Bell, TestTube, Zap, Settings, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

export default function TestNotificationsPage() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [testInfo, setTestInfo] = useState<any>(null)
  
  const {
    notifications,
    unreadCount,
    settings,
    fetchNotifications,
    fetchSettings,
    isAuthenticated,
  } = useNotifications()

  const handleCreateTestNotification = async (type: 'test' | 'new_chapter') => {
    if (!isAuthenticated) {
      toast.error('Please log in to test notifications')
      return
    }

    setIsLoading(true)
    try {
      const result = await notificationApi.createTest(type)
      toast.success(`${type === 'test' ? 'Test' : 'New chapter'} notification created successfully!`)
      
      // Refresh notifications
      await fetchNotifications()
    } catch (error) {
      console.error('Error creating test notification:', error)
      toast.error('Failed to create test notification')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetTestInfo = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to view test info')
      return
    }

    try {
      const result = await notificationApi.getTestInfo()
      setTestInfo(result)
    } catch (error) {
      console.error('Error fetching test info:', error)
      toast.error('Failed to fetch test info')
    }
  }

  const handleRefreshData = async () => {
    if (!isAuthenticated) return
    
    setIsLoading(true)
    try {
      await Promise.all([
        fetchNotifications(),
        fetchSettings(),
        handleGetTestInfo(),
      ])
      toast.success('Data refreshed successfully')
    } catch (error) {
      toast.error('Failed to refresh data')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification System Test
            </CardTitle>
            <CardDescription>
              Please log in to test the notification system.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <TestTube className="h-8 w-8" />
              Notification System Test
            </h1>
            <p className="text-muted-foreground">
              Test and demonstrate the notification system functionality.
            </p>
          </div>
          <Button onClick={handleRefreshData} disabled={isLoading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Separator />

        {/* Current Status */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Unread Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notifications.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Settings Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <Badge variant={settings?.in_app_notifications ? 'default' : 'secondary'}>
                  In-app: {settings?.in_app_notifications ? 'ON' : 'OFF'}
                </Badge>
                <Badge variant={settings?.new_chapter_alerts ? 'default' : 'secondary'}>
                  Chapters: {settings?.new_chapter_alerts ? 'ON' : 'OFF'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Test Actions
            </CardTitle>
            <CardDescription>
              Create test notifications to see how the system works.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Button
                onClick={() => handleCreateTestNotification('test')}
                disabled={isLoading}
                className="w-full"
              >
                <Bell className="h-4 w-4 mr-2" />
                Create Test Notification
              </Button>
              
              <Button
                onClick={() => handleCreateTestNotification('new_chapter')}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Simulate New Chapter
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>• <strong>Test Notification:</strong> Creates a simple system notification</p>
              <p>• <strong>New Chapter:</strong> Simulates a new chapter notification (requires favorited manga)</p>
            </div>
          </CardContent>
        </Card>

        {/* Test Info */}
        {testInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Test Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">User Info</h4>
                  <p className="text-sm text-muted-foreground">User ID: {testInfo.user_id}</p>
                  <p className="text-sm text-muted-foreground">Favorites: {testInfo.favorites_count}</p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Recent Notifications</h4>
                  {testInfo.recent_notifications?.length > 0 ? (
                    <div className="space-y-2">
                      {testInfo.recent_notifications.map((notification: any) => (
                        <div key={notification.id} className="p-2 border rounded text-sm">
                          <div className="font-medium">{notification.title}</div>
                          <div className="text-muted-foreground">{notification.message}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(notification.created_at).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent notifications</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">1. Check Notification Settings</h4>
              <p className="text-sm text-muted-foreground">
                Go to Profile → Settings to configure your notification preferences.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">2. Add Favorites</h4>
              <p className="text-sm text-muted-foreground">
                Add some manga to your favorites to test new chapter notifications.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">3. Test Notifications</h4>
              <p className="text-sm text-muted-foreground">
                Use the test buttons above to create notifications and see them in the notification bell.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">4. Check Notification Bell</h4>
              <p className="text-sm text-muted-foreground">
                Look at the bell icon in the header to see your notifications and unread count.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

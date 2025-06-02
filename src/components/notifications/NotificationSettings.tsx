'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useNotifications } from '@/hooks/useNotifications'
import { Loader2, Bell, Settings } from 'lucide-react'

export function NotificationSettings() {
  const t = useTranslations('notifications')
  const [isLoading, setIsLoading] = useState(false)
  const [localSettings, setLocalSettings] = useState({
    in_app_notifications: true,
    new_chapter_alerts: true,
  })

  const {
    settings,
    fetchSettings,
    updateSettings,
    isAuthenticated,
  } = useNotifications()

  // Fetch settings on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchSettings()
    }
  }, [isAuthenticated, fetchSettings])

  // Update local settings when fetched settings change
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings)
    }
  }, [settings])

  const handleSettingChange = (key: keyof typeof localSettings, value: boolean) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      await updateSettings(localSettings)
    } finally {
      setIsLoading(false)
    }
  }

  const hasChanges = settings && (
    settings.in_app_notifications !== localSettings.in_app_notifications ||
    settings.new_chapter_alerts !== localSettings.new_chapter_alerts
  )

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('settings')}
          </CardTitle>
          <CardDescription>
            {t('loginRequired')}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          {t('settings')}
        </CardTitle>
        <CardDescription>
          Manage your notification preferences and stay updated with your favorite manga.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* In-App Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="in-app-notifications" className="text-sm font-medium">
                {t('inAppNotifications')}
              </Label>
              <p className="text-xs text-muted-foreground">
                Receive notifications within the application
              </p>
            </div>
            <Switch
              id="in-app-notifications"
              checked={localSettings.in_app_notifications}
              onCheckedChange={(checked) => handleSettingChange('in_app_notifications', checked)}
            />
          </div>

          <Separator />

          {/* New Chapter Alerts */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="new-chapter-alerts" className="text-sm font-medium">
                {t('newChapterAlerts')}
              </Label>
              <p className="text-xs text-muted-foreground">
                Get notified when your favorited manga releases new chapters
              </p>
            </div>
            <Switch
              id="new-chapter-alerts"
              checked={localSettings.new_chapter_alerts}
              onCheckedChange={(checked) => handleSettingChange('new_chapter_alerts', checked)}
              disabled={!localSettings.in_app_notifications}
            />
          </div>
        </div>

        {/* Save Button */}
        {hasChanges && (
          <div className="pt-4">
            <Button
              onClick={handleSaveSettings}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Bell className="mr-2 h-4 w-4" />
                  {t('saveSettings')}
                </>
              )}
            </Button>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Bell className="h-4 w-4" />
            How notifications work
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• You'll only receive notifications for manga you've added to favorites</li>
            <li>• Notifications appear when new chapters are published</li>
            <li>• You can view all notifications from the bell icon in the header</li>
            <li>• Notifications are automatically marked as read when you click on them</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

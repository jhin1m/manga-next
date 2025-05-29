"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface StorageHealth {
  provider: string
  health: boolean
  error?: string
  timestamp: string
  configuration: {
    cloudinary: {
      configured: boolean
      cloudName: string | null
    }
    s3: {
      configured: boolean
      region: string | null
      bucket: string | null
      endpoint: string | null
      forcePathStyle: boolean
      cdnUrl: string | null
      provider: string
    }
  }
}

export function StorageTest() {
  const [health, setHealth] = useState<StorageHealth | null>(null)
  const [loading, setLoading] = useState(false)

  const checkHealth = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/storage/health')
      if (response.ok) {
        const data = await response.json()
        setHealth(data)
        toast.success('Storage health check completed')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to check storage health')
      }
    } catch (error) {
      toast.error('Failed to check storage health')
      console.error('Storage health check error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Storage Configuration Test</h2>
          <p className="text-muted-foreground">
            Check your storage provider configuration and health
          </p>
        </div>
        <Button onClick={checkHealth} disabled={loading}>
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {health && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Current Provider Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Active Provider
                {health.health ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </CardTitle>
              <CardDescription>
                Currently configured storage provider
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={health.health ? "default" : "destructive"}>
                  {health.provider.toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {health.health ? "Healthy" : "Unhealthy"}
                </span>
              </div>

              {health.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{health.error}</p>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Last checked: {new Date(health.timestamp).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          {/* Cloudinary Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Cloudinary Configuration
                {health.configuration.cloudinary.configured ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </CardTitle>
              <CardDescription>
                Cloudinary storage provider settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Configured:</span>
                <Badge variant={health.configuration.cloudinary.configured ? "default" : "secondary"}>
                  {health.configuration.cloudinary.configured ? "Yes" : "No"}
                </Badge>
              </div>

              {health.configuration.cloudinary.cloudName && (
                <div className="flex justify-between">
                  <span className="text-sm">Cloud Name:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {health.configuration.cloudinary.cloudName}
                  </code>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                {health.configuration.cloudinary.configured
                  ? "Ready to use Cloudinary for uploads"
                  : "Missing CLOUDINARY_CLOUD_NAME or CLOUDINARY_API_KEY"
                }
              </div>
            </CardContent>
          </Card>

          {/* S3-Compatible Storage Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                S3-Compatible Storage
                {health.configuration.s3.configured ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </CardTitle>
              <CardDescription>
                S3-compatible storage provider settings ({health.configuration.s3.provider})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Configured:</span>
                <Badge variant={health.configuration.s3.configured ? "default" : "secondary"}>
                  {health.configuration.s3.configured ? "Yes" : "No"}
                </Badge>
              </div>

              <div className="flex justify-between">
                <span className="text-sm">Provider:</span>
                <Badge variant="outline">
                  {health.configuration.s3.provider}
                </Badge>
              </div>

              {health.configuration.s3.endpoint && (
                <div className="flex justify-between">
                  <span className="text-sm">Endpoint:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded max-w-[200px] truncate">
                    {health.configuration.s3.endpoint}
                  </code>
                </div>
              )}

              {health.configuration.s3.region && (
                <div className="flex justify-between">
                  <span className="text-sm">Region:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {health.configuration.s3.region}
                  </code>
                </div>
              )}

              {health.configuration.s3.bucket && (
                <div className="flex justify-between">
                  <span className="text-sm">Bucket:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {health.configuration.s3.bucket}
                  </code>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-sm">Path Style:</span>
                <Badge variant="outline">
                  {health.configuration.s3.forcePathStyle ? "Force" : "Virtual"}
                </Badge>
              </div>

              {health.configuration.s3.cdnUrl && (
                <div className="flex justify-between">
                  <span className="text-sm">CDN:</span>
                  <Badge variant="outline">Enabled</Badge>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                {health.configuration.s3.configured
                  ? `Ready to use ${health.configuration.s3.provider} for uploads`
                  : "Missing access credentials or bucket configuration"
                }
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Setup Instructions</CardTitle>
              <CardDescription>
                How to configure your storage providers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Environment Variables:</h4>
                <code className="block text-xs bg-muted p-2 rounded">
                  STORAGE_PROVIDER="cloudinary" # or "s3"
                </code>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Documentation:</h4>
                <ul className="text-sm space-y-1">
                  <li>• <a href="/docs/cloudinary-setup.md" className="text-blue-600 hover:underline">Storage Setup Guide</a></li>
                  <li>• <a href="/docs/aws-s3-setup.md" className="text-blue-600 hover:underline">AWS S3 Setup Guide</a></li>
                  <li>• <a href="/docs/s3-compatible-providers.md" className="text-blue-600 hover:underline">S3-Compatible Providers</a></li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

import { validateS3Config, uploadAvatarToS3, deleteAvatarFromS3 } from './aws-s3'
import cloudinary, { avatarUploadOptions, deleteAvatar as deleteCloudinaryAvatar } from './cloudinary'

// Storage provider types
export type StorageProvider = 'cloudinary' | 's3'

export interface UploadResult {
  url: string
  publicId: string
  provider: StorageProvider
  sizes?: Record<string, string>
}

// Determine which storage provider to use
export function getStorageProvider(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER as StorageProvider || 'cloudinary'
  
  // Validate configuration based on provider
  if (provider === 's3' && !validateS3Config()) {
    console.warn('S3 configuration incomplete, falling back to Cloudinary')
    return 'cloudinary'
  }
  
  if (provider === 'cloudinary' && !process.env.CLOUDINARY_CLOUD_NAME) {
    console.warn('Cloudinary configuration incomplete, falling back to S3')
    return 's3'
  }
  
  return provider
}

// Convert file to buffer
function fileToBuffer(base64Data: string): Buffer {
  // Remove data URL prefix if present
  const base64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '')
  return Buffer.from(base64, 'base64')
}

// Upload avatar using the configured provider
export async function uploadAvatar(
  base64Data: string,
  fileName: string,
  userId: string
): Promise<UploadResult> {
  const provider = getStorageProvider()
  
  try {
    if (provider === 's3') {
      const buffer = fileToBuffer(base64Data)
      const result = await uploadAvatarToS3(buffer, `user-${userId}`, 'image/webp')
      
      return {
        url: result.url,
        publicId: result.key,
        provider: 's3',
        sizes: result.sizes,
      }
    } else {
      // Cloudinary upload
      const uploadResult = await cloudinary.uploader.upload(base64Data, {
        ...avatarUploadOptions,
        public_id: `manga-website/avatars/user-${userId}-${Date.now()}`,
      })
      
      return {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        provider: 'cloudinary',
      }
    }
  } catch (error) {
    console.error(`Error uploading to ${provider}:`, error)
    throw new Error(`Failed to upload avatar using ${provider}`)
  }
}

// Delete avatar using the configured provider
export async function deleteAvatar(publicId: string, provider?: StorageProvider): Promise<void> {
  const storageProvider = provider || getStorageProvider()
  
  try {
    if (storageProvider === 's3') {
      await deleteAvatarFromS3(publicId)
    } else {
      await deleteCloudinaryAvatar(publicId)
    }
  } catch (error) {
    console.error(`Error deleting from ${storageProvider}:`, error)
    throw new Error(`Failed to delete avatar from ${storageProvider}`)
  }
}

// Get avatar URL with size (works for both providers)
export function getAvatarUrl(
  publicId: string, 
  size: 'small' | 'medium' | 'large' = 'medium',
  provider?: StorageProvider
): string {
  const storageProvider = provider || getStorageProvider()
  
  if (storageProvider === 's3') {
    // For S3, we need to import the function dynamically to avoid issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getAvatarS3Url } = require('./aws-s3')
    return getAvatarS3Url(publicId, size)
  } else {
    // For Cloudinary, use the existing function
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getAvatarUrl: getCloudinaryUrl } = require('./cloudinary')
    return getCloudinaryUrl(publicId, size)
  }
}

// Health check for storage providers
export async function checkStorageHealth(): Promise<{
  provider: StorageProvider
  healthy: boolean
  error?: string
}> {
  const provider = getStorageProvider()
  
  try {
    if (provider === 's3') {
      // Simple S3 health check - try to list bucket (without actually listing)
      const { S3Client, HeadBucketCommand } = await import('@aws-sdk/client-s3')
      const s3Client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      })
      
      await s3Client.send(new HeadBucketCommand({ 
        Bucket: process.env.AWS_S3_BUCKET! 
      }))
    } else {
      // Cloudinary health check
      await cloudinary.api.ping()
    }
    
    return { provider, healthy: true }
  } catch (error) {
    return { 
      provider, 
      healthy: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

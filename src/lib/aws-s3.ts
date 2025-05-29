import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import sharp from 'sharp'

// Configure S3-compatible client (supports AWS S3, Wasabi, Backblaze, etc.)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  // Custom endpoint for S3-compatible services
  ...(process.env.S3_ENDPOINT && {
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true', // Required for some providers
  }),
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET!
const CDN_URL = process.env.AWS_CLOUDFRONT_URL // Optional CDN URL
const S3_ENDPOINT = process.env.S3_ENDPOINT // Custom S3 endpoint

// Generate S3 URL based on provider configuration
function generateS3Url(key: string): string {
  // If CDN URL is provided, use it
  if (CDN_URL) {
    return `${CDN_URL}/${key}`
  }

  // If custom S3 endpoint is provided (Wasabi, Backblaze, etc.)
  if (S3_ENDPOINT) {
    const cleanEndpoint = S3_ENDPOINT.replace(/\/$/, '') // Remove trailing slash
    if (process.env.S3_FORCE_PATH_STYLE === 'true') {
      return `${cleanEndpoint}/${BUCKET_NAME}/${key}`
    } else {
      // Virtual hosted-style (subdomain)
      const baseUrl = cleanEndpoint.replace('https://', `https://${BUCKET_NAME}.`)
      return `${baseUrl}/${key}`
    }
  }

  // Default AWS S3 URL
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`
}

// Avatar upload options for S3
export const avatarS3Options = {
  folder: 'manga-website/avatars',
  maxFileSize: 5000000, // 5MB
  allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  sizes: {
    small: { width: 32, height: 32 },
    medium: { width: 64, height: 64 },
    large: { width: 128, height: 128 },
    original: { width: 400, height: 400 },
  }
}

// Process and optimize image using Sharp
async function processImage(buffer: Buffer, size: { width: number; height: number }) {
  return await sharp(buffer)
    .resize(size.width, size.height, {
      fit: 'cover',
      position: 'center',
    })
    .webp({ quality: 85 })
    .toBuffer()
}

// Upload avatar to S3 with multiple sizes
export async function uploadAvatarToS3(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<{ url: string; key: string; sizes: Record<string, string> }> {
  const timestamp = Date.now()
  const baseKey = `${avatarS3Options.folder}/${fileName}-${timestamp}`
  const sizes: Record<string, string> = {}

  try {
    // Process and upload different sizes
    for (const [sizeName, dimensions] of Object.entries(avatarS3Options.sizes)) {
      const processedBuffer = await processImage(fileBuffer, dimensions)
      const key = `${baseKey}-${sizeName}.webp`

      const uploadCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: processedBuffer,
        ContentType: 'image/webp',
        CacheControl: 'max-age=31536000', // 1 year
        Metadata: {
          originalName: fileName,
          size: sizeName,
          uploadedAt: new Date().toISOString(),
        },
      })

      await s3Client.send(uploadCommand)

      // Generate URL based on provider
      const url = generateS3Url(key)

      sizes[sizeName] = url
    }

    return {
      url: sizes.original, // Return original size as main URL
      key: baseKey,
      sizes,
    }
  } catch (error) {
    console.error('Error uploading to S3:', error)
    throw new Error('Failed to upload avatar to S3')
  }
}

// Delete avatar from S3 (all sizes)
export async function deleteAvatarFromS3(baseKey: string): Promise<void> {
  try {
    const deletePromises = Object.keys(avatarS3Options.sizes).map(sizeName => {
      const key = `${baseKey}-${sizeName}.webp`
      const deleteCommand = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
      return s3Client.send(deleteCommand)
    })

    await Promise.all(deletePromises)
  } catch (error) {
    console.error('Error deleting from S3:', error)
    throw new Error('Failed to delete avatar from S3')
  }
}

// Generate presigned URL for direct upload (optional, for client-side uploads)
export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  })

  return await getSignedUrl(s3Client, command, { expiresIn })
}

// Get avatar URL with size
export function getAvatarS3Url(baseKey: string, size: 'small' | 'medium' | 'large' | 'original' = 'medium'): string {
  const key = `${baseKey}-${size}.webp`
  return generateS3Url(key)
}

// Validate S3 configuration
export function validateS3Config(): boolean {
  const requiredEnvVars = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_S3_BUCKET',
    'AWS_REGION'
  ]

  return requiredEnvVars.every(envVar => process.env[envVar])
}

import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default cloudinary

// Upload options for avatars
export const avatarUploadOptions = {
  folder: 'manga-website/avatars',
  transformation: [
    {
      width: 400,
      height: 400,
      crop: 'fill',
      gravity: 'face',
      quality: 'auto',
      format: 'webp',
    }
  ],
  allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  max_file_size: 5000000, // 5MB
}

// Generate avatar URL with transformations
export function getAvatarUrl(publicId: string, size: 'small' | 'medium' | 'large' = 'medium') {
  const sizeMap = {
    small: { width: 32, height: 32 },
    medium: { width: 64, height: 64 },
    large: { width: 128, height: 128 },
  }

  return cloudinary.url(publicId, {
    ...sizeMap[size],
    crop: 'fill',
    gravity: 'face',
    quality: 'auto',
    format: 'webp',
  })
}

// Delete avatar from Cloudinary
export async function deleteAvatar(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    console.error('Error deleting avatar:', error)
    throw error
  }
}

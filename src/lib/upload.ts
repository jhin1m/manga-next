import { SITE_CONSTANTS } from '@/config/site.constants'

// File validation utilities
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Check file size
  if (file.size > SITE_CONSTANTS.images.avatar.maxSize) {
    return {
      isValid: false,
      error: `File size must be less than ${SITE_CONSTANTS.images.avatar.maxSize / (1024 * 1024)}MB`
    }
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only JPEG, PNG, and WebP images are allowed'
    }
  }

  return { isValid: true }
}

// Convert file to base64 for upload
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to convert file to base64'))
      }
    }
    reader.onerror = error => reject(error)
  })
}

// Upload avatar to server
export async function uploadAvatar(file: File): Promise<{ url: string; publicId: string }> {
  const validation = validateImageFile(file)
  if (!validation.isValid) {
    throw new Error(validation.error)
  }

  const base64 = await fileToBase64(file)

  const response = await fetch('/api/upload/avatar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image: base64 }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to upload avatar')
  }

  return response.json()
}

// Delete avatar from server
export async function deleteAvatar(publicId: string): Promise<void> {
  const response = await fetch('/api/upload/avatar', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ publicId }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to delete avatar')
  }
}

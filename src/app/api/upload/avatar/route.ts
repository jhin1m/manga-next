import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { uploadAvatar, deleteAvatar, getStorageProvider } from '@/lib/storage-provider'
import { z } from 'zod'

// Validation schemas
const uploadSchema = z.object({
  image: z.string().min(1, 'Image data is required'),
})

const deleteSchema = z.object({
  publicId: z.string().min(1, 'Public ID is required'),
})

/**
 * POST /api/upload/avatar
 * Upload user avatar to Cloudinary
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { image } = uploadSchema.parse(body)

    // Get current user to check for existing avatar
    const user = await prisma.users.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { avatar_url: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete existing avatar if it exists
    if (user.avatar_url) {
      try {
        // Extract publicId from URL based on storage provider
        const provider = getStorageProvider()
        let publicId = ''

        if (provider === 'cloudinary' && user.avatar_url.includes('cloudinary.com')) {
          const urlParts = user.avatar_url.split('/')
          const publicIdWithExtension = urlParts[urlParts.length - 1]
          publicId = `manga-website/avatars/${publicIdWithExtension.split('.')[0]}`
        } else if (provider === 's3' && (user.avatar_url.includes('amazonaws.com') || user.avatar_url.includes(process.env.AWS_CLOUDFRONT_URL || ''))) {
          // Extract S3 key from URL
          const urlParts = user.avatar_url.split('/')
          const fileName = urlParts[urlParts.length - 1].split('-original.webp')[0]
          publicId = `manga-website/avatars/${fileName}`
        }

        if (publicId) {
          await deleteAvatar(publicId)
        }
      } catch (error) {
        console.warn('Failed to delete old avatar:', error)
        // Continue with upload even if deletion fails
      }
    }

    // Upload new avatar using configured storage provider
    const uploadResult = await uploadAvatar(image, `user-${session.user.id}`, session.user.id)

    // Update user avatar URL in database
    await prisma.users.update({
      where: { id: parseInt(session.user.id) },
      data: { avatar_url: uploadResult.url }
    })

    return NextResponse.json({
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      provider: uploadResult.provider,
      sizes: uploadResult.sizes,
    })

  } catch (error) {
    console.error('Avatar upload error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/upload/avatar
 * Delete user avatar from Cloudinary
 */
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { publicId } = deleteSchema.parse(body)

    // Delete from Cloudinary
    await deleteAvatar(publicId)

    // Update user avatar URL in database
    await prisma.users.update({
      where: { id: parseInt(session.user.id) },
      data: { avatar_url: null }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Avatar deletion error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete avatar' },
      { status: 500 }
    )
  }
}

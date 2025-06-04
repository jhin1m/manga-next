import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminAuth, logAdminAction, AdminPermissions } from '@/lib/admin/middleware'
import { AdminRole, userBanSchema } from '@/types/admin'
import { prisma } from '@/lib/db'

/**
 * POST /api/admin/users/[id]/ban
 * Ban a user
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check admin authentication
    const authResult = await requireAdminAuth(request, AdminRole.MODERATOR)
    if (authResult instanceof NextResponse) {
      return authResult
    }
    const { user } = authResult
    const { id } = await params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid user ID' 
        },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = userBanSchema.parse(body)

    // Check permissions
    const permissions = new AdminPermissions(user.role)
    if (!permissions.canBanUsers()) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Insufficient permissions to ban users' 
        },
        { status: 403 }
      )
    }

    // Prevent self-ban
    if (userId === parseInt(user.id)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Cannot ban your own account' 
        },
        { status: 400 }
      )
    }

    // Check if target user exists
    const targetUser = await prisma.users.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        username: true, 
        email: true, 
        role: true 
      }
    })

    if (!targetUser) {
      return NextResponse.json(
        { 
          success: false,
          error: 'User not found' 
        },
        { status: 404 }
      )
    }

    // Prevent banning other admins (unless super admin)
    if (targetUser.role !== 'user' && user.role !== 'super_admin') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Cannot ban admin users' 
        },
        { status: 403 }
      )
    }

    // Check if user is already banned
    if (targetUser.role === 'banned') {
      return NextResponse.json(
        { 
          success: false,
          error: 'User is already banned' 
        },
        { status: 400 }
      )
    }

    // Calculate expiration date if duration is provided
    let expiresAt: Date | undefined
    if (validatedData.duration) {
      expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + validatedData.duration)
    }

    // Update user role to banned
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        role: 'banned',
        updated_at: new Date()
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        updated_at: true
      }
    })

    // TODO: Create ban record in a separate table for tracking
    // This would include ban reason, duration, banned_by, etc.
    // For now, we'll just log the action

    // Log admin action
    await logAdminAction(
      parseInt(user.id),
      'BAN_USER',
      'user',
      userId,
      { 
        username: targetUser.username,
        email: targetUser.email,
        reason: validatedData.reason,
        duration: validatedData.duration,
        expiresAt: expiresAt?.toISOString(),
        notify: validatedData.notify
      },
      request
    )

    // TODO: Send notification to user if notify is true
    if (validatedData.notify) {
      // Implement notification logic here
      console.log(`Sending ban notification to user ${targetUser.username}`)
    }

    return NextResponse.json({
      success: true,
      message: 'User banned successfully',
      data: {
        user: updatedUser,
        banInfo: {
          reason: validatedData.reason,
          duration: validatedData.duration,
          expiresAt: expiresAt?.toISOString(),
          bannedBy: parseInt(user.id),
          bannedAt: new Date().toISOString()
        }
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid request data',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    console.error('[ADMIN_USER_BAN_ERROR]', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to ban user' 
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/users/[id]/ban
 * Unban a user
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check admin authentication
    const authResult = await requireAdminAuth(request, AdminRole.MODERATOR)
    if (authResult instanceof NextResponse) {
      return authResult
    }
    const { user } = authResult
    const { id } = await params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid user ID' 
        },
        { status: 400 }
      )
    }

    // Check permissions
    const permissions = new AdminPermissions(user.role)
    if (!permissions.canBanUsers()) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Insufficient permissions to unban users' 
        },
        { status: 403 }
      )
    }

    // Check if target user exists and is banned
    const targetUser = await prisma.users.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        username: true, 
        email: true, 
        role: true 
      }
    })

    if (!targetUser) {
      return NextResponse.json(
        { 
          success: false,
          error: 'User not found' 
        },
        { status: 404 }
      )
    }

    if (targetUser.role !== 'banned') {
      return NextResponse.json(
        { 
          success: false,
          error: 'User is not banned' 
        },
        { status: 400 }
      )
    }

    // Restore user role to 'user'
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        role: 'user',
        updated_at: new Date()
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        updated_at: true
      }
    })

    // Log admin action
    await logAdminAction(
      parseInt(user.id),
      'UNBAN_USER',
      'user',
      userId,
      { 
        username: targetUser.username,
        email: targetUser.email
      },
      request
    )

    return NextResponse.json({
      success: true,
      message: 'User unbanned successfully',
      data: updatedUser
    })

  } catch (error) {
    console.error('[ADMIN_USER_UNBAN_ERROR]', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to unban user' 
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/users/[id]/ban
 * Get user ban information
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check admin authentication
    const authResult = await requireAdminAuth(_request, AdminRole.MODERATOR)
    if (authResult instanceof NextResponse) {
      return authResult
    }
    const { id } = await params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid user ID' 
        },
        { status: 400 }
      )
    }

    // Check if target user exists
    const targetUser = await prisma.users.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        username: true, 
        email: true, 
        role: true,
        updated_at: true
      }
    })

    if (!targetUser) {
      return NextResponse.json(
        { 
          success: false,
          error: 'User not found' 
        },
        { status: 404 }
      )
    }

    const isBanned = targetUser.role === 'banned'

    // TODO: Get ban details from ban records table
    // For now, return basic information
    const banInfo = isBanned ? {
      isBanned: true,
      bannedAt: targetUser.updated_at, // Approximation
      reason: 'Ban reason not available', // Would come from ban records
      duration: null, // Would come from ban records
      expiresAt: null, // Would come from ban records
      bannedBy: null // Would come from ban records
    } : {
      isBanned: false
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: targetUser.id,
          username: targetUser.username,
          email: targetUser.email,
          role: targetUser.role
        },
        banInfo
      }
    })

  } catch (error) {
    console.error('[ADMIN_USER_BAN_INFO_ERROR]', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch ban information' 
      },
      { status: 500 }
    )
  }
}

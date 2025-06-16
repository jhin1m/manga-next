import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdminRole, AdminPermissions } from '@/lib/admin/middleware';
import { prisma } from '@/lib/db';

/**
 * GET /api/admin/auth/session
 * Get current admin session with permissions
 */
export async function GET(_request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not authenticated',
          authenticated: false,
        },
        { status: 401 }
      );
    }

    // Check if user has admin role
    if (!isAdminRole(session.user.role)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Admin access required',
          authenticated: true,
          isAdmin: false,
        },
        { status: 403 }
      );
    }

    // Get detailed user information
    const user = await prisma.users.findUnique({
      where: { id: parseInt(session.user.id) },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatar_url: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
          authenticated: false,
        },
        { status: 404 }
      );
    }

    // Get user permissions
    const permissions = new AdminPermissions(user.role);
    const userPermissions = {
      // User management
      canManageUsers: permissions.canManageUsers(),
      canBanUsers: permissions.canBanUsers(),
      canDeleteUsers: permissions.canDeleteUsers(),
      canChangeUserRoles: permissions.canChangeUserRoles(),

      // Content management
      canManageManga: permissions.canManageManga(),
      canDeleteManga: permissions.canDeleteManga(),
      canManageChapters: permissions.canManageChapters(),
      canDeleteChapters: permissions.canDeleteChapters(),

      // Moderation
      canModerateComments: permissions.canModerateComments(),
      canHandleReports: permissions.canHandleReports(),

      // System management
      canManageSystem: permissions.canManageSystem(),
      canAccessAnalytics: permissions.canAccessAnalytics(),
      canManageCache: permissions.canManageCache(),
      canPerformMaintenance: permissions.canPerformMaintenance(),

      // File management
      canUploadFiles: permissions.canUploadFiles(),
      canDeleteFiles: permissions.canDeleteFiles(),
    };

    return NextResponse.json({
      success: true,
      authenticated: true,
      isAdmin: true,
      user,
      permissions: userPermissions,
      session: {
        expires: session.expires,
      },
    });
  } catch (error) {
    console.error('[ADMIN_SESSION_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        authenticated: false,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/auth/session
 * Refresh admin session
 */
export async function POST(_request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not authenticated',
        },
        { status: 401 }
      );
    }

    // Check if user has admin role
    if (!isAdminRole(session.user.role)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Admin access required',
        },
        { status: 403 }
      );
    }

    // Update last activity timestamp
    await prisma.users.update({
      where: { id: parseInt(session.user.id) },
      data: { updated_at: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: 'Session refreshed',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[ADMIN_SESSION_REFRESH_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

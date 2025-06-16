import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAdminAuth, logAdminAction, AdminPermissions } from '@/lib/admin/middleware';
import { AdminRole, userUpdateSchema } from '@/types/admin';
import { prisma } from '@/lib/db';

/**
 * GET /api/admin/users/[id]
 * Get detailed user information for admin
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check admin authentication
    const authResult = await requireAdminAuth(_request, AdminRole.ADMIN);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid user ID',
        },
        { status: 400 }
      );
    }

    const targetUser = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatar_url: true,
        created_at: true,
        updated_at: true,
        Comments: {
          select: {
            id: true,
            content: true,
            status: true,
            created_at: true,
            Comics: {
              select: {
                title: true,
                slug: true,
              },
            },
            Chapters: {
              select: {
                title: true,
                slug: true,
              },
            },
          },
          orderBy: { created_at: 'desc' },
          take: 10,
        },
        Favorites: {
          select: {
            created_at: true,
            Comics: {
              select: {
                title: true,
                slug: true,
                cover_image_url: true,
              },
            },
          },
          orderBy: { created_at: 'desc' },
          take: 10,
        },
        Ratings: {
          select: {
            id: true,
            rating: true,
            created_at: true,
            Comics: {
              select: {
                title: true,
                slug: true,
              },
            },
          },
          orderBy: { created_at: 'desc' },
          take: 10,
        },
        ChapterReports: {
          select: {
            id: true,
            reason: true,
            status: true,
            created_at: true,
            Chapters: {
              select: {
                title: true,
                Comics: {
                  select: {
                    title: true,
                    slug: true,
                  },
                },
              },
            },
          },
          orderBy: { created_at: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            Comments: true,
            Favorites: true,
            Ratings: true,
            ChapterReports: true,
            Chapter_Views: true,
            Comic_Views: true,
          },
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Get additional statistics
    const [totalReadingTime, favoriteGenres, recentActivity] = await Promise.all([
      // Calculate total reading time (approximate)
      prisma.chapter_Views.count({
        where: { user_id: userId },
      }),

      // Get favorite genres based on favorites
      prisma.comic_Genres.groupBy({
        by: ['genre_id'],
        where: {
          Comics: {
            Favorites: {
              some: { user_id: userId },
            },
          },
        },
        _count: {
          genre_id: true,
        },
        orderBy: {
          _count: {
            genre_id: 'desc',
          },
        },
        take: 5,
      }),

      // Get recent activity
      prisma.chapter_Views.findMany({
        where: { user_id: userId },
        include: {
          Chapters: {
            select: {
              title: true,
              Comics: {
                select: {
                  title: true,
                  slug: true,
                },
              },
            },
          },
        },
        orderBy: { viewed_at: 'desc' },
        take: 10,
      }),
    ]);

    // Get genre names for favorite genres
    const genreIds = favoriteGenres.map(fg => fg.genre_id);
    const genres = await prisma.genres.findMany({
      where: { id: { in: genreIds } },
      select: { id: true, name: true, slug: true },
    });

    const favoriteGenresWithNames = favoriteGenres.map(fg => {
      const genre = genres.find(g => g.id === fg.genre_id);
      return {
        ...genre,
        count: fg._count.genre_id,
      };
    });

    const transformedUser = {
      ...targetUser,
      stats: {
        commentsCount: targetUser.Comments.length,
        favoritesCount: targetUser.Favorites.length,
        ratingsCount: targetUser.Ratings.length,
        reportsCount: targetUser.ChapterReports.length,
        chaptersRead: totalReadingTime,
        totalReadingTime: totalReadingTime * 5, // Approximate 5 minutes per chapter
        favoriteGenres: favoriteGenresWithNames,
        recentActivity,
      },
    };

    return NextResponse.json({
      success: true,
      data: transformedUser,
    });
  } catch (error) {
    console.error('[ADMIN_USER_DETAIL_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user details',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/users/[id]
 * Update user information
 */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check admin authentication
    const authResult = await requireAdminAuth(request, AdminRole.ADMIN);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { user } = authResult;
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid user ID',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = userUpdateSchema.parse(body);

    // Check if target user exists
    const existingUser = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, role: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Check permissions for role changes
    if (validatedData.role && validatedData.role !== existingUser.role) {
      const permissions = new AdminPermissions(user.role);
      if (!permissions.canChangeUserRoles()) {
        return NextResponse.json(
          {
            success: false,
            error: 'Insufficient permissions to change user roles',
          },
          { status: 403 }
        );
      }
    }

    // Check for conflicts if email or username is being changed
    if (validatedData.email || validatedData.username) {
      const conflicts = await prisma.users.findFirst({
        where: {
          AND: [
            { id: { not: userId } },
            {
              OR: [
                validatedData.email ? { email: validatedData.email } : {},
                validatedData.username ? { username: validatedData.username } : {},
              ].filter(condition => Object.keys(condition).length > 0),
            },
          ],
        },
      });

      if (conflicts) {
        return NextResponse.json(
          {
            success: false,
            error: 'User with this email or username already exists',
          },
          { status: 409 }
        );
      }
    }

    // Update user
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        ...validatedData,
        updated_at: new Date(),
      },
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

    // Log admin action
    await logAdminAction(
      parseInt(user.id),
      'UPDATE_USER',
      'user',
      userId,
      {
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        changes: validatedData,
      },
      request
    );

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error('[ADMIN_USER_UPDATE_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete user (super admin only)
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check admin authentication
    const authResult = await requireAdminAuth(request, AdminRole.SUPER_ADMIN);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { user } = authResult;
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid user ID',
        },
        { status: 400 }
      );
    }

    // Check permissions
    const permissions = new AdminPermissions(user.role);
    if (!permissions.canDeleteUsers()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient permissions to delete users',
        },
        { status: 403 }
      );
    }

    // Prevent self-deletion
    if (userId === parseInt(user.id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete your own account',
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const targetUser = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Delete user (cascade will handle related records)
    await prisma.users.delete({
      where: { id: userId },
    });

    // Log admin action
    await logAdminAction(
      parseInt(user.id),
      'DELETE_USER',
      'user',
      userId,
      {
        username: targetUser.username,
        email: targetUser.email,
        role: targetUser.role,
      },
      request
    );

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('[ADMIN_USER_DELETE_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete user',
      },
      { status: 500 }
    );
  }
}

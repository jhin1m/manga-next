import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminAuth, logAdminAction, AdminPermissions } from '@/lib/admin/middleware';
import { AdminRole, mangaUpdateSchema } from '@/types/admin';
import { prisma } from '@/lib/db';

/**
 * GET /api/admin/manga/[id]
 * Get detailed manga information for admin
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check admin authentication
    const authResult = await requireAdminAuth(request, AdminRole.EDITOR);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await params;
    const mangaId = parseInt(id);

    if (isNaN(mangaId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid manga ID',
        },
        { status: 400 }
      );
    }

    const manga = await prisma.comics.findUnique({
      where: { id: mangaId },
      include: {
        Comic_Authors: {
          include: {
            Authors: {
              select: {
                id: true,
                name: true,
                slug: true,
                bio: true,
                avatar_url: true,
              },
            },
          },
        },
        Comic_Genres: {
          include: {
            Genres: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        Chapters: {
          select: {
            id: true,
            title: true,
            slug: true,
            chapter_number: true,
            created_at: true,
            _count: {
              select: {
                Chapter_Views: true,
              },
            },
          },
          orderBy: { chapter_number: 'asc' },
        },
        _count: {
          select: {
            Chapters: true,
            Comic_Views: true,
            Favorites: true,
            Ratings: true,
            Comments: true,
          },
        },
      },
    });

    if (!manga) {
      return NextResponse.json(
        {
          success: false,
          error: 'Manga not found',
        },
        { status: 404 }
      );
    }

    // Get rating statistics
    const ratingStats = await prisma.ratings.aggregate({
      where: { comic_id: mangaId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    // Transform data
    const transformedManga = {
      id: manga.id,
      title: manga.title,
      slug: manga.slug,
      description: manga.description,
      cover_url: manga.cover_image_url,
      status: manga.status,
      author_id: manga.uploader_id,
      created_at: manga.created_at,
      updated_at: manga.updated_at,
      published_at: manga.release_date,
      Authors: manga.Comic_Authors.map(ca => ca.Authors),
      Genres: manga.Comic_Genres.map(cg => cg.Genres),
      Chapters: manga.Chapters.map(chapter => ({
        ...chapter,
        viewsCount: chapter._count.Chapter_Views,
      })),
      stats: {
        chaptersCount: manga._count.Chapters,
        viewsCount: manga._count.Comic_Views,
        favoritesCount: manga._count.Favorites,
        ratingsCount: manga._count.Ratings,
        commentsCount: manga._count.Comments,
        averageRating: ratingStats._avg.rating || 0,
      },
    };

    return NextResponse.json({
      success: true,
      data: transformedManga,
    });
  } catch (error) {
    console.error('[ADMIN_MANGA_DETAIL_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch manga details',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/manga/[id]
 * Update manga information
 */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check admin authentication
    const authResult = await requireAdminAuth(request, AdminRole.EDITOR);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { user } = authResult;

    const { id } = await params;
    const mangaId = parseInt(id);

    if (isNaN(mangaId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid manga ID',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = mangaUpdateSchema.parse(body);

    // Check if manga exists
    const existingManga = await prisma.comics.findUnique({
      where: { id: mangaId },
    });

    if (!existingManga) {
      return NextResponse.json(
        {
          success: false,
          error: 'Manga not found',
        },
        { status: 404 }
      );
    }

    // Check if slug is being changed and if it conflicts
    if (validatedData.slug && validatedData.slug !== existingManga.slug) {
      const slugConflict = await prisma.comics.findFirst({
        where: {
          slug: validatedData.slug,
          id: { not: mangaId },
        },
      });

      if (slugConflict) {
        return NextResponse.json(
          {
            success: false,
            error: 'Manga with this slug already exists',
          },
          { status: 409 }
        );
      }
    }

    // Prepare update data with correct field names
    const updateData: any = {
      updated_at: new Date(),
    };

    if (validatedData.title) updateData.title = validatedData.title;
    if (validatedData.slug) updateData.slug = validatedData.slug;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.cover_url) updateData.cover_image_url = validatedData.cover_url;
    if (validatedData.status) updateData.status = validatedData.status;
    if (validatedData.author_id) updateData.uploader_id = validatedData.author_id;

    // Update manga
    const updatedManga = await prisma.comics.update({
      where: { id: mangaId },
      data: updateData,
      include: {
        Comic_Authors: {
          include: {
            Authors: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    // Update genres if provided
    if (validatedData.genre_ids !== undefined) {
      // Remove existing genres
      await prisma.comic_Genres.deleteMany({
        where: { comic_id: mangaId },
      });

      // Add new genres
      if (validatedData.genre_ids.length > 0) {
        await prisma.comic_Genres.createMany({
          data: validatedData.genre_ids.map(genreId => ({
            comic_id: mangaId,
            genre_id: genreId,
          })),
        });
      }
    }

    // Log admin action
    await logAdminAction(
      parseInt(user.id),
      'UPDATE_MANGA',
      'manga',
      mangaId,
      {
        title: updatedManga.title,
        slug: updatedManga.slug,
        changes: validatedData,
      },
      request
    );

    return NextResponse.json({
      success: true,
      message: 'Manga updated successfully',
      data: updatedManga,
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

    console.error('[ADMIN_MANGA_UPDATE_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update manga',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/manga/[id]
 * Delete manga (admin only)
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check admin authentication
    const authResult = await requireAdminAuth(request, AdminRole.ADMIN);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { user } = authResult;

    const { id } = await params;
    const mangaId = parseInt(id);

    if (isNaN(mangaId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid manga ID',
        },
        { status: 400 }
      );
    }

    // Check permissions
    const permissions = new AdminPermissions(user.role);
    if (!permissions.canDeleteManga()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient permissions to delete manga',
        },
        { status: 403 }
      );
    }

    // Check if manga exists
    const manga = await prisma.comics.findUnique({
      where: { id: mangaId },
      select: { id: true, title: true, slug: true },
    });

    if (!manga) {
      return NextResponse.json(
        {
          success: false,
          error: 'Manga not found',
        },
        { status: 404 }
      );
    }

    // Delete manga (cascade will handle related records)
    await prisma.comics.delete({
      where: { id: mangaId },
    });

    // Log admin action
    await logAdminAction(
      parseInt(user.id),
      'DELETE_MANGA',
      'manga',
      mangaId,
      { title: manga.title, slug: manga.slug },
      request
    );

    return NextResponse.json({
      success: true,
      message: 'Manga deleted successfully',
    });
  } catch (error) {
    console.error('[ADMIN_MANGA_DELETE_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete manga',
      },
      { status: 500 }
    );
  }
}

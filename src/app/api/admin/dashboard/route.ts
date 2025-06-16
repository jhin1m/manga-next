import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin/middleware';
import { AdminRole, DashboardStats } from '@/types/admin';
import { prisma } from '@/lib/db';

/**
 * GET /api/admin/dashboard
 * Get dashboard statistics and overview data
 */
export async function GET(request: Request) {
  try {
    // Check admin authentication
    const authResult = await requireAdminAuth(request, AdminRole.MODERATOR);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get user statistics
    const [totalUsers, activeUsers, bannedUsers, newUsersToday, newUsersThisWeek] =
      await Promise.all([
        prisma.users.count(),
        prisma.users.count({
          where: {
            updated_at: {
              gte: weekAgo,
            },
          },
        }),
        prisma.users.count({
          where: {
            role: 'banned',
          },
        }),
        prisma.users.count({
          where: {
            created_at: {
              gte: today,
            },
          },
        }),
        prisma.users.count({
          where: {
            created_at: {
              gte: weekAgo,
            },
          },
        }),
      ]);

    // Get manga statistics
    const [totalManga, publishedManga, pendingManga, draftManga, newMangaToday] = await Promise.all(
      [
        prisma.comics.count(),
        prisma.comics.count({
          where: {
            status: 'published',
          },
        }),
        prisma.comics.count({
          where: {
            status: 'pending',
          },
        }),
        prisma.comics.count({
          where: {
            status: 'draft',
          },
        }),
        prisma.comics.count({
          where: {
            created_at: {
              gte: today,
            },
          },
        }),
      ]
    );

    // Get chapter statistics
    const [totalChapters, newChaptersToday, newChaptersThisWeek] = await Promise.all([
      prisma.chapters.count(),
      prisma.chapters.count({
        where: {
          created_at: {
            gte: today,
          },
        },
      }),
      prisma.chapters.count({
        where: {
          created_at: {
            gte: weekAgo,
          },
        },
      }),
    ]);

    // Get comment statistics
    const [totalComments, pendingComments, flaggedComments, newCommentsToday] = await Promise.all([
      prisma.comments.count(),
      prisma.comments.count({
        where: {
          status: 'PENDING',
        },
      }),
      prisma.comments.count({
        where: {
          status: 'FLAGGED',
        },
      }),
      prisma.comments.count({
        where: {
          created_at: {
            gte: today,
          },
        },
      }),
    ]);

    // Get report statistics
    const [totalReports, pendingReports, resolvedReports, newReportsToday] = await Promise.all([
      prisma.chapterReport.count(),
      prisma.chapterReport.count({
        where: {
          status: 'pending',
        },
      }),
      prisma.chapterReport.count({
        where: {
          status: 'resolved',
        },
      }),
      prisma.chapterReport.count({
        where: {
          created_at: {
            gte: today,
          },
        },
      }),
    ]);

    // Get view statistics
    const [viewsToday, viewsThisWeek, viewsThisMonth] = await Promise.all([
      prisma.comic_Views.count({
        where: {
          viewed_at: {
            gte: today,
          },
        },
      }),
      prisma.comic_Views.count({
        where: {
          viewed_at: {
            gte: weekAgo,
          },
        },
      }),
      prisma.comic_Views.count({
        where: {
          viewed_at: {
            gte: monthAgo,
          },
        },
      }),
    ]);

    // Build dashboard statistics
    const stats: DashboardStats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        banned: bannedUsers,
        newToday: newUsersToday,
        newThisWeek: newUsersThisWeek,
      },
      manga: {
        total: totalManga,
        published: publishedManga,
        pending: pendingManga,
        draft: draftManga,
        newToday: newMangaToday,
      },
      chapters: {
        total: totalChapters,
        newToday: newChaptersToday,
        newThisWeek: newChaptersThisWeek,
      },
      comments: {
        total: totalComments,
        pending: pendingComments,
        flagged: flaggedComments,
        newToday: newCommentsToday,
      },
      reports: {
        total: totalReports,
        pending: pendingReports,
        resolved: resolvedReports,
        newToday: newReportsToday,
      },
      views: {
        totalToday: viewsToday,
        totalThisWeek: viewsThisWeek,
        totalThisMonth: viewsThisMonth,
      },
    };

    // Get recent activities (last 10 items)
    const recentActivities = await Promise.all([
      // Recent users
      prisma.users.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          created_at: true,
        },
      }),

      // Recent manga
      prisma.comics.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          created_at: true,
        },
      }),

      // Recent comments
      prisma.comments.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        include: {
          Users: {
            select: {
              username: true,
            },
          },
          Comics: {
            select: {
              title: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats,
        recentActivities: {
          users: recentActivities[0],
          manga: recentActivities[1],
          comments: recentActivities[2],
        },
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[ADMIN_DASHBOARD_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard data',
      },
      { status: 500 }
    );
  }
}

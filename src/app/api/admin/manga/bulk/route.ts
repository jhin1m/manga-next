import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminAuth, logAdminAction, AdminPermissions } from '@/lib/admin/middleware'
import { AdminRole, bulkOperationSchema, BulkAction } from '@/types/admin'
import { prisma } from '@/lib/db'

/**
 * POST /api/admin/manga/bulk
 * Perform bulk operations on manga
 */
export async function POST(request: Request) {
  try {
    // Check admin authentication
    const authResult = await requireAdminAuth(request, AdminRole.EDITOR)
    if (authResult instanceof NextResponse) {
      return authResult
    }
    const { user } = authResult
    const body = await request.json()
    const validatedData = bulkOperationSchema.parse(body)

    const { action, ids, reason } = validatedData
    const permissions = new AdminPermissions(user.role)

    // Check permissions based on action
    switch (action) {
      case BulkAction.DELETE:
        if (!permissions.canDeleteManga()) {
          return NextResponse.json(
            { 
              success: false,
              error: 'Insufficient permissions to delete manga' 
            },
            { status: 403 }
          )
        }
        break
      case BulkAction.APPROVE:
      case BulkAction.REJECT:
      case BulkAction.PUBLISH:
      case BulkAction.ARCHIVE:
        if (!permissions.canManageManga()) {
          return NextResponse.json(
            { 
              success: false,
              error: 'Insufficient permissions to manage manga' 
            },
            { status: 403 }
          )
        }
        break
      default:
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid bulk action' 
          },
          { status: 400 }
        )
    }

    // Verify all manga exist
    const existingManga = await prisma.comics.findMany({
      where: { id: { in: ids } },
      select: { id: true, title: true, slug: true, status: true }
    })

    if (existingManga.length !== ids.length) {
      const foundIds = existingManga.map(m => m.id)
      const missingIds = ids.filter(id => !foundIds.includes(id))
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Some manga not found',
          details: { missingIds }
        },
        { status: 404 }
      )
    }

    let processed = 0
    let failed = 0
    const errors: Array<{ id: number; error: string }> = []

    // Perform bulk operation
    try {
      switch (action) {
        case BulkAction.DELETE:
          await prisma.comics.deleteMany({
            where: { id: { in: ids } }
          })
          processed = ids.length
          break

        case BulkAction.APPROVE:
          await prisma.comics.updateMany({
            where: { id: { in: ids } },
            data: {
              status: 'published',
              release_date: new Date(),
              updated_at: new Date()
            }
          })
          processed = ids.length
          break

        case BulkAction.REJECT:
          await prisma.comics.updateMany({
            where: { id: { in: ids } },
            data: { 
              status: 'rejected',
              updated_at: new Date()
            }
          })
          processed = ids.length
          break

        case BulkAction.PUBLISH:
          await prisma.comics.updateMany({
            where: {
              id: { in: ids },
              status: { in: ['draft', 'pending'] }
            },
            data: {
              status: 'published',
              release_date: new Date(),
              updated_at: new Date()
            }
          })
          processed = ids.length
          break

        case BulkAction.ARCHIVE:
          await prisma.comics.updateMany({
            where: { id: { in: ids } },
            data: { 
              status: 'archived',
              updated_at: new Date()
            }
          })
          processed = ids.length
          break

        default:
          throw new Error('Unsupported bulk action')
      }
    } catch (error) {
      console.error('[BULK_OPERATION_ERROR]', error)
      failed = ids.length
      errors.push(...ids.map(id => ({ id, error: 'Operation failed' })))
    }

    // Log admin action
    await logAdminAction(
      parseInt(user.id),
      `BULK_${action.toUpperCase()}_MANGA`,
      'manga',
      undefined,
      { 
        action,
        ids,
        reason,
        processed,
        failed,
        mangaTitles: existingManga.map(m => m.title)
      },
      request
    )

    return NextResponse.json({
      success: processed > 0,
      processed,
      failed,
      errors: errors.length > 0 ? errors : undefined,
      message: `Bulk ${action} completed. ${processed} processed, ${failed} failed.`
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

    console.error('[ADMIN_MANGA_BULK_ERROR]', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to perform bulk operation' 
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/manga/bulk
 * Get available bulk operations and their requirements
 */
export async function GET(request: Request) {
  try {
    // Check admin authentication
    const authResult = await requireAdminAuth(request, AdminRole.EDITOR)
    if (authResult instanceof NextResponse) {
      return authResult
    }
    const { user } = authResult

    const permissions = new AdminPermissions(user.role)

    const availableActions = []

    if (permissions.canManageManga()) {
      availableActions.push(
        { action: 'approve', label: 'Approve', description: 'Approve and publish manga' },
        { action: 'reject', label: 'Reject', description: 'Reject manga submissions' },
        { action: 'publish', label: 'Publish', description: 'Publish draft/pending manga' },
        { action: 'archive', label: 'Archive', description: 'Archive manga' }
      )
    }

    if (permissions.canDeleteManga()) {
      availableActions.push(
        { action: 'delete', label: 'Delete', description: 'Permanently delete manga', requiresConfirmation: true }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        availableActions,
        maxBatchSize: 100,
        supportedActions: Object.values(BulkAction)
      }
    })

  } catch (error) {
    console.error('[ADMIN_MANGA_BULK_INFO_ERROR]', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch bulk operation info' 
      },
      { status: 500 }
    )
  }
}

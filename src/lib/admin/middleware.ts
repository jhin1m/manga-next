import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AdminRole } from '@/types/admin'

/**
 * Admin authentication middleware
 * Checks if user is authenticated and has admin privileges
 */
export async function requireAdmin(
  _request: Request,
  requiredRole: AdminRole = AdminRole.ADMIN
): Promise<{ session: any; user: any } | NextResponse> {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user has admin role
    if (!isAdminRole(session.user.role)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Check if user has sufficient role level
    if (!hasRequiredRole(session.user.role, requiredRole)) {
      return NextResponse.json(
        { error: `${requiredRole} role required` },
        { status: 403 }
      )
    }

    return { session, user: session.user }
  } catch (error) {
    console.error('[ADMIN_MIDDLEWARE_ERROR]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Check if a role is an admin role
 */
export function isAdminRole(role: string): boolean {
  const adminRoles = [
    AdminRole.SUPER_ADMIN,
    AdminRole.ADMIN,
    AdminRole.MODERATOR,
    AdminRole.EDITOR
  ]
  return adminRoles.includes(role as AdminRole)
}

/**
 * Check if user has required role level
 * Role hierarchy: super_admin > admin > moderator > editor > user
 */
export function hasRequiredRole(userRole: string, requiredRole: AdminRole): boolean {
  const roleHierarchy = {
    [AdminRole.SUPER_ADMIN]: 5,
    [AdminRole.ADMIN]: 4,
    [AdminRole.MODERATOR]: 3,
    [AdminRole.EDITOR]: 2,
    'user': 1
  }

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
  const requiredLevel = roleHierarchy[requiredRole] || 0

  return userLevel >= requiredLevel
}

/**
 * Admin route wrapper that handles authentication and error handling
 * Compatible with NextJS 15 route handlers
 */
export function withAdminAuth(
  handler: (request: Request, context: { session: any; user: any; params?: any }) => Promise<Response>,
  requiredRole: AdminRole = AdminRole.ADMIN
) {
  return async (request: Request, routeContext?: { params?: Promise<any> }) => {
    try {
      const authResult = await requireAdmin(request, requiredRole)

      if (authResult instanceof NextResponse) {
        return authResult
      }

      // Resolve params if they exist and are a Promise
      let resolvedParams: any = undefined
      if (routeContext?.params) {
        resolvedParams = await routeContext.params
      }

      return await handler(request, {
        ...authResult,
        params: resolvedParams
      })
    } catch (error) {
      console.error('[ADMIN_ROUTE_ERROR]', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Simple admin authentication check for use in route handlers
 * Returns the authenticated user or returns an error response
 */
export async function requireAdminAuth(
  request: Request,
  requiredRole: AdminRole = AdminRole.ADMIN
): Promise<{ session: any; user: any } | NextResponse> {
  return await requireAdmin(request, requiredRole)
}

/**
 * Permission checker for specific actions
 */
export class AdminPermissions {
  private userRole: string

  constructor(userRole: string) {
    this.userRole = userRole
  }

  // User management permissions
  canManageUsers(): boolean {
    return hasRequiredRole(this.userRole, AdminRole.ADMIN)
  }

  canBanUsers(): boolean {
    return hasRequiredRole(this.userRole, AdminRole.MODERATOR)
  }

  canDeleteUsers(): boolean {
    return hasRequiredRole(this.userRole, AdminRole.ADMIN)
  }

  canChangeUserRoles(): boolean {
    return hasRequiredRole(this.userRole, AdminRole.SUPER_ADMIN)
  }

  // Content management permissions
  canManageManga(): boolean {
    return hasRequiredRole(this.userRole, AdminRole.EDITOR)
  }

  canDeleteManga(): boolean {
    return hasRequiredRole(this.userRole, AdminRole.ADMIN)
  }

  canManageChapters(): boolean {
    return hasRequiredRole(this.userRole, AdminRole.EDITOR)
  }

  canDeleteChapters(): boolean {
    return hasRequiredRole(this.userRole, AdminRole.ADMIN)
  }

  // Moderation permissions
  canModerateComments(): boolean {
    return hasRequiredRole(this.userRole, AdminRole.MODERATOR)
  }

  canHandleReports(): boolean {
    return hasRequiredRole(this.userRole, AdminRole.MODERATOR)
  }

  // System management permissions
  canManageSystem(): boolean {
    return hasRequiredRole(this.userRole, AdminRole.SUPER_ADMIN)
  }

  canAccessAnalytics(): boolean {
    return hasRequiredRole(this.userRole, AdminRole.ADMIN)
  }

  canManageCache(): boolean {
    return hasRequiredRole(this.userRole, AdminRole.ADMIN)
  }

  canPerformMaintenance(): boolean {
    return hasRequiredRole(this.userRole, AdminRole.SUPER_ADMIN)
  }

  // File management permissions
  canUploadFiles(): boolean {
    return hasRequiredRole(this.userRole, AdminRole.EDITOR)
  }

  canDeleteFiles(): boolean {
    return hasRequiredRole(this.userRole, AdminRole.ADMIN)
  }
}

/**
 * Rate limiting for admin actions
 */
export class AdminRateLimit {
  private static attempts = new Map<string, { count: number; resetTime: number }>()

  static checkLimit(
    identifier: string,
    maxAttempts: number = 10,
    windowMs: number = 15 * 60 * 1000 // 15 minutes
  ): boolean {
    const now = Date.now()
    const key = `admin_${identifier}`
    const attempt = this.attempts.get(key)

    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs })
      return true
    }

    if (attempt.count >= maxAttempts) {
      return false
    }

    attempt.count++
    return true
  }

  static resetLimit(identifier: string): void {
    const key = `admin_${identifier}`
    this.attempts.delete(key)
  }
}

/**
 * Audit logging for admin actions
 */
export interface AdminAuditLog {
  id?: number
  admin_id: number
  action: string
  resource_type: string
  resource_id?: number
  details?: any
  ip_address?: string
  user_agent?: string
  created_at: Date
}

export async function logAdminAction(
  adminId: number,
  action: string,
  resourceType: string,
  resourceId?: number,
  details?: any,
  request?: Request
): Promise<void> {
  try {
    // In a real implementation, you would save this to a database
    // For now, we'll just log to console
    const logEntry: AdminAuditLog = {
      admin_id: adminId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details,
      ip_address: request?.headers.get('x-forwarded-for') || 
                  request?.headers.get('x-real-ip') || 
                  'unknown',
      user_agent: request?.headers.get('user-agent') || 'unknown',
      created_at: new Date()
    }

    console.log('[ADMIN_AUDIT]', JSON.stringify(logEntry, null, 2))
    
    // TODO: Implement database logging
    // await prisma.adminAuditLog.create({ data: logEntry })
  } catch (error) {
    console.error('[ADMIN_AUDIT_ERROR]', error)
  }
}

/**
 * Utility function to extract pagination parameters
 */
export function extractPaginationParams(url: string) {
  const searchParams = new URL(url).searchParams
  
  return {
    page: Math.max(1, parseInt(searchParams.get('page') || '1')),
    limit: Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20'))),
    sort: searchParams.get('sort') || 'created_at',
    order: searchParams.get('order') === 'asc' ? 'asc' : 'desc',
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || undefined,
    role: searchParams.get('role') || undefined
  }
}

/**
 * Utility function to build pagination response
 */
export function buildPaginationResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  }
}

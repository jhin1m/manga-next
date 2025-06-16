import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAdminAction, isAdminRole } from '@/lib/admin/middleware';

/**
 * POST /api/admin/auth/logout
 * Admin logout endpoint with audit logging
 */
export async function POST(request: Request) {
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

    // Log admin logout
    await logAdminAction(
      parseInt(session.user.id),
      'ADMIN_LOGOUT',
      'auth',
      undefined,
      { email: session.user.email },
      request
    );

    return NextResponse.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('[ADMIN_LOGOUT_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/auth/logout
 * Get logout confirmation
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Logout endpoint ready',
  });
}

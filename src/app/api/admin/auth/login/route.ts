import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/db';
import { adminLoginSchema } from '@/types/admin';
import { AdminRateLimit, logAdminAction, isAdminRole } from '@/lib/admin/middleware';

/**
 * POST /api/admin/auth/login
 * Admin login endpoint with enhanced security
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const clientIp =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Rate limiting check
    if (!AdminRateLimit.checkLimit(`login_${clientIp}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many login attempts. Please try again later.',
        },
        { status: 429 }
      );
    }

    // Validate request body
    const validatedData = adminLoginSchema.parse(body);

    // Find user by email
    const user = await prisma.users.findUnique({
      where: { email: validatedData.email },
      select: {
        id: true,
        username: true,
        email: true,
        password_hash: true,
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
          error: 'Invalid credentials',
        },
        { status: 401 }
      );
    }

    // Check if user has admin role
    if (!isAdminRole(user.role)) {
      await logAdminAction(
        user.id,
        'UNAUTHORIZED_LOGIN_ATTEMPT',
        'auth',
        undefined,
        { email: validatedData.email, role: user.role },
        request
      );

      return NextResponse.json(
        {
          success: false,
          error: 'Access denied. Admin privileges required.',
        },
        { status: 403 }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(validatedData.password, user.password_hash);

    if (!passwordMatch) {
      await logAdminAction(
        user.id,
        'FAILED_LOGIN_ATTEMPT',
        'auth',
        undefined,
        { email: validatedData.email },
        request
      );

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid credentials',
        },
        { status: 401 }
      );
    }

    // Reset rate limit on successful login
    AdminRateLimit.resetLimit(`login_${clientIp}`);

    // Update last login timestamp
    await prisma.users.update({
      where: { id: user.id },
      data: { updated_at: new Date() },
    });

    // Log successful login
    await logAdminAction(
      user.id,
      'ADMIN_LOGIN',
      'auth',
      undefined,
      { email: validatedData.email },
      request
    );

    // Return user data (password excluded)
    const { password_hash: _password_hash, ...userData } = user;

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userData,
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

    console.error('[ADMIN_LOGIN_ERROR]', error);
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
 * GET /api/admin/auth/login
 * Get login form configuration
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      title: 'Admin Login',
      description: 'Sign in to access the admin dashboard',
      features: ['Rate limiting protection', 'Audit logging', 'Role-based access control'],
    },
  });
}

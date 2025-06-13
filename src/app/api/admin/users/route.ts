import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { requireAdminAuth, extractPaginationParams, buildPaginationResponse, logAdminAction } from '@/lib/admin/middleware'
import { AdminRole, userCreateSchema } from '@/types/admin'
import { prisma } from '@/lib/db'

/**
 * GET /api/admin/users
 * Get users list with admin details and filters
 */
export async function GET(request: Request) {
  try {
    // Check admin authentication
    const authResult = await requireAdminAuth(request, AdminRole.ADMIN)
    if (authResult instanceof NextResponse) {
      return authResult
    }
    const { page, limit, sort, order, search, role, status: _status } = extractPaginationParams(request.url)

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (role) {
      where.role = role
    }

    // Build order by clause
    const orderBy: any = {}
    if (sort === 'username') {
      orderBy.username = order
    } else if (sort === 'email') {
      orderBy.email = order
    } else if (sort === 'role') {
      orderBy.role = order
    } else {
      orderBy.created_at = order
    }

    // Get users with pagination
    const [users, totalCount] = await Promise.all([
      prisma.users.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          avatar_url: true,
          created_at: true,
          updated_at: true,
          _count: {
            select: {
              Comments: true,
              Favorites: true,
              Ratings: true,
              ChapterReports: true,
              Chapter_Views: true
            }
          }
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.users.count({ where })
    ])

    // Transform data to include statistics
    const transformedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
      updated_at: user.updated_at,
      stats: {
        commentsCount: user._count.Comments,
        favoritesCount: user._count.Favorites,
        ratingsCount: user._count.Ratings,
        reportsCount: user._count.ChapterReports,
        chaptersRead: user._count.Chapter_Views
      }
    }))

    return NextResponse.json({
      success: true,
      ...buildPaginationResponse(transformedUsers, totalCount, page, limit)
    })

  } catch (error) {
    console.error('[ADMIN_USERS_LIST_ERROR]', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch users list' 
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/users
 * Create new user
 */
export async function POST(request: Request) {
  try {
    // Check admin authentication
    const authResult = await requireAdminAuth(request, AdminRole.ADMIN)
    if (authResult instanceof NextResponse) {
      return authResult
    }
    const { user } = authResult
    const body = await request.json()
    const validatedData = userCreateSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false,
          error: 'User with this email or username already exists' 
        },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create user
    const newUser = await prisma.users.create({
      data: {
        username: validatedData.username,
        email: validatedData.email,
        password_hash: hashedPassword,
        role: validatedData.role,
        avatar_url: validatedData.avatar_url,
        created_at: new Date(),
        updated_at: new Date()
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatar_url: true,
        created_at: true,
        updated_at: true
      }
    })

    // Log admin action
    await logAdminAction(
      parseInt(user.id),
      'CREATE_USER',
      'user',
      newUser.id,
      { 
        username: newUser.username, 
        email: newUser.email,
        role: newUser.role 
      },
      request
    )

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: newUser
    }, { status: 201 })

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

    console.error('[ADMIN_USER_CREATE_ERROR]', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create user' 
      },
      { status: 500 }
    )
  }
}

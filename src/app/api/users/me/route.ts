import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Profile update validation schema
const profileUpdateSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
});

// Get current user profile
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { id: parseInt(session.user.id) },
      select: {
        id: true,
        username: true,
        email: true,
        avatar_url: true,
        role: true,
        created_at: true,
        updated_at: true,
        // Include related data as needed
        Favorites: {
          include: {
            Comics: {
              select: {
                id: true,
                title: true,
                slug: true,
                cover_image_url: true,
              },
            },
          },
        },
        Reading_Progress: {
          include: {
            Comics: {
              select: {
                id: true,
                title: true,
                slug: true,
                cover_image_url: true,
              },
            },
            Chapters: {
              select: {
                id: true,
                title: true,
                chapter_number: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
}

// Update current user profile
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = profileUpdateSchema.parse(body);

    // Check if username is taken (if updating username)
    if (validatedData.username) {
      const existingUser = await prisma.users.findFirst({
        where: {
          username: validatedData.username,
          id: { not: parseInt(session.user.id) },
        },
      });

      if (existingUser) {
        return NextResponse.json({ error: 'Username is already taken' }, { status: 409 });
      }
    }

    // Update user profile
    const updatedUser = await prisma.users.update({
      where: { id: parseInt(session.user.id) },
      data: {
        ...validatedData,
        updated_at: new Date(),
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar_url: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
  }
}

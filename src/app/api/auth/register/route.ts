import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/db';

// Define validation schema for API (confirmPassword validation is done on frontend)
const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [{ email: validatedData.email }, { username: validatedData.username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create new user
    const newUser = await prisma.users.create({
      data: {
        username: validatedData.username,
        email: validatedData.email,
        password_hash: hashedPassword,
        role: 'user',
      },
    });

    // Return success response (exclude password)
    const { password_hash, ...userWithoutPassword } = newUser;
    return NextResponse.json(
      { message: 'User registered successfully', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Return user-friendly validation errors
      const errorMessages = error.errors.map(err => err.message).join(', ');
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: errorMessages,
          validationErrors: error.errors,
        },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: 'Something went wrong during registration',
      },
      { status: 500 }
    );
  }
}

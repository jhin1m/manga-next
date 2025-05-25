const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email: 'test@example.com' }
    })

    if (existingUser) {
      console.log('Test user already exists:', existingUser)
      return existingUser
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 12)

    // Create test user
    const testUser = await prisma.users.create({
      data: {
        username: 'testuser',
        email: 'test@example.com',
        password_hash: hashedPassword,
        role: 'user',
      },
    })

    console.log('Test user created:', testUser)
    return testUser
  } catch (error) {
    console.error('Error creating test user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()

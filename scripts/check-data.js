const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkData() {
  try {
    // Check users
    const users = await prisma.users.findMany({
      select: { id: true, username: true, email: true }
    })
    console.log('Users in database:', users)

    // Check comics
    const comics = await prisma.comics.findMany({
      select: { id: true, title: true, slug: true },
      take: 5
    })
    console.log('Comics in database (first 5):', comics)

    // Check comments
    const comments = await prisma.comments.findMany({
      select: { id: true, content: true, user_id: true, comic_id: true },
      take: 5
    })
    console.log('Comments in database (first 5):', comments)

  } catch (error) {
    console.error('Error checking data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkData()

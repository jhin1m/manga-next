import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? [
          {
            emit: 'event',
            level: 'query',
          },
          'error',
          'warn'
        ] as any
      : ['error'],
  })

// Slow query monitoring in development
if (process.env.NODE_ENV === 'development') {
  (prisma as any).$on('query', (e: any) => {
    const duration = e.duration
    const query = e.query
    const params = e.params

    // Log slow queries (>100ms)
    if (duration > 100) {
      console.log('🐌 SLOW QUERY DETECTED:')
      console.log(`⏱️  Duration: ${duration}ms`)
      console.log(`📝 Query: ${query}`)
      console.log(`🔧 Params: ${params}`)
      console.log('─'.repeat(50))
    } else if (duration > 50) {
      console.log(`⚠️  Medium query: ${duration}ms - ${query.substring(0, 150)}...`)
    } else {
      console.log(`✅ Fast query: ${duration}ms - ${query.substring(0, 30)}...`)
    }
  })
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

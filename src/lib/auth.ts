import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/db'
import type { AuthOptions } from 'next-auth'

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        emailOrUsername: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.emailOrUsername || !credentials?.password) {
          return null
        }

        // Check if input is email or username
        const isEmail = credentials.emailOrUsername.includes('@')

        const user = await prisma.users.findFirst({
          where: isEmail
            ? { email: credentials.emailOrUsername }
            : { username: credentials.emailOrUsername }
        })

        if (!user || !user.password_hash) {
          return null
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password_hash
        )

        if (!passwordMatch) {
          return null
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.username,
          image: user.avatar_url,
          role: user.role,
        }
      },
    }),
    // Add OAuth providers here if needed
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Add custom properties to the token
      if (user) {
        token.id = user.id
        token.role = user.role
        token.picture = user.image
      }

      // Handle session updates (when update() is called)
      if (trigger === 'update' && session?.user) {
        token.picture = session.user.image
        token.name = session.user.name
      }

      return token
    },
    async session({ session, token }) {
      // Add custom properties to the session
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.image = token.picture as string
      }
      return session
    },
  },
}

export default NextAuth(authOptions)

export const { auth, signIn, signOut } = NextAuth(authOptions)

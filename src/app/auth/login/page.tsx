import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your account',
}

export default async function LoginPage() {
  // Check if user is already logged in
  const session = await getServerSession(authOptions)

  if (session?.user) {
    redirect('/')
  }

  return (
    <div className="container max-w-screen-sm py-10">
      <LoginForm />
    </div>
  )
}

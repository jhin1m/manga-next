import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Separator } from '@/components/ui/separator'
import { ProfileForm } from '@/components/profile/profile-form'
import { PasswordForm } from '@/components/profile/password-form'

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your account settings',
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/profile/settings')
  }

  const user = await prisma.users.findUnique({
    where: { id: parseInt(session.user.id) },
    select: {
      id: true,
      username: true,
      email: true,
      avatar_url: true,
    }
  })

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <Separator />

        <div className="grid gap-10">
          <ProfileForm user={user} />
          <Separator />
          <PasswordForm />
        </div>
      </div>
    </div>
  )
}

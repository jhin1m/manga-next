import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import FavoritesGrid from '@/components/profile/favorites-grid'
import ReadingHistoryList from '@/components/profile/reading-history-list'
import NotificationsList from '@/components/profile/notifications-list'

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Manage your account',
}

interface ProfilePageProps {
  searchParams: Promise<{
    tab?: string
  }>
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const session = await getServerSession(authOptions)
  const searchParamsData = await searchParams
  const activeTab = searchParamsData.tab || 'favorites'

  if (!session || !session.user || !session.user.id) {
    redirect('/auth/login?callbackUrl=/profile')
  }

  const user = await prisma.users.findUnique({
    where: { id: parseInt(session.user.id as string) },
    include: {
      Favorites: {
        include: {
          Comics: {
            select: {
              id: true,
              title: true,
              slug: true,
              cover_image_url: true,
              status: true,
              Chapters: {
                orderBy: {
                  chapter_number: 'desc',
                },
                take: 1,
                select: {
                  id: true,
                  chapter_number: true,
                  title: true,
                  slug: true,
                  release_date: true,
                },
              },
            }
          }
        },
        orderBy: {
          created_at: 'desc',
        }
      },
      Reading_Progress: {
        include: {
          Comics: {
            select: {
              id: true,
              title: true,
              slug: true,
              cover_image_url: true,
            }
          },
          Chapters: {
            select: {
              id: true,
              title: true,
              chapter_number: true,
              slug: true,
            }
          }
        },
        orderBy: {
          updated_at: 'desc'
        },
        take: 10
      }
    }
  })

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
            <AvatarFallback className="text-2xl font-bold">
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{user.username}</h1>
            <p className="text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground">
              Member since {new Date(user.created_at!).toLocaleDateString()}
            </p>
            <div className="mt-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/profile/settings">Edit Profile</Link>
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue={activeTab} className="w-full">
          <TabsList>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="history">Reading History</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          <TabsContent value="favorites" className="mt-4">
            {user.Favorites.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No favorites yet</CardTitle>
                  <CardDescription>
                    You haven't added any manga to your favorites yet.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <FavoritesGrid favorites={user.Favorites} />
            )}
          </TabsContent>
          <TabsContent value="history" className="mt-4">
            <ReadingHistoryList initialProgress={user.Reading_Progress} />
          </TabsContent>
          <TabsContent value="notifications" className="mt-4">
            <NotificationsList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { LogOut, Settings, User as UserIcon, Heart, History, Languages } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { useTransition } from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { locales, localeNames } from '@/i18n/config'
import { toast } from 'sonner'

// Flag mapping for each locale
const flagEmojis = {
  en: '🇺🇸', // US flag for English
  vi: '🇻🇳', // Vietnam flag for Vietnamese
} as const;

export function UserMenu() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const t = useTranslations('navigation')
  const tAuth = useTranslations('auth')
  const locale = useLocale()
  const [isPending, startTransition] = useTransition()

  if (!session?.user) {
    return null
  }

  const user = session.user

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut({ redirect: false })
      toast.success(tAuth('logoutSuccess'))
      router.push('/')
      router.refresh()
    } catch (error) {
      toast.error(tAuth('logoutError'))
      console.error('Sign out error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLocaleChange = (newLocale: string) => {
    startTransition(() => {
      // Set cookie để lưu locale
      document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;
      window.location.reload();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8" key={user.image || 'no-avatar'}>
            <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
            <AvatarFallback>
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.name && <p className="font-medium">{user.name}</p>}
            {user.email && (
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <UserIcon className="mr-2 h-4 w-4" />
            <span>{t('profile')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile?tab=favorites" className="cursor-pointer">
            <Heart className="mr-2 h-4 w-4" />
            <span>{t('myFavorites')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile?tab=history" className="cursor-pointer">
            <History className="mr-2 h-4 w-4" />
            <span>{t('history')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>{t('settings')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Languages className="mr-2 h-4 w-4" />
            <span>Language</span>
            <span className="ml-auto">{flagEmojis[locale as keyof typeof flagEmojis]}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {locales.map((loc) => (
              <DropdownMenuItem
                key={loc}
                onClick={() => handleLocaleChange(loc)}
                className={locale === loc ? 'bg-accent' : ''}
                disabled={isPending}
              >
                <span className="mr-2">{flagEmojis[loc]}</span>
                {localeNames[loc]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          disabled={isLoading}
          onSelect={(e) => {
            e.preventDefault()
            handleSignOut()
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoading ? tAuth('signingOut') : tAuth('logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

'use client';

import Link from 'next/link';
import { Menu, User, Heart } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { SearchButton, DesktopSearchButton } from '@/components/feature/SearchBar';
import { Home, Clock } from 'lucide-react';
import { UserMenu } from '@/components/layout/user-menu';
import { useSession } from 'next-auth/react';
import { GenreDropdown, MobileGenreDropdown } from '@/components/feature/GenreDropdown';

export default function Header() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  return (
    <header className='border-b border-border/40 bg-background/95 backdrop-blur-sm top-0 z-50'>
      <div className='container mx-auto px-4 py-3'>
        <div className='flex justify-between items-center sm:px-14 2xl:px-44'>
          <Link href='/' className='text-xl font-bold'>
            Manga Next
          </Link>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center space-x-6'>
            <Link
              href='/'
              className='text-sm font-medium transition-colors hover:text-primary'
            >
              Home
            </Link>
            <Link
              href='/manga'
              className='text-sm font-medium transition-colors hover:text-primary'
            >
              Latest
            </Link>

            <GenreDropdown />
            <DesktopSearchButton />
            {isAuthenticated && session?.user ? (
              <UserMenu />
            ) : (
              <Button variant="ghost" size="icon" className="text-foreground" asChild>
                <Link href="/auth/login">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )}
            <ThemeToggle />
          </nav>

          {/* Mobile Navigation */}
          <div className='md:hidden flex items-center gap-2'>
            <SearchButton />
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col divide-y divide-border/40 mt-6 mx-2">
                  <Link
                    href='/'
                    className='flex items-center py-3 px-4 -mx-4 text-base font-medium transition-colors hover:bg-accent hover:text-primary rounded-lg'
                  >
                    <Home className="mr-3 h-5 w-5" />
                    Home
                  </Link>
                  <Link
                    href='/manga'
                    className='flex items-center py-3 px-4 -mx-4 text-base font-medium transition-colors hover:bg-accent hover:text-primary rounded-lg'
                  >
                    <Clock className="mr-3 h-5 w-5" />
                    Latest
                  </Link>
                  <MobileGenreDropdown />
                  {isAuthenticated && session?.user ? (
                    <>
                      <Link
                        href='/profile'
                        className='flex items-center py-3 px-4 -mx-4 text-base font-medium transition-colors hover:bg-accent hover:text-primary rounded-lg'
                      >
                        <User className="mr-3 h-5 w-5" />
                        Profile
                      </Link>
                      <Link
                        href='/profile?tab=favorites'
                        className='flex items-center py-3 px-4 -mx-4 text-base font-medium transition-colors hover:bg-accent hover:text-primary rounded-lg'
                      >
                        <Heart className="mr-3 h-5 w-5" />
                        My Favorites
                      </Link>
                    </>
                  ) : (
                    <Link
                      href='/auth/login'
                      className='flex items-center py-3 px-4 -mx-4 text-base font-medium transition-colors hover:bg-accent hover:text-primary rounded-lg'
                    >
                      <User className="mr-3 h-5 w-5" />
                      Login
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

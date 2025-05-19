'use client';

import Link from 'next/link';
import { Menu, User } from 'lucide-react';
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
import { Home, Clock, LayoutGrid } from 'lucide-react';

export default function Header() {
  return (
    <header className='border-b border-border/40 bg-background/95 backdrop-blur-sm top-0 z-50'>
      <div className='container mx-auto px-4 py-3'>
        <div className='flex justify-between items-center sm:px-24'>
          <Link href='/' className='text-xl font-bold'>
            Dokinaw
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

            <Link
              href='/genres'
              className='text-sm font-medium transition-colors hover:text-primary'
            >
              Genres
            </Link>
            <DesktopSearchButton />
            <Button variant="ghost" size="icon" className="text-foreground">
              <User className="h-5 w-5" />
            </Button>
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
                  <Link
                    href='/genres'
                    className='flex items-center py-3 px-4 -mx-4 text-base font-medium transition-colors hover:bg-accent hover:text-primary rounded-lg'
                  >
                    <LayoutGrid className="mr-3 h-5 w-5" />
                    Genres
                  </Link>
                  <Link
                    href='/account'
                    className='flex items-center py-3 px-4 -mx-4 text-base font-medium transition-colors hover:bg-accent hover:text-primary rounded-lg'
                  >
                    <User className="mr-3 h-5 w-5" />
                    Account
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, Search, User } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function Header() {
  return (
    <header className='border-b border-border/40 bg-background/95 backdrop-blur-sm sticky top-0 z-50'>
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
              href='/popular'
              className='text-sm font-medium transition-colors hover:text-primary'
            >
              Popular
            </Link>
            <Link
              href='/completed'
              className='text-sm font-medium transition-colors hover:text-primary'
            >
              Completed
            </Link>
            <Link
              href='/genres'
              className='text-sm font-medium transition-colors hover:text-primary'
            >
              Genres
            </Link>
            <Button variant="ghost" size="icon" className="text-foreground">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-foreground">
              <User className="h-5 w-5" />
            </Button>
            <ThemeToggle />
          </nav>

          {/* Mobile Navigation */}
          <div className='md:hidden flex items-center gap-2'>
            <Button variant="ghost" size="icon" className="text-foreground">
              <Search className="h-5 w-5" />
            </Button>
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col gap-4 mt-8">
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
                    href='/popular'
                    className='text-sm font-medium transition-colors hover:text-primary'
                  >
                    Popular
                  </Link>
                  <Link
                    href='/completed'
                    className='text-sm font-medium transition-colors hover:text-primary'
                  >
                    Completed
                  </Link>
                  <Link
                    href='/genres'
                    className='text-sm font-medium transition-colors hover:text-primary'
                  >
                    Genres
                  </Link>
                  <Link
                    href='/account'
                    className='text-sm font-medium transition-colors hover:text-primary'
                  >
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

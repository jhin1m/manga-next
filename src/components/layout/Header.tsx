'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function Header() {
  return (
    <header className='border-b bg-background'>
      <div className='container mx-auto px-4 py-4'>
        <div className='flex justify-between items-center'>
          <Link href='/' className='text-xl font-bold'>
            Manga Reader
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
              Manga List
            </Link>
            <Link
              href='/genres'
              className='text-sm font-medium transition-colors hover:text-primary'
            >
              Genres
            </Link>
            <ThemeToggle />
          </nav>

          {/* Mobile Navigation */}
          <div className='md:hidden flex items-center'>
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-2">
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
                    Manga List
                  </Link>
                  <Link
                    href='/genres'
                    className='text-sm font-medium transition-colors hover:text-primary'
                  >
                    Genres
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

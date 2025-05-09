'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='border-t bg-background'>
      <div className='container mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div>
            <h3 className='text-lg font-semibold mb-4'>Manga Reader</h3>
            <p className='text-muted-foreground'>
              Your go-to platform for reading manga online. Discover new series and keep up with your
              favorites.
            </p>
          </div>

          <div>
            <h3 className='text-lg font-semibold mb-4'>Quick Links</h3>
            <ul className='space-y-2'>
              <li>
                <Link
                  href='/'
                  className='text-muted-foreground hover:text-foreground transition-colors'
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href='/manga'
                  className='text-muted-foreground hover:text-foreground transition-colors'
                >
                  Manga List
                </Link>
              </li>
              <li>
                <Link
                  href='/genres'
                  className='text-muted-foreground hover:text-foreground transition-colors'
                >
                  Genres
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='text-lg font-semibold mb-4'>Legal</h3>
            <ul className='space-y-2'>
              <li>
                <Link
                  href='/privacy'
                  className='text-muted-foreground hover:text-foreground transition-colors'
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href='/terms'
                  className='text-muted-foreground hover:text-foreground transition-colors'
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href='/dmca'
                  className='text-muted-foreground hover:text-foreground transition-colors'
                >
                  DMCA
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className='border-t mt-8 pt-8 text-center text-muted-foreground'>
          <p>&copy; {currentYear} Manga Reader. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

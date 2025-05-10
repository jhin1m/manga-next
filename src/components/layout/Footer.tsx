'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='border-t border-border/40 bg-background'>
      <div className='container mx-auto px-4 py-6'>
        <div className='flex flex-wrap justify-between gap-6'>
          <div className='w-full md:w-auto'>
            <Link href='/' className='text-sm text-muted-foreground hover:text-foreground transition-colors'>
              ホーム
            </Link>
          </div>
          <div className='w-full md:w-auto'>
            <Link href='/privacy' className='text-sm text-muted-foreground hover:text-foreground transition-colors'>
              プライバシーポリシー
            </Link>
          </div>
          <div className='w-full md:w-auto'>
            <Link href='/terms' className='text-sm text-muted-foreground hover:text-foreground transition-colors'>
              利用規約
            </Link>
          </div>
          <div className='w-full md:w-auto'>
            <Link href='/dmca' className='text-sm text-muted-foreground hover:text-foreground transition-colors'>
              DMCA
            </Link>
          </div>
          <div className='w-full md:w-auto'>
            <Link href='/contact' className='text-sm text-muted-foreground hover:text-foreground transition-colors'>
              お問い合わせ
            </Link>
          </div>
        </div>

        <div className='mt-6 text-center text-xs text-muted-foreground'>
          <p>&copy; {currentYear} Dokinaw. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

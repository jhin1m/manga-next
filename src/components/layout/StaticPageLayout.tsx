import { ReactNode } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Home } from 'lucide-react';

interface StaticPageLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  showBackButton?: boolean;
  className?: string;
}

export default function StaticPageLayout({
  title,
  subtitle,
  children,
  showBackButton = true,
  className = ''
}: StaticPageLayoutProps) {
  const t = useTranslations('staticPages.common');

  return (
    <div className={`container mx-auto px-4 py-8 max-w-4xl ${className}`}>
      {/* Header Section */}
      <div className="mb-8">
        {showBackButton && (
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                {t('backToHome')}
              </Button>
            </Link>
          </div>
        )}

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <Separator className="mb-8" />

      {/* Main Content */}
      <Card className="shadow-lg border-border/50">
        <CardContent className="p-8">
          {children}
        </CardContent>
      </Card>

      {/* Footer Navigation */}
      <div className="mt-12 text-center">
        <Link href="/">
          <Button variant="outline" size="lg" className="gap-2">
            <Home className="h-4 w-4" />
            {t('backToHome')}
          </Button>
        </Link>
      </div>
    </div>
  );
}

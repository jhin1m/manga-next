import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import StaticPageLayout from '@/components/layout/StaticPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Scale, 
  UserX,
  Calendar
} from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('staticPages.terms');
  
  return {
    title: t('title'),
    description: t('subtitle'),
    openGraph: {
      title: t('title'),
      description: t('subtitle'),
      type: 'website',
    },
  };
}

export default function TermsPage() {
  const t = useTranslations('staticPages.terms');

  const sections = [
    {
      icon: CheckCircle,
      title: t('sections.0.title'),
      content: t('sections.0.content'),
      variant: 'default' as const
    },
    {
      icon: FileText,
      title: t('sections.1.title'),
      content: t('sections.1.content'),
      variant: 'default' as const
    },
    {
      icon: AlertTriangle,
      title: t('sections.2.title'),
      content: t('sections.2.content'),
      variant: 'warning' as const
    },
    {
      icon: Scale,
      title: t('sections.3.title'),
      content: t('sections.3.content'),
      variant: 'warning' as const
    },
    {
      icon: UserX,
      title: t('sections.4.title'),
      content: t('sections.4.content'),
      variant: 'default' as const
    }
  ];

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <StaticPageLayout
      title={t('title')}
      subtitle={t('subtitle')}
    >
      <div className="space-y-8">
        {/* Last Updated */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{t('lastUpdated', { date: currentDate })}</span>
        </div>

        {/* Terms Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => {
            const IconComponent = section.icon;
            const isWarning = section.variant === 'warning';
            
            return (
              <Card 
                key={index} 
                className={`border-border/50 ${
                  isWarning ? 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/20' : ''
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className={`p-2 rounded-lg ${
                      isWarning 
                        ? 'bg-yellow-100 dark:bg-yellow-900/30' 
                        : 'bg-primary/10'
                    }`}>
                      <IconComponent className={`h-5 w-5 ${
                        isWarning ? 'text-yellow-600 dark:text-yellow-400' : 'text-primary'
                      }`} />
                    </div>
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {section.content}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Important Notice */}
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Scale className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Legal Agreement
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                  By using our service, you acknowledge that you have read, understood, 
                  and agree to be bound by these Terms of Service. These terms may be 
                  updated from time to time, and continued use of the service constitutes 
                  acceptance of any changes.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Legal Agreement</Badge>
                  <Badge variant="secondary">User Responsibilities</Badge>
                  <Badge variant="secondary">Service Terms</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StaticPageLayout>
  );
}

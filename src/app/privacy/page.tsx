import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import StaticPageLayout from '@/components/layout/StaticPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Lock, 
  Eye, 
  UserCheck, 
  Database,
  Calendar
} from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('staticPages.privacy');
  
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

export default function PrivacyPage() {
  const t = useTranslations('staticPages.privacy');

  const sections = [
    {
      icon: Database,
      title: t('sections.0.title'),
      content: t('sections.0.content')
    },
    {
      icon: Eye,
      title: t('sections.1.title'),
      content: t('sections.1.content')
    },
    {
      icon: UserCheck,
      title: t('sections.2.title'),
      content: t('sections.2.content')
    },
    {
      icon: Lock,
      title: t('sections.3.title'),
      content: t('sections.3.content')
    },
    {
      icon: Shield,
      title: t('sections.4.title'),
      content: t('sections.4.content')
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

        {/* Privacy Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <Card key={index} className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <IconComponent className="h-5 w-5 text-primary" />
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
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Your Privacy Matters
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We are committed to protecting your privacy and ensuring transparency 
                  in how we handle your personal information. If you have any questions 
                  about this privacy policy, please don't hesitate to contact us.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary">GDPR Compliant</Badge>
                  <Badge variant="secondary">Data Protection</Badge>
                  <Badge variant="secondary">User Rights</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StaticPageLayout>
  );
}

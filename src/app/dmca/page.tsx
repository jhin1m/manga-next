import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import StaticPageLayout from '@/components/layout/StaticPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, FileText, CheckSquare, Mail, AlertCircle } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('staticPages.dmca');

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

export default function DMCAPage() {
  const t = useTranslations('staticPages.dmca');

  const sections = [
    {
      icon: Shield,
      title: t('sections.0.title'),
      content: t('sections.0.content'),
      type: 'info' as const,
    },
    {
      icon: FileText,
      title: t('sections.1.title'),
      content: t('sections.1.content'),
      type: 'info' as const,
    },
    {
      icon: CheckSquare,
      title: t('sections.2.title'),
      content: null,
      type: 'list' as const,
    },
    {
      icon: Mail,
      title: t('sections.3.title'),
      content: t('sections.3.content'),
      type: 'contact' as const,
    },
  ];

  const requiredItems = [
    t('sections.2.items.0'),
    t('sections.2.items.1'),
    t('sections.2.items.2'),
    t('sections.2.items.3'),
    t('sections.2.items.4'),
    t('sections.2.items.5'),
  ];

  return (
    <StaticPageLayout title={t('title')} subtitle={t('subtitle')}>
      <div className='space-y-8'>
        {/* DMCA Sections */}
        <div className='space-y-6'>
          {sections.map((section, index) => {
            const IconComponent = section.icon;

            return (
              <Card key={index} className='border-border/50'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-3 text-xl'>
                    <div className='p-2 rounded-lg bg-primary/10'>
                      <IconComponent className='h-5 w-5 text-primary' />
                    </div>
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {section.type === 'list' ? (
                    <div className='space-y-3'>
                      <p className='text-muted-foreground mb-4'>
                        Please provide the following information in your DMCA notice:
                      </p>
                      <ul className='space-y-2'>
                        {requiredItems.map((item, itemIndex) => (
                          <li key={itemIndex} className='flex items-start gap-3'>
                            <CheckSquare className='h-4 w-4 text-green-600 mt-1 flex-shrink-0' />
                            <span className='text-muted-foreground text-sm'>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : section.type === 'contact' ? (
                    <div className='space-y-4'>
                      <p className='text-muted-foreground leading-relaxed'>{section.content}</p>
                      <Link href='/contact'>
                        <Button className='gap-2'>
                          <Mail className='h-4 w-4' />
                          Contact Us for DMCA
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <p className='text-muted-foreground leading-relaxed'>{section.content}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Important Notice */}
        <Card className='border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20'>
          <CardContent className='p-6'>
            <div className='flex items-start gap-3'>
              <AlertCircle className='h-6 w-6 text-orange-600 dark:text-orange-400 mt-1 flex-shrink-0' />
              <div>
                <h3 className='font-semibold text-foreground mb-2'>Important Notice</h3>
                <p className='text-muted-foreground text-sm leading-relaxed mb-3'>
                  Please note that filing a false DMCA notice may result in legal consequences. Only
                  submit a DMCA notice if you are the copyright owner or authorized to act on behalf
                  of the copyright owner. We take copyright infringement seriously and will respond
                  to valid notices promptly.
                </p>
                <div className='flex flex-wrap gap-2'>
                  <Badge variant='secondary'>Copyright Protection</Badge>
                  <Badge variant='secondary'>Legal Compliance</Badge>
                  <Badge variant='secondary'>DMCA Process</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StaticPageLayout>
  );
}

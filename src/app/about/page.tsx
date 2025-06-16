import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import StaticPageLayout from '@/components/layout/StaticPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Globe, Heart, MessageCircle, Zap, Target, Award } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('staticPages.about');

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

export default function AboutPage() {
  const t = useTranslations('staticPages.about');

  const features = [
    {
      icon: BookOpen,
      title: t('features.items.0'),
      description: 'Discover thousands of manga titles across all genres',
    },
    {
      icon: Zap,
      title: t('features.items.1'),
      description: 'Stay up-to-date with the latest chapter releases',
    },
    {
      icon: Users,
      title: t('features.items.2'),
      description: 'Enjoy a seamless reading experience on any device',
    },
    {
      icon: Target,
      title: t('features.items.3'),
      description: 'Get personalized manga recommendations based on your preferences',
    },
    {
      icon: MessageCircle,
      title: t('features.items.4'),
      description: 'Connect with fellow manga enthusiasts and share your thoughts',
    },
    {
      icon: Globe,
      title: t('features.items.5'),
      description: 'Available in multiple languages for global accessibility',
    },
  ];

  return (
    <StaticPageLayout title={t('title')} subtitle={t('subtitle')}>
      <div className='space-y-8'>
        {/* Mission Section */}
        <section>
          <div className='flex items-center gap-3 mb-4'>
            <Target className='h-6 w-6 text-primary' />
            <h2 className='text-2xl font-semibold text-foreground'>{t('mission.title')}</h2>
          </div>
          <p className='text-muted-foreground leading-relaxed text-lg'>{t('mission.content')}</p>
        </section>

        {/* Features Section */}
        <section>
          <div className='flex items-center gap-3 mb-6'>
            <Award className='h-6 w-6 text-primary' />
            <h2 className='text-2xl font-semibold text-foreground'>{t('features.title')}</h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card
                  key={index}
                  className='border-border/50 hover:border-primary/50 transition-colors'
                >
                  <CardHeader className='pb-3'>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 rounded-lg bg-primary/10'>
                        <IconComponent className='h-5 w-5 text-primary' />
                      </div>
                      <CardTitle className='text-base'>{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className='pt-0'>
                    <p className='text-sm text-muted-foreground'>{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Team Section */}
        <section>
          <div className='flex items-center gap-3 mb-4'>
            <Heart className='h-6 w-6 text-primary' />
            <h2 className='text-2xl font-semibold text-foreground'>{t('team.title')}</h2>
          </div>
          <div className='bg-muted/30 rounded-lg p-6'>
            <p className='text-muted-foreground leading-relaxed text-lg'>{t('team.content')}</p>
            <div className='flex flex-wrap gap-2 mt-4'>
              <Badge variant='secondary'>Manga Enthusiasts</Badge>
              <Badge variant='secondary'>Developers</Badge>
              <Badge variant='secondary'>Designers</Badge>
              <Badge variant='secondary'>Community Builders</Badge>
            </div>
          </div>
        </section>
      </div>
    </StaticPageLayout>
  );
}

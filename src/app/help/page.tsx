import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import StaticPageLayout from '@/components/layout/StaticPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle, MessageCircle, Mail, ExternalLink, BookOpen, Users } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('staticPages.help');

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

export default function HelpPage() {
  const t = useTranslations('staticPages.help');

  return (
    <StaticPageLayout title={t('title')} subtitle={t('subtitle')}>
      <div className='space-y-8'>
        {/* FAQ Section */}
        <section>
          <div className='flex items-center gap-3 mb-6'>
            <HelpCircle className='h-6 w-6 text-primary' />
            <h2 className='text-2xl font-semibold text-foreground'>{t('faq.title')}</h2>
          </div>

          <Accordion type='single' collapsible className='space-y-4'>
            {Array.from({ length: 4 }, (_, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className='border border-border/50 rounded-lg px-4'
              >
                <AccordionTrigger className='text-left hover:no-underline'>
                  <span className='font-medium'>{t(`faq.items.${index}.question`)}</span>
                </AccordionTrigger>
                <AccordionContent className='text-muted-foreground pb-4'>
                  {t(`faq.items.${index}.answer`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Contact Support Section */}
        <section>
          <Card className='border-primary/20 bg-primary/5'>
            <CardHeader>
              <div className='flex items-center gap-3'>
                <MessageCircle className='h-6 w-6 text-primary' />
                <CardTitle className='text-xl'>{t('contact.title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-muted-foreground'>{t('contact.content')}</p>

              <div className='flex flex-col sm:flex-row gap-3'>
                <Link href='/contact'>
                  <Button className='w-full sm:w-auto gap-2'>
                    <Mail className='h-4 w-4' />
                    Contact Support
                  </Button>
                </Link>

                <Link href='/'>
                  <Button variant='outline' className='w-full sm:w-auto gap-2'>
                    <ExternalLink className='h-4 w-4' />
                    Browse Manga
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Additional Help Resources */}
        <section>
          <h3 className='text-lg font-semibold text-foreground mb-4'>Additional Resources</h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Card className='border-border/50'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base flex items-center gap-2'>
                  <BookOpen className='h-5 w-5 text-primary' />
                  Getting Started Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground mb-3'>
                  Learn the basics of using our platform effectively.
                </p>
                <Link href='/manga'>
                  <Button variant='outline' size='sm'>
                    Explore Manga
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className='border-border/50'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base flex items-center gap-2'>
                  <Users className='h-5 w-5 text-primary' />
                  Community Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground mb-3'>
                  Learn about our community standards and best practices.
                </p>
                <Link href='/terms'>
                  <Button variant='outline' size='sm'>
                    Read Guidelines
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </StaticPageLayout>
  );
}

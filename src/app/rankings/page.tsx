import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale } from '@/i18n/config';
import RankingsPage from '@/components/feature/rankings/RankingsPage';

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || defaultLocale;
  const t = await getTranslations({ locale, namespace: 'rankings.seo' });

  const title = t('metaTitle.default');
  const description = t('metaDescription.default');

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: '/rankings',
      languages: {
        en: '/rankings',
        vi: '/rankings',
      },
    },
  };
}

// Generate structured data for SEO
function generateStructuredData(locale: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://manga-next.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: locale === 'vi' ? 'Bảng Xếp Hạng Manga' : 'Manga Rankings',
    description:
      locale === 'vi'
        ? 'Khám phá những bộ manga phổ biến nhất với bảng xếp hạng toàn diện theo lượt xem, đánh giá và yêu thích.'
        : 'Discover the most popular manga with comprehensive rankings by views, ratings, and bookmarks.',
    url: `${baseUrl}/rankings`,
    mainEntity: {
      '@type': 'ItemList',
      name: locale === 'vi' ? 'Bảng Xếp Hạng Manga' : 'Manga Rankings',
      description:
        locale === 'vi'
          ? 'Danh sách các bộ manga được xếp hạng theo nhiều tiêu chí khác nhau'
          : 'List of manga ranked by various criteria',
      numberOfItems: 4,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: locale === 'vi' ? 'Nhiều Lượt Xem Nhất' : 'Most Viewed',
          url: `${baseUrl}/rankings/most-viewed`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: locale === 'vi' ? 'Đánh Giá Cao Nhất' : 'Highest Rated',
          url: `${baseUrl}/rankings/highest-rated`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: locale === 'vi' ? 'Được Yêu Thích Nhất' : 'Most Bookmarked',
          url: `${baseUrl}/rankings/most-bookmarked`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: locale === 'vi' ? 'Đang Thịnh Hành' : 'Trending',
          url: `${baseUrl}/rankings/trending`,
        },
      ],
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: locale === 'vi' ? 'Trang chủ' : 'Home',
          item: baseUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: locale === 'vi' ? 'Bảng Xếp Hạng' : 'Rankings',
          item: `${baseUrl}/rankings`,
        },
      ],
    },
  };
}

export default async function Rankings() {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || defaultLocale;

  const structuredData = generateStructuredData(locale);

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      {/* Main Rankings Page Component */}
      <RankingsPage />
    </>
  );
}

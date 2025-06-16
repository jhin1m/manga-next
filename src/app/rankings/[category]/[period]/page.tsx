import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale } from '@/i18n/config';
import RankingsPage from '@/components/feature/rankings/RankingsPage';

type RankingCategory = 'most-viewed' | 'highest-rated' | 'most-bookmarked' | 'trending';
type RankingPeriod = 'daily' | 'weekly' | 'monthly' | 'all-time';

interface PageProps {
  params: Promise<{
    category: string;
    period: string;
  }>;
}

// Valid category and period mappings
const categoryMappings: Record<string, RankingCategory> = {
  'most-viewed': 'most-viewed',
  'highest-rated': 'highest-rated',
  'most-bookmarked': 'most-bookmarked',
  trending: 'trending',
};

const periodMappings: Record<string, RankingPeriod> = {
  daily: 'daily',
  weekly: 'weekly',
  monthly: 'monthly',
  'all-time': 'all-time',
};

// Convert URL slug to API format
const categoryToApiFormat = (category: string): string => {
  return category.replace('-', '_');
};

const periodToApiFormat = (period: string): string => {
  return period.replace('-', '_');
};

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, period } = await params;

  if (!categoryMappings[category] || !periodMappings[period]) {
    return {
      title: 'Page Not Found',
      description: 'The requested ranking page was not found.',
    };
  }

  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || defaultLocale;
  const t = await getTranslations({ locale, namespace: 'rankings.seo' });

  const categoryKey = categoryToApiFormat(category);
  const periodKey = periodToApiFormat(period);

  // Capitalize period for title
  const periodDisplay = period.charAt(0).toUpperCase() + period.slice(1).replace('-', ' ');

  const title = t(`metaTitle.${categoryKey}`, { period: periodDisplay });
  const description = t(`metaDescription.${categoryKey}`, { period: periodKey });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://manga-next.com';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${baseUrl}/rankings/${category}/${period}`,
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `/rankings/${category}/${period}`,
      languages: {
        en: `/rankings/${category}/${period}`,
        vi: `/rankings/${category}/${period}`,
      },
    },
  };
}

// Generate static params for known combinations
export async function generateStaticParams() {
  const combinations = [];

  for (const category of Object.keys(categoryMappings)) {
    for (const period of Object.keys(periodMappings)) {
      combinations.push({
        category,
        period,
      });
    }
  }

  return combinations;
}

// Generate structured data for category + period page
function generateCategoryPeriodStructuredData(category: string, period: string, locale: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://manga-next.com';

  const categoryNames = {
    'most-viewed': locale === 'vi' ? 'Nhiều Lượt Xem Nhất' : 'Most Viewed',
    'highest-rated': locale === 'vi' ? 'Đánh Giá Cao Nhất' : 'Highest Rated',
    'most-bookmarked': locale === 'vi' ? 'Được Yêu Thích Nhất' : 'Most Bookmarked',
    trending: locale === 'vi' ? 'Đang Thịnh Hành' : 'Trending',
  };

  const periodNames = {
    daily: locale === 'vi' ? 'Hôm Nay' : 'Daily',
    weekly: locale === 'vi' ? 'Tuần Này' : 'Weekly',
    monthly: locale === 'vi' ? 'Tháng Này' : 'Monthly',
    'all-time': locale === 'vi' ? 'Mọi Thời Đại' : 'All Time',
  };

  const categoryName = categoryNames[category as keyof typeof categoryNames];
  const periodName = periodNames[period as keyof typeof periodNames];

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${periodName} ${categoryName} - ${locale === 'vi' ? 'Bảng Xếp Hạng Manga' : 'Manga Rankings'}`,
    description:
      locale === 'vi'
        ? `Khám phá bảng xếp hạng manga ${categoryName.toLowerCase()} ${periodName.toLowerCase()} với dữ liệu cập nhật theo thời gian thực.`
        : `Discover ${periodName.toLowerCase()} ${categoryName.toLowerCase()} manga rankings with real-time updated data.`,
    url: `${baseUrl}/rankings/${category}/${period}`,
    mainEntity: {
      '@type': 'ItemList',
      name: `${periodName} ${categoryName}`,
      description:
        locale === 'vi'
          ? `Danh sách manga được xếp hạng theo ${categoryName.toLowerCase()} trong khoảng thời gian ${periodName.toLowerCase()}`
          : `List of manga ranked by ${categoryName.toLowerCase()} for ${periodName.toLowerCase()} period`,
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
        {
          '@type': 'ListItem',
          position: 3,
          name: categoryName,
          item: `${baseUrl}/rankings/${category}`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: periodName,
          item: `${baseUrl}/rankings/${category}/${period}`,
        },
      ],
    },
  };
}

export default async function CategoryPeriodRankingsPage({ params }: PageProps) {
  const { category, period } = await params;

  // Validate category and period
  if (!categoryMappings[category] || !periodMappings[period]) {
    notFound();
  }

  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || defaultLocale;

  const structuredData = generateCategoryPeriodStructuredData(category, period, locale);

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      {/* Rankings Page with pre-selected category and period */}
      <RankingsPage
        initialCategory={categoryToApiFormat(category) as any}
        initialPeriod={periodToApiFormat(period) as any}
      />
    </>
  );
}

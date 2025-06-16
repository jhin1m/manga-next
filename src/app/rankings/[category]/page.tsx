import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale } from '@/i18n/config';
import RankingsPage from '@/components/feature/rankings/RankingsPage';

type RankingCategory = 'most-viewed' | 'highest-rated' | 'most-bookmarked' | 'trending';

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}

// Valid category mappings
const categoryMappings: Record<string, RankingCategory> = {
  'most-viewed': 'most-viewed',
  'highest-rated': 'highest-rated',
  'most-bookmarked': 'most-bookmarked',
  trending: 'trending',
};

// Convert URL slug to API format
const categoryToApiFormat = (category: string): string => {
  return category.replace('-', '_');
};

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;

  if (!categoryMappings[category]) {
    return {
      title: 'Category Not Found',
      description: 'The requested ranking category was not found.',
    };
  }

  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || defaultLocale;
  const t = await getTranslations({ locale, namespace: 'rankings.seo' });

  const categoryKey = categoryToApiFormat(category);
  const title = t(`metaTitle.${categoryKey}`, { period: 'Weekly' });
  const description = t(`metaDescription.${categoryKey}`, { period: 'weekly' });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://manga-next.com';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${baseUrl}/rankings/${category}`,
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `/rankings/${category}`,
      languages: {
        en: `/rankings/${category}`,
        vi: `/rankings/${category}`,
      },
    },
  };
}

// Generate static params for known categories
export async function generateStaticParams() {
  return Object.keys(categoryMappings).map(category => ({
    category,
  }));
}

// Generate structured data for category page
function generateCategoryStructuredData(category: string, locale: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://manga-next.com';

  const categoryNames = {
    'most-viewed': locale === 'vi' ? 'Nhiều Lượt Xem Nhất' : 'Most Viewed',
    'highest-rated': locale === 'vi' ? 'Đánh Giá Cao Nhất' : 'Highest Rated',
    'most-bookmarked': locale === 'vi' ? 'Được Yêu Thích Nhất' : 'Most Bookmarked',
    trending: locale === 'vi' ? 'Đang Thịnh Hành' : 'Trending',
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${categoryNames[category as keyof typeof categoryNames]} - ${locale === 'vi' ? 'Bảng Xếp Hạng Manga' : 'Manga Rankings'}`,
    description:
      locale === 'vi'
        ? `Khám phá bảng xếp hạng manga ${categoryNames[category as keyof typeof categoryNames].toLowerCase()} với dữ liệu cập nhật theo thời gian thực.`
        : `Discover ${categoryNames[category as keyof typeof categoryNames].toLowerCase()} manga rankings with real-time updated data.`,
    url: `${baseUrl}/rankings/${category}`,
    mainEntity: {
      '@type': 'ItemList',
      name: categoryNames[category as keyof typeof categoryNames],
      description:
        locale === 'vi'
          ? `Danh sách manga được xếp hạng theo ${categoryNames[category as keyof typeof categoryNames].toLowerCase()}`
          : `List of manga ranked by ${categoryNames[category as keyof typeof categoryNames].toLowerCase()}`,
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
          name: categoryNames[category as keyof typeof categoryNames],
          item: `${baseUrl}/rankings/${category}`,
        },
      ],
    },
  };
}

export default async function CategoryRankingsPage({ params }: PageProps) {
  const { category } = await params;

  // Validate category
  if (!categoryMappings[category]) {
    notFound();
  }

  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || defaultLocale;

  const structuredData = generateCategoryStructuredData(category, locale);

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      {/* Rankings Page with pre-selected category */}
      <RankingsPage initialCategory={categoryToApiFormat(category) as any} />
    </>
  );
}

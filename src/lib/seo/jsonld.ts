/**
 * Tạo JSON-LD cho các trang manga và chapter để cải thiện SEO
 */

// JSON-LD cho trang manga
export function generateMangaJsonLd(manga: any) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: manga.title,
    headline: manga.title,
    description: manga.description || `Read ${manga.title} manga online for free on Dokinaw.`,
    image: manga.coverImage || '/images/og-image.jpg',
    author: {
      '@type': 'Person',
      name: manga.author || 'Unknown',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Dokinaw',
      logo: {
        '@type': 'ImageObject',
        url: 'https://dokinaw.com/logo.png',
      },
    },
    datePublished: manga.createdAt || new Date().toISOString(),
    dateModified: manga.updatedAt || new Date().toISOString(),
    genre: manga.genres?.map((genre: any) => genre.name).join(', ') || 'Manga',
    inLanguage: 'ja',
    url: `https://dokinaw.com/manga/${manga.slug}`,
  };

  return JSON.stringify(jsonLd);
}

// JSON-LD cho trang chapter
export function generateChapterJsonLd(manga: any, chapter: any) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Chapter',
    isPartOf: {
      '@type': 'Book',
      name: manga.title,
      url: `https://dokinaw.com/manga/${manga.slug}`,
    },
    name: `Chapter ${chapter.number}`,
    headline: `${manga.title} - Chapter ${chapter.number}`,
    description: `Read ${manga.title} Chapter ${chapter.number} online for free on Dokinaw.`,
    image: chapter.coverImage || manga.coverImage || '/images/og-image.jpg',
    datePublished: chapter.createdAt || new Date().toISOString(),
    dateModified: chapter.updatedAt || new Date().toISOString(),
    url: `https://dokinaw.com/manga/${manga.slug}/chapter/${chapter.id}`,
    pageStart: 1,
    pageEnd: chapter.pageCount || 1,
  };

  return JSON.stringify(jsonLd);
}

// JSON-LD cho trang chủ
export function generateHomeJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Dokinaw',
    description: '無料で漫画が読めるサイト。人気漫画から名作漫画まで幅広く揃えています。',
    url: 'https://dokinaw.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://dokinaw.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return JSON.stringify(jsonLd);
}

// JSON-LD cho trang danh sách manga
export function generateMangaListJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Manga List - Dokinaw',
    description: 'Browse all manga available on Dokinaw.',
    url: 'https://dokinaw.com/manga',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Dokinaw',
      url: 'https://dokinaw.com',
    },
  };

  return JSON.stringify(jsonLd);
}

// JSON-LD cho trang thể loại
export function generateGenreJsonLd(genre: string) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${genre} Manga - Dokinaw`,
    description: `Browse all ${genre} manga available on Dokinaw.`,
    url: `https://dokinaw.com/genres/${genre.toLowerCase()}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Dokinaw',
      url: 'https://dokinaw.com',
    },
  };

  return JSON.stringify(jsonLd);
}

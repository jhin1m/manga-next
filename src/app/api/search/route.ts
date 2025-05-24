import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { unstable_cache } from 'next/cache'

// Define cache TTL (time to live) in seconds
const CACHE_TTL = 60 * 5 // 5 minutes

// Interface for search parameters
interface SearchParams {
  query: string
  page: number
  limit: number
  genre?: string | null
  status?: string | null
  sort?: string | null
}

// Function to generate cache key based on search parameters
function generateCacheKey(params: SearchParams): string {
  return `search:${params.query}:${params.page}:${params.limit}:${params.genre || ''}:${params.status || ''}:${params.sort || ''}`
}

// Function to highlight matching terms in text
function highlightMatchingTerms(text: string, searchTerms: string[]): string {
  if (!text || !searchTerms.length) return text

  let highlightedText = text

  // Check if any search terms contain non-Latin characters
  const hasNonLatinTerms = searchTerms.some(term => /[^\u0000-\u007F]/.test(term))

  // Escape special regex characters in search terms
  const escapedTerms = searchTerms.map(term =>
    term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  )

  if (hasNonLatinTerms) {
    // For non-Latin characters, we need to handle each term separately
    // to avoid regex issues with multi-byte characters
    for (const term of escapedTerms) {
      if (term.length > 0) {
        try {
          // Create a case-insensitive regex for this term
          const termPattern = new RegExp(`(${term})`, 'gi')
          // Replace matches with highlighted version
          highlightedText = highlightedText.replace(termPattern, '<mark>$1</mark>')
        } catch (error) {
          console.warn(`Error highlighting term "${term}":`, error)
          // Continue with other terms if one fails
        }
      }
    }
  } else {
    // For Latin characters, use the original approach with a single regex
    try {
      // Create regex pattern for all terms
      const pattern = new RegExp(`(${escapedTerms.join('|')})`, 'gi')
      // Replace matches with highlighted version
      highlightedText = highlightedText.replace(pattern, '<mark>$1</mark>')
    } catch (error) {
      console.warn('Error highlighting text:', error)
    }
  }

  return highlightedText
}

// Cached search function
const cachedSearch = unstable_cache(
  async (params: SearchParams) => {
    const { query, page, limit, genre, status, sort } = params

    // Validate and sanitize the query
    const sanitizedQuery = query.trim()
    if (sanitizedQuery.length === 0) {
      return {
        comics: [],
        totalPages: 0,
        currentPage: 1,
        totalComics: 0
      }
    }

    // Format query for full text search
    // Handle potential syntax errors in the query by catching invalid characters
    // For Japanese and other non-Latin characters, we need a different approach

    // First, check if the query contains non-Latin characters (like Japanese)
    const hasNonLatinChars = /[^\u0000-\u007F]/.test(sanitizedQuery)

    let queryWords: string[] = []
    let formattedQuery: string

    if (hasNonLatinChars) {
      // For non-Latin queries, treat the entire query as a single token
      // and also split by spaces to catch individual words
      queryWords = [
        sanitizedQuery.replace(/[&|!:*()]/g, ''),
        ...sanitizedQuery.split(/\s+/).filter(word => word.length > 0)
      ]

      // Remove duplicates
      queryWords = [...new Set(queryWords)]

      // Format for tsquery - for non-Latin characters, we use the simple configuration
      // which treats each character as a lexeme
      formattedQuery = queryWords
        .map(word => word.replace(/[&|!:*()]/g, ''))
        .filter(Boolean)
        .map(word => `${word}:*`)
        .join(' | ') // Use OR operator for better results with non-Latin characters
    } else {
      // For Latin characters, use the original approach
      queryWords = sanitizedQuery
        .split(/\s+/)
        .filter(word => word.length > 0)
        .map(word => word.replace(/[&|!:*()]/g, ''))
        .filter(Boolean)

      formattedQuery = queryWords
        .map(word => `${word}:*`)
        .join(' & ') // Use AND operator for Latin characters
    }

    // If after sanitization we have an empty query, return empty results
    if (!formattedQuery) {
      return {
        comics: [],
        totalPages: 0,
        currentPage: 1,
        totalComics: 0
      }
    }

    // Build genre and status conditions
    const genreCondition = genre ? Prisma.sql`
      AND EXISTS (
        SELECT 1 FROM "Comic_Genres" cg
        JOIN "Genres" g ON cg.genre_id = g.id
        WHERE cg.comic_id = c.id AND g.slug = ${genre}
      )
    ` : Prisma.sql``

    const statusCondition = status ? Prisma.sql`AND c.status = ${status}` : Prisma.sql``

    // Use raw query for full text search with ranking
    const skip = (page - 1) * limit

    // Check if search_vector column exists and is properly set up
    let useFullTextSearch = true;

    try {
      // Try a simple query to check if search_vector is working
      await prisma.$executeRaw`SELECT to_tsvector('english'::regconfig, 'test')`;

      // Check if the column exists
      const columnCheck = await prisma.$queryRaw`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'Comics' AND column_name = 'search_vector'
      `;

      if (!Array.isArray(columnCheck) || columnCheck.length === 0) {
        useFullTextSearch = false;
      }
    } catch (error) {
      console.warn("PostgreSQL full-text search not properly configured:", error);
      useFullTextSearch = false;
    }

    // If search_vector doesn't exist or full-text search is not working, fall back to basic search
    if (!useFullTextSearch) {
      console.warn("search_vector column not found, falling back to basic search");

      // Fallback to basic ILIKE search
      // For Japanese and other non-Latin characters, we need to search for each word separately
      let searchConditions = [];

      if (hasNonLatinChars) {
        // For non-Latin queries, search for the full query and each word separately
        searchConditions = [
          { title: { contains: sanitizedQuery, mode: 'insensitive' } },
          { description: { contains: sanitizedQuery, mode: 'insensitive' } }
        ];

        // Add conditions for each individual word
        queryWords.forEach(word => {
          if (word !== sanitizedQuery) {
            searchConditions.push({ title: { contains: word, mode: 'insensitive' } });
            searchConditions.push({ description: { contains: word, mode: 'insensitive' } });
          }
        });
      } else {
        // For Latin queries, just search for the full query
        searchConditions = [
          { title: { contains: sanitizedQuery, mode: 'insensitive' } },
          { description: { contains: sanitizedQuery, mode: 'insensitive' } }
        ];
      }

      const comicsResult = await prisma.comics.findMany({
        where: {
          OR: searchConditions,
          ...(status && { status })
        },
        take: limit,
        skip: skip,
        orderBy: { title: 'asc' }
      });

      const totalComics = await prisma.comics.count({
        where: {
          OR: searchConditions,
          ...(status && { status })
        }
      });

      // Get comic IDs from the basic search results
      const comicIds = comicsResult.map(comic => comic.id);

      // Continue with the rest of the function using these IDs
      const comicsWithRelations = await prisma.comics.findMany({
        where: {
          id: { in: comicIds }
        },
        include: {
          Comic_Genres: {
            include: {
              Genres: true
            }
          },
          Chapters: {
            orderBy: {
              chapter_number: 'desc'
            },
            take: 1,
            select: {
              id: true,
              chapter_number: true,
              title: true,
              slug: true,
              release_date: true
            }
          }
        }
      });

      // Sort the results to match the original order
      const comicsInOrder = comicIds.map(id =>
        comicsWithRelations.find(comic => comic.id === id)
      ).filter(Boolean);

      // Get chapter counts for each manga
      const comicsWithChapterCounts = await Promise.all(
        comicsInOrder.map(async (comic) => {
          const chapterCount = await prisma.chapters.count({
            where: { comic_id: comic.id }
          });

          // Add highlighted text for title and description
          const highlightedTitle = highlightMatchingTerms(comic.title, queryWords)
          const highlightedDescription = comic.description
            ? highlightMatchingTerms(comic.description, queryWords)
            : null

          return {
            ...comic,
            _chapterCount: chapterCount,
            _highlightedTitle: highlightedTitle,
            _highlightedDescription: highlightedDescription
          };
        })
      );

      return {
        comics: comicsWithChapterCounts,
        totalPages: Math.ceil(totalComics / limit),
        currentPage: page,
        totalComics,
        searchTerms: queryWords
      };
    }

    // Determine sort order
    let sortOrder = Prisma.sql`ORDER BY rank DESC`
    if (sort === 'latest') {
      sortOrder = Prisma.sql`ORDER BY c.last_chapter_uploaded_at DESC NULLS LAST, rank DESC`
    } else if (sort === 'views') {
      sortOrder = Prisma.sql`ORDER BY c.total_views DESC NULLS LAST, rank DESC`
    } else if (sort === 'title') {
      sortOrder = Prisma.sql`ORDER BY c.title ASC, rank DESC`
    }

    // Execute raw query for search with ranking and highlighting using search_vector
    // Cast search_vector to text to avoid deserialization issues
    // Use 'simple' configuration for better handling of non-Latin characters
    const tsqueryConfig = hasNonLatinChars ? 'simple' : 'english';

    // Convert tsqueryConfig to regconfig type by casting
    const comicsResult = await prisma.$queryRaw<any[]>`
      SELECT
        c.id, c.title, c.slug, c.alternative_titles, c.description, c.cover_image_url,
        c.status, c.release_date, c.country_of_origin, c.age_rating, c.total_views,
        c.total_favorites, c.last_chapter_uploaded_at, c.uploader_id, c.created_at, c.updated_at,
        ts_rank(c.search_vector, to_tsquery(${tsqueryConfig}::regconfig, ${formattedQuery})) as rank,
        ts_headline(${tsqueryConfig}::regconfig, c.title, to_tsquery(${tsqueryConfig}::regconfig, ${formattedQuery}), 'StartSel=<mark>, StopSel=</mark>, HighlightAll=true') as highlighted_title,
        ts_headline(${tsqueryConfig}::regconfig, c.description, to_tsquery(${tsqueryConfig}::regconfig, ${formattedQuery}), 'StartSel=<mark>, StopSel=</mark>, MaxFragments=3, MaxWords=50, MinWords=15') as highlighted_description
      FROM "Comics" c
      WHERE c.search_vector @@ to_tsquery(${tsqueryConfig}::regconfig, ${formattedQuery})
      ${statusCondition}
      ${genreCondition}
      ${sortOrder}
      LIMIT ${limit} OFFSET ${skip}
    `;

    // Count total results - use a simpler query to avoid deserialization issues
    const totalResult = await prisma.$queryRaw<[{count: bigint}]>`
      SELECT COUNT(c.id) as count
      FROM "Comics" c
      WHERE c.search_vector @@ to_tsquery(${tsqueryConfig}::regconfig, ${formattedQuery})
      ${statusCondition}
      ${genreCondition}
    `;

    const totalComics = Number(totalResult[0].count);

    // Get comic IDs from the search results
    const comicIds = comicsResult.map(comic => comic.id);

    // If no results found, return empty array
    if (comicIds.length === 0) {
      return {
        comics: [],
        totalPages: 0,
        currentPage: page,
        totalComics: 0,
        searchTerms: queryWords
      };
    }

    // Fetch related data for comics
    const comicsWithRelations = await prisma.comics.findMany({
      where: {
        id: { in: comicIds }
      },
      include: {
        Comic_Genres: {
          include: {
            Genres: true
          }
        },
        Chapters: {
          orderBy: {
            chapter_number: 'desc'
          },
          take: 1,
          select: {
            id: true,
            chapter_number: true,
            title: true,
            slug: true,
            release_date: true
          }
        }
      }
    });

    // Sort the results to match the original ranking
    const comicsInOrder = comicIds.map(id =>
      comicsWithRelations.find(comic => comic.id === id)
    ).filter(Boolean);

    // Add rank and highlighting information to the results
    const comicsWithRank = comicsInOrder.map((comic, index) => ({
      ...comic,
      rank: comicsResult[index].rank,
      _highlightedTitle: comicsResult[index].highlighted_title,
      _highlightedDescription: comicsResult[index].highlighted_description
    }));

    // Get chapter counts for each manga
    const comicsWithChapterCounts = await Promise.all(
      comicsWithRank.map(async (comic) => {
        const chapterCount = await prisma.chapters.count({
          where: { comic_id: comic.id }
        });
        return {
          ...comic,
          _chapterCount: chapterCount
        };
      })
    );

    return {
      comics: comicsWithChapterCounts,
      totalPages: Math.ceil(totalComics / limit),
      currentPage: page,
      totalComics,
      searchTerms: queryWords
    };
  },
  ['search'],
  { revalidate: CACHE_TTL }
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const genre = searchParams.get('genre')
    const status = searchParams.get('status')
    const sort = searchParams.get('sort')

    // Return empty results if no query is provided
    if (!query) {
      return NextResponse.json({
        comics: [],
        totalPages: 0,
        currentPage: 1,
        totalComics: 0
      })
    }

    try {
      // Use the cached search function
      const results = await cachedSearch({
        query,
        page,
        limit,
        genre,
        status,
        sort
      })

      return NextResponse.json(results)
    } catch (error) {
      console.error("[API_SEARCH_QUERY_ERROR]", error);
      return NextResponse.json(
        { error: 'Invalid search query', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("[API_SEARCH_GET]", error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

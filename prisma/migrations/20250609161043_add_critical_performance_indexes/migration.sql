-- Critical Performance Indexes for Homepage Speed Optimization
-- These indexes are specifically designed to fix homepage delay issues

-- ✅ CRITICAL: Index for latest manga sort (homepage main query)
-- This fixes the slow "ORDER BY last_chapter_uploaded_at DESC NULLS LAST" query
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_comics_latest_sort_nulls_last" 
ON "Comics" ("last_chapter_uploaded_at" DESC NULLS LAST, "created_at" DESC);

-- ✅ CRITICAL: Index for chapter counting (N+1 query fix)
-- This fixes the slow chapter count queries for each manga
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_chapters_comic_count_optimized" 
ON "Chapters" ("comic_id") INCLUDE ("id");

-- ✅ CRITICAL: Index for latest chapter lookup per manga
-- This optimizes the "take: 1" chapter query in manga listing
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_chapters_latest_per_comic" 
ON "Chapters" ("comic_id", "chapter_number" DESC) INCLUDE ("title", "slug", "release_date");

-- ✅ Index for alphabetical sorting (if not exists)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_comics_title_asc" 
ON "Comics" ("title" ASC);

-- ✅ Index for status filtering (if not exists)  
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_comics_status_filter" 
ON "Comics" ("status");

-- ✅ Composite index for genre + sort combinations
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_comic_genres_with_sort" 
ON "Comic_Genres" ("genre_id", "comic_id") 
INCLUDE ("comic_id");

-- ✅ Index for search vector (if not exists)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_comics_search_gin" 
ON "Comics" USING gin("search_vector");

-- ✅ Update statistics for better query planning
ANALYZE "Comics";
ANALYZE "Chapters"; 
ANALYZE "Comic_Genres";

-- AlterTable
ALTER TABLE "Chapters" ADD COLUMN     "daily_views" INTEGER DEFAULT 0,
ADD COLUMN     "monthly_views" INTEGER DEFAULT 0,
ADD COLUMN     "weekly_views" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "Comics" ADD COLUMN     "daily_views" INTEGER DEFAULT 0,
ADD COLUMN     "monthly_views" INTEGER DEFAULT 0,
ADD COLUMN     "weekly_views" INTEGER DEFAULT 0;

-- CreateTable
CREATE TABLE "View_Statistics" (
    "id" BIGSERIAL NOT NULL,
    "entity_type" VARCHAR(20) NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "daily_views" INTEGER NOT NULL DEFAULT 0,
    "weekly_views" INTEGER NOT NULL DEFAULT 0,
    "monthly_views" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "View_Statistics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_view_stats_entity_date" ON "View_Statistics"("entity_type", "entity_id", "date" DESC);

-- CreateIndex
CREATE INDEX "idx_view_stats_date" ON "View_Statistics"("date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "View_Statistics_entity_type_entity_id_date_key" ON "View_Statistics"("entity_type", "entity_id", "date");

-- CreateIndex
CREATE INDEX "idx_chapter_views_viewed_at" ON "Chapter_Views"("viewed_at" DESC);

-- CreateIndex
CREATE INDEX "idx_comic_views_viewed_at" ON "Comic_Views"("viewed_at" DESC);

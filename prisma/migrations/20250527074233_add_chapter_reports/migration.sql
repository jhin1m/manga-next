-- CreateTable
CREATE TABLE "ChapterReport" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "chapter_id" INTEGER NOT NULL,
    "reason" VARCHAR(255) NOT NULL,
    "details" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChapterReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_chapter_reports_chapter_id" ON "ChapterReport"("chapter_id");

-- CreateIndex
CREATE INDEX "idx_chapter_reports_status" ON "ChapterReport"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ChapterReport_user_id_chapter_id_key" ON "ChapterReport"("user_id", "chapter_id");

-- AddForeignKey
ALTER TABLE "ChapterReport" ADD CONSTRAINT "ChapterReport_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterReport" ADD CONSTRAINT "ChapterReport_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "Chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

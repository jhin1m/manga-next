/*
  Warnings:

  - Changed the type of `chapter_number` on the `Chapters` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Chapters" DROP COLUMN "chapter_number",
ADD COLUMN     "chapter_number" DOUBLE PRECISION NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Chapters_comic_id_chapter_number_key" ON "Chapters"("comic_id", "chapter_number");

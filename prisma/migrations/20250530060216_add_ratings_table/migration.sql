-- CreateTable
CREATE TABLE "Ratings" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "comic_id" INTEGER NOT NULL,
    "rating" REAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_ratings_comic_id" ON "Ratings"("comic_id");

-- CreateIndex
CREATE INDEX "idx_ratings_user_id" ON "Ratings"("user_id");

-- CreateIndex
CREATE INDEX "idx_ratings_rating" ON "Ratings"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "Ratings_user_id_comic_id_key" ON "Ratings"("user_id", "comic_id");

-- AddForeignKey
ALTER TABLE "Ratings" ADD CONSTRAINT "Ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ratings" ADD CONSTRAINT "Ratings_comic_id_fkey" FOREIGN KEY ("comic_id") REFERENCES "Comics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

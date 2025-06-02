-- CreateIndex
CREATE INDEX "idx_comic_genres_genre_id" ON "Comic_Genres"("genre_id");

-- CreateIndex
CREATE INDEX "idx_comic_genres_comic_id" ON "Comic_Genres"("comic_id");

-- CreateIndex
CREATE INDEX "idx_comics_total_views_desc" ON "Comics"("total_views" DESC);

-- CreateIndex
CREATE INDEX "idx_comics_total_favorites_desc" ON "Comics"("total_favorites" DESC);

-- CreateIndex
CREATE INDEX "idx_comics_status_last_chapter" ON "Comics"("status", "last_chapter_uploaded_at" DESC);

-- CreateIndex
CREATE INDEX "idx_comics_status_total_views" ON "Comics"("status", "total_views" DESC);

-- CreateIndex
CREATE INDEX "idx_comics_created_at_desc" ON "Comics"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_comments_comic_status_created" ON "Comments"("comic_id", "status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_comments_chapter_status_created" ON "Comments"("chapter_id", "status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_comments_likes_created" ON "Comments"("likes_count" DESC, "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_comments_status_created_at" ON "Comments"("status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_favorites_user_id_created_at" ON "Favorites"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_favorites_comic_id_created_at" ON "Favorites"("comic_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_reading_progress_user_updated" ON "Reading_Progress"("user_id", "updated_at" DESC);

-- CreateIndex
CREATE INDEX "idx_reading_progress_comic_updated" ON "Reading_Progress"("comic_id", "updated_at" DESC);

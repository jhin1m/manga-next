-- CreateTable
CREATE TABLE "Authors" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "bio" TEXT,
    "avatar_url" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Authors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chapter_Views" (
    "id" BIGSERIAL NOT NULL,
    "chapter_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "viewed_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chapter_Views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chapters" (
    "id" SERIAL NOT NULL,
    "comic_id" INTEGER NOT NULL,
    "chapter_number" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255),
    "slug" VARCHAR(255) NOT NULL,
    "release_date" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "view_count" INTEGER DEFAULT 0,
    "uploader_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comic_Authors" (
    "comic_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,
    "role" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comic_Authors_pkey" PRIMARY KEY ("comic_id","author_id","role")
);

-- CreateTable
CREATE TABLE "Comic_Genres" (
    "comic_id" INTEGER NOT NULL,
    "genre_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comic_Genres_pkey" PRIMARY KEY ("comic_id","genre_id")
);

-- CreateTable
CREATE TABLE "Comic_Publishers" (
    "comic_id" INTEGER NOT NULL,
    "publisher_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comic_Publishers_pkey" PRIMARY KEY ("comic_id","publisher_id")
);

-- CreateTable
CREATE TABLE "Comic_Views" (
    "id" BIGSERIAL NOT NULL,
    "comic_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "viewed_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comic_Views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comics" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "alternative_titles" JSONB,
    "description" TEXT,
    "cover_image_url" VARCHAR(255),
    "status" VARCHAR(50) NOT NULL DEFAULT 'ongoing',
    "release_date" DATE,
    "country_of_origin" VARCHAR(100),
    "age_rating" VARCHAR(50),
    "total_views" INTEGER DEFAULT 0,
    "total_favorites" INTEGER DEFAULT 0,
    "last_chapter_uploaded_at" TIMESTAMPTZ(6),
    "uploader_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comments" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "comic_id" INTEGER,
    "chapter_id" INTEGER,
    "parent_comment_id" INTEGER,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorites" (
    "user_id" INTEGER NOT NULL,
    "comic_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorites_pkey" PRIMARY KEY ("user_id","comic_id")
);

-- CreateTable
CREATE TABLE "Genres" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Genres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pages" (
    "id" SERIAL NOT NULL,
    "chapter_id" INTEGER NOT NULL,
    "page_number" INTEGER NOT NULL,
    "image_url" VARCHAR(255) NOT NULL,
    "image_alt_text" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Publishers" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "logo_url" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Publishers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reading_Progress" (
    "user_id" INTEGER NOT NULL,
    "comic_id" INTEGER NOT NULL,
    "last_read_chapter_id" INTEGER,
    "last_read_page_number" INTEGER,
    "progress_percentage" REAL,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reading_Progress_pkey" PRIMARY KEY ("user_id","comic_id")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "avatar_url" VARCHAR(255),
    "role" VARCHAR(50) NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Authors_slug_key" ON "Authors"("slug");

-- CreateIndex
CREATE INDEX "idx_chapter_views_chapter_id_viewed_at" ON "Chapter_Views"("chapter_id", "viewed_at" DESC);

-- CreateIndex
CREATE INDEX "idx_chapters_comic_id_release_date" ON "Chapters"("comic_id", "release_date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Chapters_comic_id_chapter_number_key" ON "Chapters"("comic_id", "chapter_number");

-- CreateIndex
CREATE UNIQUE INDEX "Chapters_comic_id_slug_key" ON "Chapters"("comic_id", "slug");

-- CreateIndex
CREATE INDEX "idx_comic_views_comic_id_viewed_at" ON "Comic_Views"("comic_id", "viewed_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Comics_slug_key" ON "Comics"("slug");

-- CreateIndex
CREATE INDEX "idx_comics_last_chapter_uploaded_at" ON "Comics"("last_chapter_uploaded_at" DESC);

-- CreateIndex
CREATE INDEX "idx_comics_status" ON "Comics"("status");

-- CreateIndex
CREATE INDEX "idx_comics_title" ON "Comics"("title");

-- CreateIndex
CREATE INDEX "idx_comments_chapter_id_created_at" ON "Comments"("chapter_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_comments_comic_id_created_at" ON "Comments"("comic_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_comments_user_id" ON "Comments"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Genres_name_key" ON "Genres"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Genres_slug_key" ON "Genres"("slug");

-- CreateIndex
CREATE INDEX "idx_pages_chapter_id_page_number" ON "Pages"("chapter_id", "page_number");

-- CreateIndex
CREATE UNIQUE INDEX "Pages_chapter_id_page_number_key" ON "Pages"("chapter_id", "page_number");

-- CreateIndex
CREATE UNIQUE INDEX "Publishers_name_key" ON "Publishers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Publishers_slug_key" ON "Publishers"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- AddForeignKey
ALTER TABLE "Chapter_Views" ADD CONSTRAINT "Chapter_Views_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "Chapters"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Chapter_Views" ADD CONSTRAINT "Chapter_Views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Chapters" ADD CONSTRAINT "Chapters_comic_id_fkey" FOREIGN KEY ("comic_id") REFERENCES "Comics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Chapters" ADD CONSTRAINT "Chapters_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Comic_Authors" ADD CONSTRAINT "Comic_Authors_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "Authors"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Comic_Authors" ADD CONSTRAINT "Comic_Authors_comic_id_fkey" FOREIGN KEY ("comic_id") REFERENCES "Comics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Comic_Genres" ADD CONSTRAINT "Comic_Genres_comic_id_fkey" FOREIGN KEY ("comic_id") REFERENCES "Comics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Comic_Genres" ADD CONSTRAINT "Comic_Genres_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "Genres"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Comic_Publishers" ADD CONSTRAINT "Comic_Publishers_comic_id_fkey" FOREIGN KEY ("comic_id") REFERENCES "Comics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Comic_Publishers" ADD CONSTRAINT "Comic_Publishers_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "Publishers"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Comic_Views" ADD CONSTRAINT "Comic_Views_comic_id_fkey" FOREIGN KEY ("comic_id") REFERENCES "Comics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Comic_Views" ADD CONSTRAINT "Comic_Views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Comics" ADD CONSTRAINT "Comics_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "Chapters"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_comic_id_fkey" FOREIGN KEY ("comic_id") REFERENCES "Comics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "Comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Favorites" ADD CONSTRAINT "Favorites_comic_id_fkey" FOREIGN KEY ("comic_id") REFERENCES "Comics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Favorites" ADD CONSTRAINT "Favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Pages" ADD CONSTRAINT "Pages_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "Chapters"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Reading_Progress" ADD CONSTRAINT "Reading_Progress_comic_id_fkey" FOREIGN KEY ("comic_id") REFERENCES "Comics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Reading_Progress" ADD CONSTRAINT "Reading_Progress_last_read_chapter_id_fkey" FOREIGN KEY ("last_read_chapter_id") REFERENCES "Chapters"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Reading_Progress" ADD CONSTRAINT "Reading_Progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

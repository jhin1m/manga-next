-- Database Schema for Next.js Comic Website

-- Users Table: Stores user information
CREATE TABLE "Users" (
  "id" SERIAL PRIMARY KEY,
  "username" VARCHAR(255) UNIQUE NOT NULL,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "password_hash" VARCHAR(255) NOT NULL,
  "avatar_url" VARCHAR(255),
  "role" VARCHAR(50) NOT NULL DEFAULT 'user', -- e.g., 'user', 'admin', 'moderator'
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Genres Table: Stores comic genres
CREATE TABLE "Genres" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) UNIQUE NOT NULL,
  "slug" VARCHAR(255) UNIQUE NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Authors Table: Stores comic authors/artists
CREATE TABLE "Authors" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255) UNIQUE NOT NULL,
  "bio" TEXT,
  "avatar_url" VARCHAR(255),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Publishers Table: Stores comic publishers
CREATE TABLE "Publishers" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) UNIQUE NOT NULL,
  "slug" VARCHAR(255) UNIQUE NOT NULL,
  "description" TEXT,
  "logo_url" VARCHAR(255),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comics Table: Stores main comic information
CREATE TABLE "Comics" (
  "id" SERIAL PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255) UNIQUE NOT NULL,
  "alternative_titles" JSONB, -- Stores an array of alternative titles
  "description" TEXT,
  "cover_image_url" VARCHAR(255),
  "status" VARCHAR(50) NOT NULL DEFAULT 'ongoing', -- e.g., 'ongoing', 'completed', 'hiatus', 'cancelled'
  "release_date" DATE,
  "country_of_origin" VARCHAR(100),
  "age_rating" VARCHAR(50),
  "total_views" INTEGER DEFAULT 0,
  "total_favorites" INTEGER DEFAULT 0,
  "last_chapter_uploaded_at" TIMESTAMP WITH TIME ZONE,
  "uploader_id" INTEGER REFERENCES "Users"("id") ON DELETE SET NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chapters Table: Stores comic chapters
CREATE TABLE "Chapters" (
  "id" SERIAL PRIMARY KEY,
  "comic_id" INTEGER NOT NULL REFERENCES "Comics"("id") ON DELETE CASCADE,
  "chapter_number" VARCHAR(50) NOT NULL, -- To support '10.5', 'Extra 1'
  "title" VARCHAR(255),
  "slug" VARCHAR(255) NOT NULL, -- Should be unique within a comic
  "release_date" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "view_count" INTEGER DEFAULT 0,
  "uploader_id" INTEGER REFERENCES "Users"("id") ON DELETE SET NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("comic_id", "slug"),
  UNIQUE ("comic_id", "chapter_number")
);

-- Pages Table: Stores individual pages of a chapter
CREATE TABLE "Pages" (
  "id" SERIAL PRIMARY KEY,
  "chapter_id" INTEGER NOT NULL REFERENCES "Chapters"("id") ON DELETE CASCADE,
  "page_number" INTEGER NOT NULL,
  "image_url" VARCHAR(255) NOT NULL,
  "image_alt_text" VARCHAR(255),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("chapter_id", "page_number")
);

-- Comic_Genres Junction Table: Many-to-many relationship between Comics and Genres
CREATE TABLE "Comic_Genres" (
  "comic_id" INTEGER NOT NULL REFERENCES "Comics"("id") ON DELETE CASCADE,
  "genre_id" INTEGER NOT NULL REFERENCES "Genres"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("comic_id", "genre_id")
);

-- Comic_Authors Junction Table: Many-to-many relationship between Comics and Authors
CREATE TABLE "Comic_Authors" (
  "comic_id" INTEGER NOT NULL REFERENCES "Comics"("id") ON DELETE CASCADE,
  "author_id" INTEGER NOT NULL REFERENCES "Authors"("id") ON DELETE CASCADE,
  "role" VARCHAR(100), -- e.g., 'Story', 'Art'
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("comic_id", "author_id", "role") -- Role included in PK if one author can have multiple roles for same comic
);

-- Comic_Publishers Junction Table: Many-to-many relationship between Comics and Publishers
CREATE TABLE "Comic_Publishers" (
  "comic_id" INTEGER NOT NULL REFERENCES "Comics"("id") ON DELETE CASCADE,
  "publisher_id" INTEGER NOT NULL REFERENCES "Publishers"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("comic_id", "publisher_id")
);

-- Comments Table: Stores user comments on comics or chapters
CREATE TABLE "Comments" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
  "comic_id" INTEGER REFERENCES "Comics"("id") ON DELETE CASCADE,
  "chapter_id" INTEGER REFERENCES "Chapters"("id") ON DELETE CASCADE,
  "parent_comment_id" INTEGER REFERENCES "Comments"("id") ON DELETE CASCADE,
  "content" TEXT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "chk_comment_target" CHECK (("comic_id" IS NOT NULL AND "chapter_id" IS NULL) OR ("comic_id" IS NULL AND "chapter_id" IS NOT NULL) OR ("comic_id" IS NOT NULL AND "chapter_id" IS NOT NULL AND "parent_comment_id" IS NOT NULL)) -- Simplified: ensure at least one target, or allow chapter comments to also link to comic_id for easier queries.
  -- A more precise check might be needed depending on business logic for where comments can be placed.
);

-- Favorites Table: Stores user's favorite comics
CREATE TABLE "Favorites" (
  "user_id" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
  "comic_id" INTEGER NOT NULL REFERENCES "Comics"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("user_id", "comic_id")
);

-- Reading_Progress Table: Tracks user's reading progress for comics
CREATE TABLE "Reading_Progress" (
  "user_id" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
  "comic_id" INTEGER NOT NULL REFERENCES "Comics"("id") ON DELETE CASCADE,
  "last_read_chapter_id" INTEGER REFERENCES "Chapters"("id") ON DELETE SET NULL,
  "last_read_page_number" INTEGER,
  "progress_percentage" REAL CHECK ("progress_percentage" >= 0 AND "progress_percentage" <= 100),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("user_id", "comic_id")
);

-- Comic_Views Table: Tracks views for comics (can be aggregated)
CREATE TABLE "Comic_Views" (
  "id" BIGSERIAL PRIMARY KEY,
  "comic_id" INTEGER NOT NULL REFERENCES "Comics"("id") ON DELETE CASCADE,
  "user_id" INTEGER REFERENCES "Users"("id") ON DELETE SET NULL, -- For logged-in users
  "ip_address" VARCHAR(45), -- For anonymous users (consider GDPR)
  "user_agent" TEXT,
  "viewed_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chapter_Views Table: Tracks views for chapters (can be aggregated)
CREATE TABLE "Chapter_Views" (
  "id" BIGSERIAL PRIMARY KEY,
  "chapter_id" INTEGER NOT NULL REFERENCES "Chapters"("id") ON DELETE CASCADE,
  "user_id" INTEGER REFERENCES "Users"("id") ON DELETE SET NULL,
  "ip_address" VARCHAR(45),
  "user_agent" TEXT,
  "viewed_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX "idx_comics_title" ON "Comics"("title");
CREATE INDEX "idx_comics_status" ON "Comics"("status");
CREATE INDEX "idx_comics_last_chapter_uploaded_at" ON "Comics"("last_chapter_uploaded_at" DESC);

CREATE INDEX "idx_chapters_comic_id_release_date" ON "Chapters"("comic_id", "release_date" DESC);

CREATE INDEX "idx_pages_chapter_id_page_number" ON "Pages"("chapter_id", "page_number");

CREATE INDEX "idx_comments_comic_id_created_at" ON "Comments"("comic_id", "created_at" DESC);
CREATE INDEX "idx_comments_chapter_id_created_at" ON "Comments"("chapter_id", "created_at" DESC);
CREATE INDEX "idx_comments_user_id" ON "Comments"("user_id");

CREATE INDEX "idx_comic_views_comic_id_viewed_at" ON "Comic_Views"("comic_id", "viewed_at" DESC);
CREATE INDEX "idx_chapter_views_chapter_id_viewed_at" ON "Chapter_Views"("chapter_id", "viewed_at" DESC);

-- Trigger function to update Comics.updated_at and Comics.last_chapter_uploaded_at
CREATE OR REPLACE FUNCTION update_comic_on_chapter_change()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE "Comics"
    SET "updated_at" = CURRENT_TIMESTAMP,
        "last_chapter_uploaded_at" = NEW."release_date"
    WHERE "id" = NEW."comic_id";
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trigger_update_comic_on_chapter_insert_update"
AFTER INSERT OR UPDATE ON "Chapters"
FOR EACH ROW
EXECUTE FUNCTION update_comic_on_chapter_change();

-- Trigger function to update generic updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updated_at" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the updated_at trigger to relevant tables
CREATE TRIGGER "trigger_users_updated_at" BEFORE UPDATE ON "Users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER "trigger_genres_updated_at" BEFORE UPDATE ON "Genres" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER "trigger_authors_updated_at" BEFORE UPDATE ON "Authors" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER "trigger_publishers_updated_at" BEFORE UPDATE ON "Publishers" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER "trigger_comics_updated_at" BEFORE UPDATE ON "Comics" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER "trigger_chapters_updated_at" BEFORE UPDATE ON "Chapters" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER "trigger_comments_updated_at" BEFORE UPDATE ON "Comments" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER "trigger_reading_progress_updated_at" BEFORE UPDATE ON "Reading_Progress" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();



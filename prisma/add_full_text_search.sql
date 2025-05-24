-- Add tsvector column to Comics table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'Comics' AND column_name = 'search_vector'
    ) THEN
        ALTER TABLE "Comics" ADD COLUMN search_vector tsvector;

        -- Create GIN index on the tsvector column for faster searching
        CREATE INDEX idx_comics_search_vector ON "Comics" USING GIN(search_vector);

        -- Update existing records with search vector data
        -- Use 'simple' configuration to better handle non-English characters
        UPDATE "Comics" SET search_vector =
            setweight(to_tsvector('simple'::regconfig, coalesce(title, '')), 'A') ||
            setweight(to_tsvector('simple'::regconfig, coalesce(description, '')), 'B') ||
            setweight(to_tsvector('simple'::regconfig, coalesce(cast(alternative_titles as text), '')), 'C');
    END IF;
END
$$;

-- Create a function to update search_vector when a comic is updated
CREATE OR REPLACE FUNCTION update_comics_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector =
        setweight(to_tsvector('simple'::regconfig, coalesce(NEW.title, '')), 'A') ||
        setweight(to_tsvector('simple'::regconfig, coalesce(NEW.description, '')), 'B') ||
        setweight(to_tsvector('simple'::regconfig, coalesce(cast(NEW.alternative_titles as text), '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update search_vector if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_trigger
        WHERE tgname = 'trigger_update_comics_search_vector'
    ) THEN
        CREATE TRIGGER trigger_update_comics_search_vector
        BEFORE INSERT OR UPDATE ON "Comics"
        FOR EACH ROW
        EXECUTE FUNCTION update_comics_search_vector();
    END IF;
END
$$;

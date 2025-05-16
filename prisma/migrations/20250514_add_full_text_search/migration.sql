-- Add tsvector column to Comics table
ALTER TABLE "Comics" ADD COLUMN search_vector tsvector;

-- Create GIN index on the tsvector column for faster searching
CREATE INDEX idx_comics_search_vector ON "Comics" USING GIN(search_vector);

-- Update existing records with search vector data
UPDATE "Comics" SET search_vector = 
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(cast(alternative_titles as text), '')), 'C');

-- Create a function to update search_vector when a comic is updated
CREATE OR REPLACE FUNCTION update_comics_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector = 
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(cast(NEW.alternative_titles as text), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update search_vector
CREATE TRIGGER trigger_update_comics_search_vector
BEFORE INSERT OR UPDATE ON "Comics"
FOR EACH ROW
EXECUTE FUNCTION update_comics_search_vector();

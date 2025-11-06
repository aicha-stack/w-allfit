-- Add image_url column to programs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='programs' AND column_name='image_url'
  ) THEN
    ALTER TABLE programs ADD COLUMN image_url VARCHAR(500);
  END IF;
END $$;


-- Ensure progress and created_at columns exist in enrollments table
DO $$
BEGIN
  -- Add progress column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='enrollments' AND column_name='progress'
  ) THEN
    ALTER TABLE enrollments ADD COLUMN progress INTEGER DEFAULT 0;
  END IF;
  
  -- Add created_at column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='enrollments' AND column_name='created_at'
  ) THEN
    ALTER TABLE enrollments ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;


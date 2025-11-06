-- Add updated_at column to workout_logs table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workout_logs' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE workout_logs 
    ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    
    -- Add trigger to auto-update updated_at
    CREATE TRIGGER update_workout_logs_updated_at 
        BEFORE UPDATE ON workout_logs 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;


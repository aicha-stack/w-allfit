-- Allow day_of_week to be NULL if scheduled_date is provided
-- This allows more flexibility in scheduling workouts

DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  -- Check if day_of_week column exists and is NOT NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workout_schedule' 
    AND column_name = 'day_of_week' 
    AND is_nullable = 'NO'
  ) THEN
    -- Find and drop the existing unique constraint
    -- PostgreSQL creates constraint names automatically, so we need to find it
    SELECT conname INTO constraint_name
    FROM pg_constraint 
    WHERE conrelid = 'workout_schedule'::regclass 
    AND contype = 'u'
    AND array_length(conkey, 1) = 3; -- Should have 3 columns (user_id, day_of_week, scheduled_date)
    
    IF constraint_name IS NOT NULL THEN
      EXECUTE format('ALTER TABLE workout_schedule DROP CONSTRAINT IF EXISTS %I', constraint_name);
    END IF;
    
    -- Make day_of_week nullable
    ALTER TABLE workout_schedule 
    ALTER COLUMN day_of_week DROP NOT NULL;
    
    -- Update the check constraint to allow NULL
    ALTER TABLE workout_schedule 
    DROP CONSTRAINT IF EXISTS workout_schedule_day_of_week_check;
    
    ALTER TABLE workout_schedule 
    ADD CONSTRAINT workout_schedule_day_of_week_check 
    CHECK (day_of_week IS NULL OR (day_of_week >= 0 AND day_of_week <= 6));
    
    -- Recreate unique constraint using a unique index that handles NULLs
    -- PostgreSQL unique constraints treat NULLs as distinct, but we want to prevent duplicates
    -- So we use a unique index with COALESCE to handle NULLs
    DROP INDEX IF EXISTS workout_schedule_user_day_date_unique;
    
    CREATE UNIQUE INDEX workout_schedule_user_day_date_unique 
    ON workout_schedule (user_id, COALESCE(day_of_week, -1), COALESCE(scheduled_date, '1970-01-01'::date));
  END IF;
END $$;


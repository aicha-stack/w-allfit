-- Add additional constraints and validations

-- Ensure progress is between 0 and 100
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'enrollments_progress_check'
  ) THEN
    ALTER TABLE enrollments 
    ADD CONSTRAINT enrollments_progress_check 
    CHECK (progress >= 0 AND progress <= 100);
  END IF;
END $$;

-- Ensure duration is positive if provided
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'programs_duration_check'
  ) THEN
    ALTER TABLE programs 
    ADD CONSTRAINT programs_duration_check 
    CHECK (duration IS NULL OR duration > 0);
  END IF;
END $$;

-- Ensure email format (basic check)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_email_format_check'
  ) THEN
    ALTER TABLE users 
    ADD CONSTRAINT users_email_format_check 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;
END $$;

-- Ensure name is not empty
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_name_check'
  ) THEN
    ALTER TABLE users 
    ADD CONSTRAINT users_name_check 
    CHECK (char_length(trim(name)) >= 2);
  END IF;
END $$;

-- Ensure title is not empty
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'programs_title_check'
  ) THEN
    ALTER TABLE programs 
    ADD CONSTRAINT programs_title_check 
    CHECK (char_length(trim(title)) >= 3);
  END IF;
END $$;


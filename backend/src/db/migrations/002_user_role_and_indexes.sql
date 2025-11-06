-- Add role to users (default user)
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user';

-- Indexes / constraints
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_program ON enrollments(program_id);

-- Ensure unique constraint on enrollments (user_id, program_id)
DO $$
BEGIN
  -- Check if constraint exists by name
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'enrollments_user_id_program_id_key'
  ) THEN
    -- Check if constraint exists by columns (might have different name)
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint c
      JOIN pg_class t ON c.conrelid = t.oid
      JOIN pg_attribute a1 ON a1.attrelid = t.oid AND a1.attname = 'user_id'
      JOIN pg_attribute a2 ON a2.attrelid = t.oid AND a2.attname = 'program_id'
      WHERE t.relname = 'enrollments' 
      AND c.contype = 'u'
      AND array_length(c.conkey, 1) = 2
      AND a1.attnum = ANY(c.conkey)
      AND a2.attnum = ANY(c.conkey)
    ) THEN
      ALTER TABLE enrollments 
      ADD CONSTRAINT enrollments_user_id_program_id_key 
      UNIQUE (user_id, program_id);
    END IF;
  END IF;
END $$;


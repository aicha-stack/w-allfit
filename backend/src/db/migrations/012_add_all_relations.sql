-- Migration to ensure all foreign key relationships are properly defined
-- This migration adds any missing foreign key constraints and indexes

-- Ensure all foreign keys exist with proper constraints

-- Recipes: Ensure user_id foreign key exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'recipes_user_id_fkey' 
    AND conrelid = 'recipes'::regclass
  ) THEN
    ALTER TABLE recipes 
    ADD CONSTRAINT recipes_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Community posts: Ensure program_id foreign key exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'community_posts_program_id_fkey' 
    AND conrelid = 'community_posts'::regclass
  ) THEN
    ALTER TABLE community_posts 
    ADD CONSTRAINT community_posts_program_id_fkey 
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add index on community_posts program_id if missing
CREATE INDEX IF NOT EXISTS idx_community_posts_program ON community_posts(program_id) WHERE program_id IS NOT NULL;

-- Ensure enrollment_id foreign keys exist in workout_schedule
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'workout_schedule_enrollment_id_fkey' 
    AND conrelid = 'workout_schedule'::regclass
  ) THEN
    ALTER TABLE workout_schedule 
    ADD CONSTRAINT workout_schedule_enrollment_id_fkey 
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Ensure enrollment_id foreign keys exist in results
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'results_enrollment_id_fkey' 
    AND conrelid = 'results'::regclass
  ) THEN
    ALTER TABLE results 
    ADD CONSTRAINT results_enrollment_id_fkey 
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add additional indexes for better query performance

-- Index on recipes for better search
CREATE INDEX IF NOT EXISTS idx_recipes_created ON recipes(created_at DESC);

-- Index on workout_schedule for enrollment filtering
CREATE INDEX IF NOT EXISTS idx_workout_schedule_enrollment ON workout_schedule(enrollment_id) WHERE enrollment_id IS NOT NULL;

-- Index on results for enrollment filtering
CREATE INDEX IF NOT EXISTS idx_results_enrollment ON results(enrollment_id) WHERE enrollment_id IS NOT NULL;

-- Add check constraints for data integrity

-- Ensure progress is between 0 and 100 in enrollments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'enrollments_progress_check' 
    AND conrelid = 'enrollments'::regclass
  ) THEN
    ALTER TABLE enrollments 
    ADD CONSTRAINT enrollments_progress_check 
    CHECK (progress >= 0 AND progress <= 100);
  END IF;
END $$;

-- Ensure progress is between 0 and 100 in challenge_participants
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'challenge_participants_progress_check' 
    AND conrelid = 'challenge_participants'::regclass
  ) THEN
    ALTER TABLE challenge_participants 
    ADD CONSTRAINT challenge_participants_progress_check 
    CHECK (progress >= 0);
  END IF;
END $$;

-- Ensure dates are valid in challenges
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'challenges_dates_check' 
    AND conrelid = 'challenges'::regclass
  ) THEN
    ALTER TABLE challenges 
    ADD CONSTRAINT challenges_dates_check 
    CHECK (end_date >= start_date);
  END IF;
END $$;

-- Ensure nutrition values are non-negative
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'nutrition_logs_values_check' 
    AND conrelid = 'nutrition_logs'::regclass
  ) THEN
    ALTER TABLE nutrition_logs 
    ADD CONSTRAINT nutrition_logs_values_check 
    CHECK (calories >= 0 AND protein_g >= 0 AND carbs_g >= 0 AND fat_g >= 0);
  END IF;
END $$;

-- Ensure nutrition goals percentages sum to 100
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'nutrition_goals_percentages_check' 
    AND conrelid = 'nutrition_goals'::regclass
  ) THEN
    ALTER TABLE nutrition_goals 
    ADD CONSTRAINT nutrition_goals_percentages_check 
    CHECK (protein_percent + carbs_percent + fat_percent = 100);
  END IF;
END $$;

-- Ensure recipe values are non-negative
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'recipes_values_check' 
    AND conrelid = 'recipes'::regclass
  ) THEN
    ALTER TABLE recipes 
    ADD CONSTRAINT recipes_values_check 
    CHECK (
      (calories IS NULL OR calories >= 0) AND
      (protein_g IS NULL OR protein_g >= 0) AND
      (carbs_g IS NULL OR carbs_g >= 0) AND
      (fat_g IS NULL OR fat_g >= 0) AND
      (prep_time IS NULL OR prep_time >= 0) AND
      (servings IS NULL OR servings > 0)
    );
  END IF;
END $$;

-- Add updated_at trigger for tables that need it
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_recipes_updated_at ON recipes;
CREATE TRIGGER update_recipes_updated_at 
    BEFORE UPDATE ON recipes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_community_posts_updated_at ON community_posts;
CREATE TRIGGER update_community_posts_updated_at 
    BEFORE UPDATE ON community_posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_post_comments_updated_at ON post_comments;
CREATE TRIGGER update_post_comments_updated_at 
    BEFORE UPDATE ON post_comments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_nutrition_goals_updated_at ON nutrition_goals;
CREATE TRIGGER update_nutrition_goals_updated_at 
    BEFORE UPDATE ON nutrition_goals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();


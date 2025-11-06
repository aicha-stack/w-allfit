-- Weekly planner for scheduling workouts
CREATE TABLE IF NOT EXISTS workout_schedule (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  program_id INTEGER REFERENCES programs(id) ON DELETE SET NULL,
  enrollment_id INTEGER REFERENCES enrollments(id) ON DELETE SET NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Monday, 6=Sunday
  workout_type VARCHAR(100), -- CARDIO, STRENGTH, MOBILITY, etc.
  workout_name VARCHAR(200),
  scheduled_date DATE,
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, day_of_week, scheduled_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workout_schedule_user ON workout_schedule(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_schedule_date ON workout_schedule(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_workout_schedule_day ON workout_schedule(day_of_week);


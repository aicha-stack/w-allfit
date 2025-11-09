-- Daily mood tracking table
CREATE TABLE IF NOT EXISTS daily_moods (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood_type VARCHAR(50) NOT NULL CHECK (mood_type IN ('happy', 'excited', 'good', 'calm', 'tired', 'sad', 'stressed', 'motivated')),
  message TEXT,
  mood_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, mood_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_daily_moods_user ON daily_moods(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_moods_date ON daily_moods(mood_date);
CREATE INDEX IF NOT EXISTS idx_daily_moods_user_date ON daily_moods(user_id, mood_date);


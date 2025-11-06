-- Recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- NULL for system recipes
  title VARCHAR(200) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  calories INTEGER,
  protein_g INTEGER,
  carbs_g INTEGER,
  fat_g INTEGER,
  prep_time INTEGER, -- in minutes
  servings INTEGER,
  ingredients TEXT[], -- Array of ingredients
  instructions TEXT,
  tags VARCHAR(50)[], -- Array of tags like 'breakfast', 'vegan', etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_recipes_user ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_tags ON recipes USING GIN(tags);


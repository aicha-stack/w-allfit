-- Add personal information columns for women's health tracking
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS weight DECIMAL(5,2), -- Weight in kg (e.g., 65.50)
ADD COLUMN IF NOT EXISTS height DECIMAL(5,2), -- Height in cm (e.g., 165.00)
ADD COLUMN IF NOT EXISTS menstrual_cycle_start_date DATE, -- Last period start date
ADD COLUMN IF NOT EXISTS menstrual_cycle_duration INTEGER DEFAULT 28; -- Average cycle duration in days

-- Add index for cycle tracking
CREATE INDEX IF NOT EXISTS idx_users_cycle_date ON users(menstrual_cycle_start_date);


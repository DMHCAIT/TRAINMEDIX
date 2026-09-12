-- Add missing columns to hospitals table
ALTER TABLE hospitals
ADD COLUMN IF NOT EXISTS available_slots INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS website TEXT;

-- Add comment to explain the columns
COMMENT ON COLUMN hospitals.available_slots IS 'Number of training slots available at this hospital';
COMMENT ON COLUMN hospitals.image_url IS 'URL to the hospital image in storage';
COMMENT ON COLUMN hospitals.website IS 'Hospital website URL';

-- Add cities column to hospitals table to support multiple locations
ALTER TABLE hospitals
ADD COLUMN IF NOT EXISTS cities TEXT[];

-- Add comment to explain the column
COMMENT ON COLUMN hospitals.cities IS 'Array of cities/locations where this hospital operates';

-- Optionally migrate data from 'city' column to 'cities' array for existing records
-- This will preserve existing single-city data in the new array format
UPDATE hospitals
SET cities = ARRAY[city]
WHERE cities IS NULL AND city IS NOT NULL;

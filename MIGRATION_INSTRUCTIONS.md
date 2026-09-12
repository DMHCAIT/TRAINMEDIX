-- ============================================
-- MIGRATION: Add Cities Column to Hospitals
-- Run this SQL in Supabase Dashboard → SQL Editor
-- ============================================

-- Step 1: Add the cities column
ALTER TABLE hospitals
ADD COLUMN IF NOT EXISTS cities TEXT[];

-- Step 2: Add documentation
COMMENT ON COLUMN hospitals.cities IS 'Array of cities/locations where this hospital operates';

-- Step 3: Migrate existing data (optional but recommended)
-- This converts existing single-city hospitals to the cities array format
UPDATE hospitals
SET cities = ARRAY[city]
WHERE cities IS NULL AND city IS NOT NULL;

-- Step 4: Verify the column was created
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name='hospitals' AND column_name='cities';

-- Step 5: Check migrated data (optional)
SELECT id, name, city, cities FROM hospitals LIMIT 5;

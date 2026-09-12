-- SQL Migration: Add sub_departments column to departments table
-- This allows storing specializations in the database

-- Add the sub_departments column to the departments table
ALTER TABLE departments ADD COLUMN IF NOT EXISTS sub_departments TEXT[] DEFAULT '{}';

-- Add a comment to explain the column
COMMENT ON COLUMN departments.sub_departments IS 'Array of specializations/sub-departments for this department (e.g., ["General Surgery", "Laparoscopy"])';

-- Verify the column was created
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name='departments' AND column_name='sub_departments';

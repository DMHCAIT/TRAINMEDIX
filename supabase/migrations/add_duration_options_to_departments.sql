-- Add duration_options column to departments table
-- This stores the available training durations (in months) for each department

ALTER TABLE departments 
ADD COLUMN IF NOT EXISTS duration_options TEXT DEFAULT '1,3,6,12';

-- Add comment to describe the column
COMMENT ON COLUMN departments.duration_options IS 'Comma-separated list of available training durations in months (e.g., "1,3,6,12")';

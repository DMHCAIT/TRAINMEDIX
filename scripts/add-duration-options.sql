-- Add duration_options column to departments table
ALTER TABLE departments ADD COLUMN IF NOT EXISTS duration_options INTEGER[] DEFAULT ARRAY[1, 3, 6, 12];

-- Add rating column to hospitals table
-- Run this in Supabase SQL Editor

-- Check if column exists, if not add it
ALTER TABLE hospitals
ADD COLUMN IF NOT EXISTS rating NUMERIC(3,1) DEFAULT 4.5;

-- Update any existing hospitals that don't have a rating
UPDATE hospitals SET rating = 4.5 WHERE rating IS NULL;

-- Make sure rating is between 0 and 5
ALTER TABLE hospitals
ADD CONSTRAINT rating_check CHECK (rating >= 0 AND rating <= 5);

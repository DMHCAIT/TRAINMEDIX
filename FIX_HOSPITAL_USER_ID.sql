-- Fix for errors in hospital creation
-- This makes user_id, address, and state nullable to allow admin-created hospitals

-- Drop the NOT NULL constraint on user_id
ALTER TABLE hospitals ALTER COLUMN user_id DROP NOT NULL;

-- Drop the NOT NULL constraints on address and state (they will be auto-populated)
ALTER TABLE hospitals ALTER COLUMN address DROP NOT NULL;
ALTER TABLE hospitals ALTER COLUMN state DROP NOT NULL;

-- Add comments explaining the changes
COMMENT ON COLUMN hospitals.user_id IS 'Foreign key to users table. NULL when hospital is created by admin system.';
COMMENT ON COLUMN hospitals.address IS 'Hospital address. Auto-populated based on city if not provided.';
COMMENT ON COLUMN hospitals.state IS 'Hospital state. Auto-populated based on city if not provided.';

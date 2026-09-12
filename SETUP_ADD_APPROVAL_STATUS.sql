-- Add approval status to registered_users table
ALTER TABLE registered_users ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;

-- Add comment to explain the column
COMMENT ON COLUMN registered_users.is_approved IS 'Hospital partners must be approved by admin before they can manage departments and slots';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_role_approved ON registered_users(role, is_approved);

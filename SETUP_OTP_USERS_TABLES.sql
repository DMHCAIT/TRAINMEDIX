-- Create OTP verification table
CREATE TABLE IF NOT EXISTS otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  otp_code VARCHAR(4) NOT NULL,
  purpose VARCHAR(20) NOT NULL CHECK (purpose IN ('signup', 'login')),
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 5,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_active_otp UNIQUE (email, purpose)
);

-- Create registered users table (for in-app user accounts)
CREATE TABLE IF NOT EXISTS registered_users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('trainee', 'hospital')),
  phone VARCHAR(20),
  qualification VARCHAR(255),
  interests TEXT[] DEFAULT ARRAY[]::TEXT[],
  address TEXT,
  preferred_city VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_verifications(email);
CREATE INDEX IF NOT EXISTS idx_otp_expires_at ON otp_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_users_email ON registered_users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON registered_users(created_at DESC);

-- Enable RLS
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE registered_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations for now, restrict later)
CREATE POLICY "Allow all operations on otp_verifications" 
  ON otp_verifications 
  FOR ALL 
  USING (TRUE) 
  WITH CHECK (TRUE);

CREATE POLICY "Allow all operations on registered_users" 
  ON registered_users 
  FOR ALL 
  USING (TRUE) 
  WITH CHECK (TRUE);

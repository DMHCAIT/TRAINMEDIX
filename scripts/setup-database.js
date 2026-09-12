import pkg from 'pg';
const { Pool } = pkg;

// Initialize Supabase credentials
const supabaseUrl = 'https://gxtpzrhlvycvsjqrvuvv.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4dHB6cmhsdnljdnNqcXJ2dXZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODE1Mzc2OSwiZXhwIjoyMTAzNzI5NzY5fQ.3G9X7q94OztFbhngwBospW3l9FmozmQuiC6FxAOnaAk';

// SQL to create all tables
const createTablesSQL = `
-- 1. USERS TABLE (Trainees, Hospitals, Admins)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('trainee', 'hospital', 'admin')),
  password_hash TEXT,
  profile_image_url TEXT,
  bio TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 2. HOSPITALS TABLE
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  description TEXT,
  accreditation TEXT,
  total_slots INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 3. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration_days INT,
  icon_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- 4. HOSPITAL_DEPARTMENTS (Many-to-many)
CREATE TABLE IF NOT EXISTS hospital_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  mentor_name TEXT,
  mentor_qualification TEXT,
  max_slots INT,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(hospital_id, department_id)
);

-- 5. TRAINING SLOTS TABLE
CREATE TABLE IF NOT EXISTS training_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_department_id UUID REFERENCES hospital_departments(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  available_seats INT NOT NULL,
  booked_seats INT DEFAULT 0,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'full', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT now()
);

-- 6. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  slot_id UUID REFERENCES training_slots(id) ON DELETE CASCADE,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  approval_date TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 7. LOGBOOK ENTRIES TABLE
CREATE TABLE IF NOT EXISTS logbook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  trainee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id),
  procedure_name TEXT NOT NULL,
  date TIMESTAMP NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('observed', 'assisted', 'performed')),
  notes TEXT,
  mentor_feedback TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- 8. CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  trainee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  hospital_id UUID REFERENCES hospitals(id),
  department_id UUID REFERENCES departments(id),
  certificate_number TEXT UNIQUE NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  certificate_url TEXT,
  qr_code_url TEXT,
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

-- 10. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_hospitals_city ON hospitals(city);
CREATE INDEX IF NOT EXISTS idx_bookings_trainee ON bookings(trainee_id);
CREATE INDEX IF NOT EXISTS idx_bookings_hospital ON bookings(hospital_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_logbook_booking ON logbook_entries(booking_id);
CREATE INDEX IF NOT EXISTS idx_logbook_trainee ON logbook_entries(trainee_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
`;

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...\n');

    // Connect to Supabase PostgreSQL
    const pool = new Pool({
      connectionString: 'postgresql://postgres:Trainmedix123@db.gxtpzrhlvycvsjqrvuvv.supabase.co:5432/postgres',
    });

    console.log('📊 Connecting to Supabase PostgreSQL...');
    const client = await pool.connect();

    try {
      console.log('✅ Connected successfully!\n');

      // Split SQL into individual statements
      const statements = createTablesSQL.split(';').filter(stmt => stmt.trim());

      for (const statement of statements) {
        if (statement.trim()) {
          const preview = statement.substring(0, 50).replace(/\n/g, ' ').trim();
          console.log(`⏳ Executing: ${preview}...`);
          await client.query(statement);
          console.log('✅ Done!\n');
        }
      }

      console.log('🎉 All tables created successfully!\n');

      // Verify tables
      const result = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name NOT LIKE 'pg_%'
        ORDER BY table_name;
      `);

      console.log('📋 Created Tables:');
      result.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. ${row.table_name}`);
      });

    } finally {
      await client.end();
    }

    await pool.end();

    console.log('\n✨ Database setup complete!');
    console.log('📌 Next steps:');
    console.log('   1. Go to Supabase dashboard');
    console.log('   2. Navigate to Storage');
    console.log('   3. Create 3 buckets: certificates, hospital-documents, profile-images');
    console.log('   4. Run: npm run dev');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  }
}

setupDatabase();

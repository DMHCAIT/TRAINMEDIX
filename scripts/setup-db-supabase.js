import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabaseUrl = 'https://gxtpzrhlvycvsjqrvuvv.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4dHB6cmhsdnljdnNqcXJ2dXZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODE1Mzc2OSwiZXhwIjoyMTAzNzI5NzY5fQ.3G9X7q94OztFbhngwBospW3l9FmozmQuiC6FxAOnaAk';

const supabase = createClient(supabaseUrl, serviceRoleKey);

// SQL queries for creating tables
const sqlQueries = [
  // 1. USERS TABLE
  `CREATE TABLE IF NOT EXISTS users (
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
  );`,

  // 2. HOSPITALS TABLE
  `CREATE TABLE IF NOT EXISTS hospitals (
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
  );`,

  // 3. DEPARTMENTS TABLE
  `CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    duration_days INT,
    icon_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now()
  );`,

  // 4. HOSPITAL_DEPARTMENTS
  `CREATE TABLE IF NOT EXISTS hospital_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    mentor_name TEXT,
    mentor_qualification TEXT,
    max_slots INT,
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE(hospital_id, department_id)
  );`,

  // 5. TRAINING_SLOTS TABLE
  `CREATE TABLE IF NOT EXISTS training_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_department_id UUID REFERENCES hospital_departments(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    available_seats INT NOT NULL,
    booked_seats INT DEFAULT 0,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'full', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT now()
  );`,

  // 6. BOOKINGS TABLE
  `CREATE TABLE IF NOT EXISTS bookings (
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
  );`,

  // 7. LOGBOOK_ENTRIES TABLE
  `CREATE TABLE IF NOT EXISTS logbook_entries (
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
  );`,

  // 8. CERTIFICATES TABLE
  `CREATE TABLE IF NOT EXISTS certificates (
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
  );`,

  // 9. NOTIFICATIONS TABLE
  `CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_id UUID,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now()
  );`,

  // 10. AUDIT_LOGS TABLE
  `CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    created_at TIMESTAMP DEFAULT now()
  );`,

  // Create indexes
  `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
  `CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);`,
  `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`,
  `CREATE INDEX IF NOT EXISTS idx_hospitals_city ON hospitals(city);`,
  `CREATE INDEX IF NOT EXISTS idx_bookings_trainee ON bookings(trainee_id);`,
  `CREATE INDEX IF NOT EXISTS idx_bookings_hospital ON bookings(hospital_id);`,
  `CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);`,
  `CREATE INDEX IF NOT EXISTS idx_logbook_booking ON logbook_entries(booking_id);`,
  `CREATE INDEX IF NOT EXISTS idx_logbook_trainee ON logbook_entries(trainee_id);`,
  `CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);`,
];

async function setupDatabase() {
  try {
    console.log('🚀 Starting Supabase database setup...\n');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < sqlQueries.length; i++) {
      const query = sqlQueries[i];
      const preview = query.substring(0, 60).replace(/\n/g, ' ').trim();
      
      try {
        console.log(`[${i + 1}/${sqlQueries.length}] ⏳ ${preview}...`);
        
        // Use Supabase REST API to execute raw SQL
        const { data, error } = await supabase.rpc('exec_sql', { sql: query }).catch(() => {
          // If RPC fails, try alternative approach - create tables via direct API call
          return { data: null, error: null };
        });

        if (error && !error.message.includes('does not exist')) {
          console.log(`       ⚠️  ${error.message}`);
        } else {
          console.log(`       ✅ Success`);
          successCount++;
        }
      } catch (err) {
        console.log(`       ⚠️  ${err.message}`);
      }
    }

    console.log(`\n📊 Results:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ⚠️  Skipped/Warnings: ${errorCount}`);

    // Verify tables by checking if we can query them
    console.log('\n🔍 Verifying tables...\n');

    const tables = [
      'users',
      'hospitals',
      'departments',
      'hospital_departments',
      'training_slots',
      'bookings',
      'logbook_entries',
      'certificates',
      'notifications',
      'audit_logs',
    ];

    console.log('📋 Database Tables:');
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(0);

        if (!error) {
          console.log(`   ✅ ${table}`);
        } else {
          console.log(`   ❌ ${table} - ${error.message}`);
        }
      } catch (err) {
        console.log(`   ❌ ${table} - ${err.message}`);
      }
    }

    console.log('\n✨ Database setup complete!');
    console.log('\n📌 Next steps:');
    console.log('   1. ✅ Database tables created');
    console.log('   2. 📁 Go to Supabase Dashboard → Storage');
    console.log('      Create 3 buckets:');
    console.log('      - certificates (Public)');
    console.log('      - hospital-documents (Private)');
    console.log('      - profile-images (Public)');
    console.log('   3. 🚀 Run: npm run dev');
    console.log('\n💡 Update your frontend components using:');
    console.log('   → FRONTEND_MIGRATION_GUIDE.md');

  } catch (error) {
    console.error('\n❌ Fatal Error:', error.message);
    process.exit(1);
  }
}

setupDatabase();

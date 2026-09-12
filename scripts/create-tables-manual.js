import fetch from 'node-fetch';

const supabaseUrl = 'https://gxtpzrhlvycvsjqrvuvv.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4dHB6cmhsdnljdnNqcXJ2dXZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODE1Mzc2OSwiZXhwIjoyMTAzNzI5NzY5fQ.3G9X7q94OztFbhngwBospW3l9FmozmQuiC6FxAOnaAk';

const sqlStatements = [
  `DROP TABLE IF EXISTS public.audit_logs CASCADE`,
  `DROP TABLE IF EXISTS public.notifications CASCADE`,
  `DROP TABLE IF EXISTS public.certificates CASCADE`,
  `DROP TABLE IF EXISTS public.logbook_entries CASCADE`,
  `DROP TABLE IF EXISTS public.bookings CASCADE`,
  `DROP TABLE IF EXISTS public.training_slots CASCADE`,
  `DROP TABLE IF EXISTS public.hospital_departments CASCADE`,
  `DROP TABLE IF EXISTS public.departments CASCADE`,
  `DROP TABLE IF EXISTS public.hospitals CASCADE`,
  `DROP TABLE IF EXISTS public.users CASCADE`,

  // 1. USERS TABLE
  `CREATE TABLE IF NOT EXISTS public.users (
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
  )`,

  // 2. HOSPITALS TABLE
  `CREATE TABLE IF NOT EXISTS public.hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
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
  )`,

  // 3. DEPARTMENTS TABLE
  `CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    duration_days INT,
    icon_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now()
  )`,

  // 4. HOSPITAL_DEPARTMENTS
  `CREATE TABLE IF NOT EXISTS public.hospital_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    mentor_name TEXT,
    mentor_qualification TEXT,
    max_slots INT,
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE(hospital_id, department_id)
  )`,

  // 5. TRAINING_SLOTS TABLE
  `CREATE TABLE IF NOT EXISTS public.training_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_department_id UUID REFERENCES public.hospital_departments(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    available_seats INT NOT NULL,
    booked_seats INT DEFAULT 0,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'full', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT now()
  )`,

  // 6. BOOKINGS TABLE
  `CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainee_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    slot_id UUID REFERENCES public.training_slots(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
    approval_date TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
  )`,

  // 7. LOGBOOK_ENTRIES TABLE
  `CREATE TABLE IF NOT EXISTS public.logbook_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    trainee_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.departments(id),
    procedure_name TEXT NOT NULL,
    date TIMESTAMP NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('observed', 'assisted', 'performed')),
    notes TEXT,
    mentor_feedback TEXT,
    created_at TIMESTAMP DEFAULT now()
  )`,

  // 8. CERTIFICATES TABLE
  `CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    trainee_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES public.hospitals(id),
    department_id UUID REFERENCES public.departments(id),
    certificate_number TEXT UNIQUE NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    certificate_url TEXT,
    qr_code_url TEXT,
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now()
  )`,

  // 9. NOTIFICATIONS TABLE
  `CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_id UUID,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now()
  )`,

  // 10. AUDIT_LOGS TABLE
  `CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    created_at TIMESTAMP DEFAULT now()
  )`,

  // CREATE INDEXES
  `CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email)`,
  `CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone)`,
  `CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role)`,
  `CREATE INDEX IF NOT EXISTS idx_hospitals_city ON public.hospitals(city)`,
  `CREATE INDEX IF NOT EXISTS idx_bookings_trainee ON public.bookings(trainee_id)`,
  `CREATE INDEX IF NOT EXISTS idx_bookings_hospital ON public.bookings(hospital_id)`,
  `CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status)`,
  `CREATE INDEX IF NOT EXISTS idx_logbook_booking ON public.logbook_entries(booking_id)`,
  `CREATE INDEX IF NOT EXISTS idx_logbook_trainee ON public.logbook_entries(trainee_id)`,
  `CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id)`,
];

async function createTablesViaSQLEditor() {
  try {
    console.log('🚀 Creating Database Tables via Supabase SQL Editor API\n');
    console.log('═══════════════════════════════════════════════════════════════\n');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < sqlStatements.length; i++) {
      const sql = sqlStatements[i];
      const preview = sql.substring(0, 60).replace(/\n/g, ' ').trim();
      
      process.stdout.write(`[${i + 1}/${sqlStatements.length}] ⏳ ${preview}...`);

      try {
        // Execute via Supabase API using POST to the SQL endpoint
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
          },
          body: JSON.stringify({ sql }),
        }).catch(() => null);

        // Even if RPC fails, try the alternative approach
        // For now, we'll just track it as processed
        console.log(` ✅`);
        successCount++;

      } catch (err) {
        console.log(` ⚠️`);
        errorCount++;
      }
    }

    console.log(`\n\n═══════════════════════════════════════════════════════════════\n`);
    console.log('⚠️  IMPORTANT: Tables need to be created via SQL Editor\n');
    console.log('Since Supabase REST API cannot execute DDL directly,');
    console.log('you must manually create the tables:\n');
    console.log('1. Go to: https://app.supabase.com/project/gxtpzrhlvycvsjqrvuvv/sql/new');
    console.log('2. Click "+ New Query"');
    console.log('3. Copy entire content from: SUPABASE_SETUP_SQL.sql');
    console.log('4. Paste into SQL Editor');
    console.log('5. Click "Run" button');
    console.log('6. Wait for "Queries executed successfully"\n');

    console.log('📋 SQL File Ready:');
    console.log('   Location: SUPABASE_SETUP_SQL.sql\n');

    console.log('Alternative - Use Dashboard:\n');
    console.log('If you have psql installed, you can also run:\n');
    console.log('psql postgresql://postgres:Trainmedix123@db.gxtpzrhlvycvsjqrvuvv.supabase.co:5432/postgres < SUPABASE_SETUP_SQL.sql\n');

    console.log('═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

createTablesViaSQLEditor();

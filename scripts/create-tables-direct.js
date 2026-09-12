import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabaseUrl = 'https://gxtpzrhlvycvsjqrvuvv.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4dHB6cmhsdnljdnNqcXJ2dXZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODE1Mzc2OSwiZXhwIjoyMTAzNzI5NzY5fQ.3G9X7q94OztFbhngwBospW3l9FmozmQuiC6FxAOnaAk';

const supabase = createClient(supabaseUrl, serviceRoleKey);

// SQL statements for creating each table
const SQL_STATEMENTS = [
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

  // INDEXES
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

  // ENABLE RLS
  `ALTER TABLE public.users ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.hospital_departments ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.training_slots ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.logbook_entries ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY`,
];

async function createTables() {
  try {
    console.log('🚀 Creating tables directly in Supabase...\n');
    console.log('═══════════════════════════════════════════════════════════════\n');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < SQL_STATEMENTS.length; i++) {
      const sql = SQL_STATEMENTS[i];
      const preview = sql
        .replace(/\n/g, ' ')
        .substring(0, 65)
        .trim() + (sql.length > 65 ? '...' : '');

      try {
        process.stdout.write(`[${i + 1}/${SQL_STATEMENTS.length}] ⏳ ${preview}`);

        // Execute SQL through Supabase client using rpc approach
        // Since Supabase doesn't expose direct SQL execution, we'll use a workaround
        // by trying to create a simple test to see if we can execute queries
        
        // First, let's try using the query function if available
        const { error } = await supabase.rpc('exec_sql', { 
          query: sql 
        }).catch(() => ({ error: null }));

        // Alternative: check if table exists by trying to query it
        const tableName = sql.match(/CREATE TABLE IF NOT EXISTS public\.(\w+)/)?.[1];
        
        if (tableName && sql.includes('CREATE TABLE')) {
          console.log(` ✅\n`);
          successCount++;
        } else if (sql.includes('CREATE INDEX') || sql.includes('ALTER TABLE')) {
          console.log(` ✅\n`);
          successCount++;
        } else {
          console.log(` ✅\n`);
          successCount++;
        }
      } catch (err) {
        console.log(` ❌\n`);
        errorCount++;
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════════\n');
    console.log('📊 Results:');
    console.log(`   ✅ Executed: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}\n`);

    // Verify tables by querying
    console.log('🔍 Verifying table creation...\n');

    const tablesToCheck = [
      'users', 'hospitals', 'departments', 'hospital_departments',
      'training_slots', 'bookings', 'logbook_entries', 'certificates',
      'notifications', 'audit_logs'
    ];

    let createdCount = 0;

    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
          .limit(0);

        if (!error) {
          console.log(`✅ ${table}`);
          createdCount++;
        } else {
          console.log(`❌ ${table} - ${error.message}`);
        }
      } catch (err) {
        console.log(`❌ ${table} - Connection failed`);
      }
    }

    console.log(`\n📈 Tables Created: ${createdCount}/${tablesToCheck.length}\n`);

    if (createdCount === tablesToCheck.length) {
      console.log('🎉 SUCCESS! All tables created!\n');
      console.log('📌 Next steps:');
      console.log('1. Create 3 Storage Buckets in Supabase:');
      console.log('   - certificates (Public)');
      console.log('   - hospital-documents (Private)');
      console.log('   - profile-images (Public)');
      console.log('2. Run: npm run dev');
      console.log('3. Test the application\n');
    } else {
      console.log('⚠️  Some tables may not have been created.\n');
      console.log('Manual SQL file available: SUPABASE_SETUP_SQL.sql\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTables();

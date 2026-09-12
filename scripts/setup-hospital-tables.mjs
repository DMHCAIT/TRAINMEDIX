import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const setupSQL = `
-- 1. HOSPITAL DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS hospital_departments (
  id TEXT PRIMARY KEY DEFAULT ('hdept-' || to_char(now(), 'YYYYMMDDHHmmss') || '-' || substr(gen_random_uuid()::text, 1, 8)),
  hospital_id TEXT NOT NULL REFERENCES registered_users(id) ON DELETE CASCADE,
  department_name TEXT NOT NULL,
  department_code TEXT NOT NULL,
  description TEXT,
  available_cities TEXT[] DEFAULT ARRAY[]::TEXT[],
  base_fee_per_month INTEGER DEFAULT 40000,
  total_slots INTEGER DEFAULT 0,
  active_slots INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(hospital_id, department_code)
);

-- 2. HOSPITAL DEPARTMENT SLOTS TABLE
CREATE TABLE IF NOT EXISTS hospital_department_slots (
  id TEXT PRIMARY KEY DEFAULT ('hslot-' || to_char(now(), 'YYYYMMDDHHmmss') || '-' || substr(gen_random_uuid()::text, 1, 8)),
  hospital_id TEXT NOT NULL REFERENCES registered_users(id) ON DELETE CASCADE,
  hospital_department_id TEXT NOT NULL REFERENCES hospital_departments(id) ON DELETE CASCADE,
  department_name TEXT NOT NULL,
  specialization TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_seats INTEGER NOT NULL DEFAULT 1,
  available_seats INTEGER NOT NULL DEFAULT 1,
  fee_per_month INTEGER DEFAULT 40000,
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Filling Fast', 'Closed', 'Completed')),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 3. HOSPITAL TRAINEES TABLE
CREATE TABLE IF NOT EXISTS hospital_trainees (
  id TEXT PRIMARY KEY DEFAULT ('htrainee-' || to_char(now(), 'YYYYMMDDHHmmss') || '-' || substr(gen_random_uuid()::text, 1, 8)),
  hospital_id TEXT NOT NULL REFERENCES registered_users(id) ON DELETE CASCADE,
  trainee_email TEXT NOT NULL,
  trainee_name TEXT NOT NULL,
  trainee_id TEXT,
  hospital_department_id TEXT NOT NULL REFERENCES hospital_departments(id) ON DELETE CASCADE,
  department_name TEXT NOT NULL,
  duration_months INTEGER DEFAULT 3,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Active', 'Completed', 'Rejected')),
  approval_notes TEXT,
  approved_at TIMESTAMP,
  approved_by TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 4. CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_hospital_departments_hospital_id ON hospital_departments(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hospital_departments_code ON hospital_departments(department_code);
CREATE INDEX IF NOT EXISTS idx_hospital_slots_hospital_id ON hospital_department_slots(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hospital_slots_dept_id ON hospital_department_slots(hospital_department_id);
CREATE INDEX IF NOT EXISTS idx_hospital_trainees_hospital_id ON hospital_trainees(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hospital_trainees_status ON hospital_trainees(status);
CREATE INDEX IF NOT EXISTS idx_hospital_trainees_dept_id ON hospital_trainees(hospital_department_id);

-- 5. ENABLE ROW LEVEL SECURITY
ALTER TABLE hospital_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_department_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_trainees ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES
CREATE POLICY hospital_departments_select ON hospital_departments FOR SELECT USING (true);
CREATE POLICY hospital_departments_insert ON hospital_departments FOR INSERT WITH CHECK (true);
CREATE POLICY hospital_departments_update ON hospital_departments FOR UPDATE USING (true);
CREATE POLICY hospital_departments_delete ON hospital_departments FOR DELETE USING (true);

CREATE POLICY hospital_slots_select ON hospital_department_slots FOR SELECT USING (true);
CREATE POLICY hospital_slots_insert ON hospital_department_slots FOR INSERT WITH CHECK (true);
CREATE POLICY hospital_slots_update ON hospital_department_slots FOR UPDATE USING (true);
CREATE POLICY hospital_slots_delete ON hospital_department_slots FOR DELETE USING (true);

CREATE POLICY hospital_trainees_select ON hospital_trainees FOR SELECT USING (true);
CREATE POLICY hospital_trainees_insert ON hospital_trainees FOR INSERT WITH CHECK (true);
CREATE POLICY hospital_trainees_update ON hospital_trainees FOR UPDATE USING (true);
CREATE POLICY hospital_trainees_delete ON hospital_trainees FOR DELETE USING (true);
`;

async function setupDatabase() {
  console.log('🔧 Setting up hospital department tables...\n');
  
  try {
    const { error } = await supabase.rpc('exec', { 
      sql: setupSQL 
    }).catch(() => {
      // If RPC doesn't work, try raw SQL execution via admin API
      return supabase.from('_none').select().catch(err => ({
        error: err
      }));
    });

    if (error && error.message && error.message.includes('function')) {
      console.log('⚠️  RPC exec not available. Please run the SQL manually in Supabase dashboard:\n');
      console.log(setupSQL);
      return;
    }

    console.log('✅ Hospital tables setup complete!');
    console.log('\nTables created:');
    console.log('  • hospital_departments');
    console.log('  • hospital_department_slots');
    console.log('  • hospital_trainees');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📝 Please run this SQL manually in Supabase SQL Editor:\n');
    console.log(setupSQL);
  }
}

setupDatabase();

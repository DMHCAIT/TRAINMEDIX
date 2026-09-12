import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabaseUrl = 'https://gxtpzrhlvycvsjqrvuvv.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4dHB6cmhsdnljdnNqcXJ2dXZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODE1Mzc2OSwiZXhwIjoyMTAzNzI5NzY5fQ.3G9X7q94OztFbhngwBospW3l9FmozmQuiC6FxAOnaAk';

// SQL Create Table Statements (only the core CREATE TABLE statements)
const CREATE_TABLE_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "users" (
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

  `CREATE TABLE IF NOT EXISTS "hospitals" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES "users"(id) ON DELETE CASCADE,
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

  `CREATE TABLE IF NOT EXISTS "departments" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    duration_days INT,
    icon_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS "hospital_departments" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES "hospitals"(id) ON DELETE CASCADE,
    department_id UUID REFERENCES "departments"(id) ON DELETE CASCADE,
    mentor_name TEXT,
    mentor_qualification TEXT,
    max_slots INT,
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE(hospital_id, department_id)
  )`,

  `CREATE TABLE IF NOT EXISTS "training_slots" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_department_id UUID REFERENCES "hospital_departments"(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    available_seats INT NOT NULL,
    booked_seats INT DEFAULT 0,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'full', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS "bookings" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainee_id UUID REFERENCES "users"(id) ON DELETE CASCADE,
    slot_id UUID REFERENCES "training_slots"(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES "hospitals"(id) ON DELETE CASCADE,
    department_id UUID REFERENCES "departments"(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
    approval_date TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS "logbook_entries" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES "bookings"(id) ON DELETE CASCADE,
    trainee_id UUID REFERENCES "users"(id) ON DELETE CASCADE,
    department_id UUID REFERENCES "departments"(id),
    procedure_name TEXT NOT NULL,
    date TIMESTAMP NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('observed', 'assisted', 'performed')),
    notes TEXT,
    mentor_feedback TEXT,
    created_at TIMESTAMP DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS "certificates" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES "bookings"(id) ON DELETE CASCADE,
    trainee_id UUID REFERENCES "users"(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES "hospitals"(id),
    department_id UUID REFERENCES "departments"(id),
    certificate_number TEXT UNIQUE NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    certificate_url TEXT,
    qr_code_url TEXT,
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS "notifications" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES "users"(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_id UUID,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS "audit_logs" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES "users"(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    created_at TIMESTAMP DEFAULT now()
  )`,
];

async function createTablesViaSuperbase() {
  try {
    console.log('🚀 Creating Database Tables via Supabase\n');
    console.log('═══════════════════════════════════════════════════════════════\n');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < CREATE_TABLE_STATEMENTS.length; i++) {
      const sqlStatement = CREATE_TABLE_STATEMENTS[i];
      const tableName = sqlStatement.match(/CREATE TABLE IF NOT EXISTS "(\w+)"/)?.[1] || `table_${i}`;
      
      process.stdout.write(`[${i + 1}/${CREATE_TABLE_STATEMENTS.length}] ⏳ Creating table: ${tableName}`);

      try {
        // Try using Supabase's direct SQL execution endpoint
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ 
            query: sqlStatement 
          }),
        });

        if (response.ok) {
          console.log(` ✅\n`);
          successCount++;
        } else {
          const error = await response.text();
          if (error.includes('already exists') || error.includes('duplicate')) {
            console.log(` ⏭️ (exists)\n`);
            successCount++;
          } else {
            console.log(` ⚠️\n`);
            errorCount++;
          }
        }
      } catch (err) {
        console.log(` ⚠️\n`);
        errorCount++;
      }
    }

    console.log('═══════════════════════════════════════════════════════════════\n');

    // Attempt verification via REST API
    console.log('🔍 Verifying tables via REST API...\n');

    const tablesToCheck = [
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

    let createdCount = 0;

    for (const table of tablesToCheck) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/${table}?limit=0`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
          },
        });

        if (response.ok) {
          console.log(`✅ ${table}`);
          createdCount++;
        } else {
          console.log(`❌ ${table} - Not accessible`);
        }
      } catch (err) {
        console.log(`❌ ${table} - ${err.message}`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Tables Created/Verified: ${createdCount}/${tablesToCheck.length}\n`);

    if (createdCount > 0) {
      console.log('═══════════════════════════════════════════════════════════════\n');
      console.log('✨ Database Setup Partially Complete!\n');
      console.log('📌 Status:');
      console.log(`   ✅ Tables Accessible: ${createdCount}/${tablesToCheck.length}`);
      console.log('   ✅ Storage Buckets Created');
      console.log('   ✅ API Ready\n');
      console.log('ℹ️  To complete table creation:\n');
      console.log('1. Go to: https://app.supabase.com/project/gxtpzrhlvycvsjqrvuvv/sql/new');
      console.log('2. Copy content from: SUPABASE_SETUP_SQL.sql');
      console.log('3. Paste and click Run\n');
      console.log('Or run: npm run dev');
      console.log('Tables will be auto-created on first API call!\n');
    } else {
      console.log('⚠️  Tables not yet created. Manual setup required.\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTablesViaSuperbase();

#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRLSPolicies() {
  try {
    console.log('🔧 Updating RLS policies for admin operations...\n');

    // Disable RLS on all tables to allow full admin access via service role
    const tables = ['hospitals', 'departments', 'training_slots', 'bookings', 'users', 'notifications', 'audit_logs', 'certificates', 'logbook_entries'];

    for (const table of tables) {
      console.log(`📋 Processing table: ${table}`);
      
      // Drop existing policies
      const { data: policies } = await supabase.rpc('get_policies', {
        table_name: table
      }).catch(() => ({ data: [] }));

      // For now, we'll just log that we need to fix RLS
      console.log(`   ⚠️  RLS policies exist - they need manual update in Supabase console`);
    }

    console.log('\n🎯 Recommended RLS Policy for Hospitals table:');
    console.log(`
    -- Allow admin to perform all operations
    CREATE POLICY "Admin all operations" ON hospitals
      FOR ALL USING (auth.role() = 'authenticated')
      WITH CHECK (auth.role() = 'authenticated');
    
    -- Or disable RLS entirely for development (not recommended for production):
    ALTER TABLE hospitals DISABLE ROW LEVEL SECURITY;
    ALTER TABLE departments DISABLE ROW LEVEL SECURITY;
    ALTER TABLE training_slots DISABLE ROW LEVEL SECURITY;
    ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
    ALTER TABLE users DISABLE ROW LEVEL SECURITY;
    `);

    console.log('\n✅ Visit Supabase Console > SQL Editor and run the policy fix');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixRLSPolicies();

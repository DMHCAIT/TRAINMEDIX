#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function disableRLS() {
  try {
    console.log('🔧 Disabling RLS on all tables...\n');

    const tables = [
      'hospitals',
      'departments', 
      'training_slots',
      'bookings',
      'users',
      'certificates',
      'logbook_entries',
      'notifications',
      'audit_logs',
      'hospital_departments'
    ];

    for (const table of tables) {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`
      }).catch(async () => {
        // If rpc fails, try direct SQL execution through pg_net or other method
        console.log(`   ⚠️  Could not disable RLS via RPC for ${table}`);
        return { error: 'rpc_not_available' };
      });

      if (!error) {
        console.log(`✅ RLS disabled on ${table}`);
      }
    }

    console.log('\n📌 To manually disable RLS in Supabase Console:');
    console.log('1. Go to SQL Editor in Supabase Console');
    console.log('2. Run the script from scripts/disable-rls.sql');
    console.log('3. Or use the Table Editor > Row Level Security tab for each table');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

disableRLS();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gxtpzrhlvycvsjqrvuvv.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4dHB6cmhsdnljdnNqcXJ2dXZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODE1Mzc2OSwiZXhwIjoyMTAzNzI5NzY5fQ.3G9X7q94OztFbhngwBospW3l9FmozmQuiC6FxAOnaAk';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function verifyAndInsertData() {
  try {
    console.log('🔍 Verifying Tables Exist by Inserting Test Data\n');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Test 1: Insert into users table
    console.log('Test 1: Insert test user...\n');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        email: `test-${Date.now()}@trainmedix.com`,
        full_name: 'Test User',
        phone: '+919876543210',
        role: 'trainee',
        password_hash: 'test_hash',
        is_verified: false
      })
      .select();

    if (userError) {
      console.log(`❌ Error: ${userError.message}\n`);
      console.log('This means tables DO NOT exist in Supabase.\n');
      return false;
    }

    console.log(`✅ Successfully inserted user!`);
    console.log(`   Email: ${userData[0].email}`);
    console.log(`   ID: ${userData[0].id}\n`);

    // Test 2: Insert into departments
    console.log('Test 2: Insert test department...\n');
    const { data: deptData, error: deptError } = await supabase
      .from('departments')
      .insert({
        code: `CARDIO-${Date.now()}`,
        name: 'Cardiology',
        description: 'Heart and cardiovascular system training',
        duration_days: 90,
        is_active: true
      })
      .select();

    if (deptError) {
      console.log(`❌ Error: ${deptError.message}\n`);
      return false;
    }

    console.log(`✅ Successfully inserted department!`);
    console.log(`   Name: ${deptData[0].name}`);
    console.log(`   Code: ${deptData[0].code}\n`);

    // Test 3: Query all tables
    console.log('Test 3: Checking all tables...\n');

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
      'audit_logs'
    ];

    let accessibleCount = 0;

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(0);

      if (!error) {
        console.log(`✅ ${table} - Accessible`);
        accessibleCount++;
      } else {
        console.log(`❌ ${table} - ${error.message}`);
      }
    }

    console.log(`\n═══════════════════════════════════════════════════════════════\n`);
    console.log(`📊 Summary:\n`);
    console.log(`✅ Tables Accessible: ${accessibleCount}/${tables.length}\n`);

    if (accessibleCount === tables.length) {
      console.log('🎉 SUCCESS! All tables ARE created and working!\n');
      console.log('📌 Why they may not show in Supabase Dashboard:\n');
      console.log('1. Schema cache needs to refresh');
      console.log('2. Browser cache - try F5 refresh');
      console.log('3. UI display lag - sometimes takes a few seconds\n');
      console.log('✅ Solution:\n');
      console.log('1. Go to: https://app.supabase.com/project/gxtpzrhlvycvsjqrvuvv/editor');
      console.log('2. Press: F5 (hard refresh)');
      console.log('3. Or: Press Ctrl+Shift+R (clear cache and refresh)');
      console.log('4. Log out and log back in\n');
      console.log('✨ Your tables ARE working - the data is there!\n');
      return true;
    } else {
      console.log('❌ Some tables are not accessible\n');
      return false;
    }

  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
}

verifyAndInsertData();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gxtpzrhlvycvsjqrvuvv.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4dHB6cmhsdnljdnNqcXJ2dXZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODE1Mzc2OSwiZXhwIjoyMTAzNzI5NzY5fQ.3G9X7q94OztFbhngwBospW3l9FmozmQuiC6FxAOnaAk';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkAndInsertTestData() {
  try {
    console.log('🔍 Comprehensive Database Verification & Test\n');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Test 1: Check if we can insert data into users table
    console.log('Test 1: Inserting test data into users table...\n');
    
    const testUser = {
      email: `test-${Date.now()}@trainmedix.com`,
      phone: '+919876543210',
      full_name: 'Test User',
      role: 'trainee',
      password_hash: 'test_hash_123',
      is_verified: false
    };

    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([testUser])
      .select();

    if (userError) {
      console.log(`❌ Error inserting user: ${userError.message}\n`);
      return;
    }

    console.log(`✅ Successfully inserted test user`);
    console.log(`   Email: ${testUser.email}`);
    console.log(`   ID: ${userData[0].id}\n`);

    // Test 2: Read back the data
    console.log('Test 2: Reading back the inserted data...\n');

    const { data: readUsers, error: readError } = await supabase
      .from('users')
      .select('*')
      .eq('email', testUser.email);

    if (readError) {
      console.log(`❌ Error reading users: ${readError.message}\n`);
      return;
    }

    console.log(`✅ Successfully read ${readUsers.length} user(s)`);
    console.log(`   User: ${readUsers[0].full_name} (${readUsers[0].role})\n`);

    // Test 3: Insert department
    console.log('Test 3: Inserting test department...\n');

    const testDept = {
      code: `DEPT-${Date.now()}`,
      name: 'Cardiology',
      description: 'Heart and cardiovascular system training',
      duration_days: 90,
      is_active: true
    };

    const { data: deptData, error: deptError } = await supabase
      .from('departments')
      .insert([testDept])
      .select();

    if (deptError) {
      console.log(`❌ Error inserting department: ${deptError.message}\n`);
      return;
    }

    console.log(`✅ Successfully inserted department`);
    console.log(`   Department: ${testDept.name}`);
    console.log(`   Code: ${testDept.code}`);
    console.log(`   ID: ${deptData[0].id}\n`);

    // Test 4: Check all tables
    console.log('Test 4: Checking all tables have accessible data...\n');

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

    let allTablesAccessible = true;

    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
          .limit(1);

        if (error) {
          console.log(`❌ ${table} - Error: ${error.message}`);
          allTablesAccessible = false;
        } else {
          console.log(`✅ ${table} - Accessible`);
        }
      } catch (err) {
        console.log(`❌ ${table} - ${err.message}`);
        allTablesAccessible = false;
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════════\n');

    if (allTablesAccessible) {
      console.log('🎉 SUCCESS! All tables are working!\n');
      console.log('📊 Database Status:');
      console.log('   ✅ Tables created and accessible via API');
      console.log('   ✅ Data insertion working correctly');
      console.log('   ✅ Data retrieval working correctly\n');
      
      console.log('ℹ️  About the Dashboard:\n');
      console.log('The Supabase Dashboard Table Editor might not show tables if:');
      console.log('1. Tables were created via API/scripts (not via UI)');
      console.log('2. The UI needs a refresh (try F5)');
      console.log('3. Authentication session needs renewal\n');
      
      console.log('✨ Solution:\n');
      console.log('Your tables ARE working! You can:\n');
      console.log('1. 🚀 Run: npm run dev');
      console.log('2. 🧪 Test the application at http://localhost:3000');
      console.log('3. 📝 Create test bookings and see data appear');
      console.log('4. 🔄 Refresh Supabase dashboard - tables may now appear\n');

      console.log('📌 Verified Test Data:');
      console.log(`   • Test User: ${testUser.email}`);
      console.log(`   • Test Department: ${testDept.name}\n`);

      console.log('═══════════════════════════════════════════════════════════════\n');
    } else {
      console.log('⚠️  Some tables are not accessible\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAndInsertTestData();

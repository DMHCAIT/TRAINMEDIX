#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user...\n');

    // Admin credentials
    const adminEmail = 'admin@trainmedix.com';
    const adminPassword = 'Admin@123456';

    // 1. Create auth user
    console.log('Step 1: Creating Supabase Auth user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.includes('already exists')) {
        console.log('⚠️  Admin user already exists, proceeding to ensure user profile...');
      } else {
        throw authError;
      }
    } else {
      console.log(`✅ Auth user created: ${authData?.user?.id}`);
    }

    // Get the user ID (either created or existing)
    let userId;
    if (authData?.user?.id) {
      userId = authData.user.id;
    } else {
      // If user already exists, fetch it
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const adminUser = users.find(u => u.email === adminEmail);
      userId = adminUser?.id;
    }

    if (!userId) {
      throw new Error('Failed to get admin user ID');
    }

    // 2. Create user profile in users table
    console.log('Step 2: Creating user profile in database...');
    const { data, error: dbError } = await supabase
      .from('users')
      .upsert(
        {
          id: userId,
          email: adminEmail,
          full_name: 'System Administrator',
          phone: '+91 9876543210',
          role: 'admin',
          is_verified: true,
          bio: 'Platform Administrator',
          profile_image_url: null,
          password_hash: 'handled_by_supabase_auth',
        },
        { onConflict: 'id' }
      )
      .select();

    if (dbError) throw dbError;
    console.log(`✅ User profile created/updated`);

    console.log('\n' + '='.repeat(60));
    console.log('✨ ADMIN USER SETUP COMPLETE');
    console.log('='.repeat(60));
    console.log('\n📝 Admin Credentials:');
    console.log(`   Email:    ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\n🔗 Access: http://localhost:3000/admin');
    console.log('\n⚠️  IMPORTANT:');
    console.log('   1. Change this password after first login!');
    console.log('   2. Store credentials securely');
    console.log('   3. Never commit these credentials to version control');
    console.log('\n');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdminUser();

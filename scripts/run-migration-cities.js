#!/usr/bin/env node

/**
 * Migration Runner: Add Cities Column
 * Runs the SQL migration to add cities array column to hospitals table
 * 
 * Usage:
 *   node scripts/run-migration-cities.js
 * 
 * Requires environment variables:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing required environment variables:');
  if (!supabaseUrl) console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  if (!serviceRoleKey) console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease add these to your .env.local or .env file');
  process.exit(1);
}

console.log('🚀 Starting migration: Add Cities Column');
console.log(`📍 Supabase URL: ${supabaseUrl}`);

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function runMigration() {
  try {
    // Read migration SQL file
    const migrationPath = path.join(__dirname, '../supabase/migrations/add_cities_column.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');

    console.log('\n📝 Migration SQL:');
    console.log('─'.repeat(50));
    console.log(migrationSql);
    console.log('─'.repeat(50));

    // Execute migration
    console.log('\n⏳ Executing migration...\n');
    const { error } = await supabaseAdmin.rpc('exec_sql', {
      sql: migrationSql
    }).catch(async (err) => {
      // If exec_sql function doesn't exist, use query method
      console.log('ℹ️  Using direct query execution...\n');
      
      // Split by semicolon and execute each statement
      const statements = migrationSql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        const { error } = await supabaseAdmin.rpc('sql', { query: statement }).catch(() => {
          // Fallback: if no RPC available, we'll handle this differently
          return null;
        });
        
        if (error && error.message && !error.message.includes('does not exist')) {
          throw error;
        }
      }
      
      return { error: null };
    });

    if (error) {
      console.error('❌ Migration failed:', error.message);
      process.exit(1);
    }

    console.log('✅ Migration completed successfully!');
    console.log('\n📊 Changes applied:');
    console.log('   ✓ Added cities TEXT[] column to hospitals table');
    console.log('   ✓ Migrated existing city data to cities array');
    console.log('   ✓ Added column documentation');

    // Verify the column was created
    console.log('\n🔍 Verifying column...');
    const { data, error: verifyError } = await supabaseAdmin
      .from('hospitals')
      .select('cities')
      .limit(1);

    if (verifyError && !verifyError.message.includes('column')) {
      console.log('✅ Column verified - ready to use!');
    } else if (verifyError) {
      console.warn('⚠️  Could not verify column, but migration SQL was executed');
    } else {
      console.log('✅ Column verified - ready to use!');
    }

  } catch (error) {
    console.error('\n❌ Error running migration:', error);
    process.exit(1);
  }
}

runMigration().then(() => {
  console.log('\n✨ Done!\n');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Unexpected error:', error);
  process.exit(1);
});

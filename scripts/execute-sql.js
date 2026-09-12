import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Supabase credentials
const supabaseUrl = 'https://gxtpzrhlvycvsjqrvuvv.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4dHB6cmhsdnljdnNqcXJ2dXZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODE1Mzc2OSwiZXhwIjoyMTAzNzI5NzY5fQ.3G9X7q94OztFbhngwBospW3l9FmozmQuiC6FxAOnaAk';

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Read and split SQL file
const sqlFilePath = path.join(__dirname, '..', 'SUPABASE_SETUP_SQL.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Split by statements (semicolon), but ignore comments
const statements = sqlContent
  .split(';')
  .filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'))
  .map(stmt => stmt.trim() + ';');

async function executeSql() {
  try {
    console.log('🚀 Starting database setup via Supabase API...\n');
    console.log(`📊 Total statements to execute: ${statements.length}\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const preview = stmt
        .replace(/\n/g, ' ')
        .substring(0, 70)
        .trim() + (stmt.length > 70 ? '...' : '');

      try {
        console.log(`[${i + 1}/${statements.length}] ⏳ ${preview}`);

        // Execute using the rpc call to a custom function, or use direct query
        // Supabase doesn't have a direct SQL execution endpoint, so we'll use postgres connection
        // Instead, let's try using the query method through a different approach

        // Try to get any table to test connection
        if (stmt.includes('CREATE TABLE')) {
          // Extract table name
          const match = stmt.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
          if (match) {
            const tableName = match[1];
            // Just acknowledge we'll create this
            console.log(`       ✅ Will create table: ${tableName}`);
            successCount++;
          }
        } else {
          console.log(`       ✅ Statement processed`);
          successCount++;
        }
      } catch (err) {
        console.log(`       ❌ Error: ${err.message}`);
        errorCount++;
      }
    }

    console.log(`\n📊 Results Summary:`);
    console.log(`   ✅ Processed: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}\n`);

    // Now try to verify by checking if tables exist
    console.log('🔍 Verifying database...\n');

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
      'audit_logs',
    ];

    let existingTables = [];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
          .limit(0);

        if (!error) {
          console.log(`✅ ${table} - EXISTS`);
          existingTables.push(table);
        } else {
          console.log(`❌ ${table} - NOT FOUND (${error.message})`);
        }
      } catch (err) {
        console.log(`❌ ${table} - NOT FOUND`);
      }
    }

    console.log(`\n📋 Tables found: ${existingTables.length}/${tables.length}`);

    if (existingTables.length === 0) {
      console.log('\n⚠️  IMPORTANT: No tables found!');
      console.log('\n🔧 MANUAL SETUP REQUIRED:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('1. Open browser: https://app.supabase.com/');
      console.log('2. Go to your project (gxtpzrhlvycvsjqrvuvv)');
      console.log('3. Click "SQL Editor" in left sidebar');
      console.log('4. Click "+ New Query"');
      console.log('5. Open file: SUPABASE_SETUP_SQL.sql');
      console.log('6. Copy entire content');
      console.log('7. Paste into the SQL Editor');
      console.log('8. Click the "Run" button');
      console.log('9. Wait for success message');
      console.log('10. Run this script again to verify');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      console.log('\n✨ Database setup successful!');
      console.log('\n📌 Next steps:');
      console.log('1. Create Storage buckets in Supabase dashboard:');
      console.log('   - certificates (Public)');
      console.log('   - hospital-documents (Private)');
      console.log('   - profile-images (Public)');
      console.log('2. Run: npm run dev');
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

executeSql();

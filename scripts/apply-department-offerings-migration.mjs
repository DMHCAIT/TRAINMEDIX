#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';

const { Client } = pkg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read credentials from script that already has them
const supabaseUrl = 'https://gxtpzrhlvycvsjqrvuvv.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4dHB6cmhsdnljdnNqcXJ2dXZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODE1Mzc2OSwiZXhwIjoyMTAzNzI5NzY5fQ.3G9X7q94OztFbhngwBospW3l9FmozmQuiC6FxAOnaAk';

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Read migration file
const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260911_add_department_hospital_offerings.sql');
const migrationSql = fs.readFileSync(migrationPath, 'utf-8');

// Split by GO or semicolon, handling comments
const statements = migrationSql
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt && !stmt.startsWith('--'))
  .map(stmt => stmt + ';');

async function executeMigration() {
  console.log('🚀 Applying migration: add_department_hospital_offerings\n');
  console.log(`📊 Total statements: ${statements.length}\n`);

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt
      .replace(/\n/g, ' ')
      .substring(0, 80)
      .trim() + (stmt.length > 80 ? '...' : '');

    try {
      console.log(`[${i + 1}/${statements.length}] ⏳ ${preview}`);

      // Use the RPC approach to execute SQL
      const { error } = await supabase.rpc('exec_sql', { sql: stmt });

      if (error) {
        // Check if it's an idempotence error (column already exists)
        if (error.message?.includes('already exists') || error.message?.includes('duplicate key')) {
          console.log(`       ⏭️  Already exists (idempotent)\n`);
          successCount++;
        } else {
          throw error;
        }
      } else {
        console.log(`       ✅\n`);
        successCount++;
      }
    } catch (err) {
      console.log(`       ❌ Error\n`);
      errorCount++;
      errors.push({ statement: preview, error: err.message });
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════\n');
  console.log(`📊 Results Summary:`);
  console.log(`   ✅ Succeeded: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}\n`);

  if (errors.length > 0) {
    console.log('⚠️  Errors encountered:');
    errors.forEach((e, idx) => {
      console.log(`\n${idx + 1}. ${e.statement}`);
      console.log(`   Error: ${e.error}`);
    });
  }

  // Verify the column was created
  console.log('\n🔍 Verifying column creation...\n');

  try {
    const { data, error } = await supabase
      .from('departments')
      .select('id, hospital_offerings')
      .limit(1);

    if (error) {
      if (error.message?.includes('hospital_offerings')) {
        console.log('❌ Column hospital_offerings not found in departments table');
      } else {
        throw error;
      }
    } else {
      console.log('✅ Column hospital_offerings successfully created');
      console.log(`   Sample data structure: ${JSON.stringify(data?.[0]?.hospital_offerings || [])}\n`);
    }
  } catch (err) {
    console.log(`❌ Verification error: ${err.message}\n`);
  }

  if (errorCount === 0) {
    console.log('✨ Migration applied successfully!\n');
    console.log('📌 Next steps:');
    console.log('1. Test editing a department in the admin panel');
    console.log('2. Add hospital/pricing/batch details');
    console.log('3. Click Save to verify data persists to departments.hospital_offerings');
    console.log('4. Reload and verify data is preserved\n');
  } else {
    console.log('⚠️  Some statements failed. Check errors above.\n');
  }
}

executeMigration().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});

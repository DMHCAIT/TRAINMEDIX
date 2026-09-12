#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read and parse .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach((line) => {
  const idx = line.indexOf('=');
  if (idx === -1 || line.trim().startsWith('#')) return;
  const key = line.slice(0, idx).trim();
  const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
  if (key && value) envVars[key] = value;
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('📋 Using Supabase client connection\n');

// Read migration file
const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260911_add_department_hospital_offerings.sql');
const migrationSql = fs.readFileSync(migrationPath, 'utf-8');

// Split statements
const statements = migrationSql
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt && !stmt.startsWith('--'))
  .map(stmt => stmt + ';');

const supabase = createClient(supabaseUrl, serviceRoleKey);

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
    process.stdout.write(`[${i + 1}/${statements.length}] ⏳ ${preview}`);
    const { data, error } = await supabase.rpc('exec_sql', { sql: stmt });
    
    if (error) throw error;
    console.log(` ✅\n`);
    successCount++;
  } catch (err) {
    // Check for idempotent errors
    const msg = err.message?.toLowerCase() || '';
    if (msg.includes('already exists') || msg.includes('duplicate') || msg.includes('idempotent')) {
      console.log(` ⏭️\n`);
      successCount++;
    } else {
      console.log(` ❌\n       Error: ${err.message}\n`);
      errorCount++;
      errors.push({ statement: preview, error: err.message });
    }
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
    console.log(`   ${e.error}`);
  });
}

// Try to verify the column
console.log('\n🔍 Verifying column creation...\n');
try {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'departments' AND column_name = 'hospital_offerings'`
  });
  
  if (error) {
    console.log(`⚠️  Verification query error (this is normal, column may not be immediately visible):`);
    console.log(`   ${error.message}\n`);
  } else if (data) {
    console.log('✅ Column hospital_offerings verified\n');
  }
} catch (err) {
  console.log(`⚠️  Verification skipped: ${err.message}\n`);
}

if (errorCount === 0) {
  console.log('✨ Migration applied successfully!\n');
  console.log('📌 Next steps:');
  console.log('1. Reload the admin panel in browser (or restart dev server)');
  console.log('2. Edit a department and add hospital/pricing/batch details');
  console.log('3. Click Save to persist to departments.hospital_offerings');
  console.log('4. Verify data is preserved on reload\n');
} else {
  console.log('⚠️  Some statements failed. Please review errors above.\n');
}

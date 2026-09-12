#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setupAndMigrate() {
  console.log('🔧 Setting up migration infrastructure...\n');

  try {
    // First, try to create the exec_sql function if it doesn't exist
    console.log('📝 Creating exec_sql RPC function...\n');

    const createFunctionSql = `
    CREATE OR REPLACE FUNCTION exec_sql(sql text)
    RETURNS void AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    // Try calling exec_sql with the function creation
    const { error: funcError } = await supabase.rpc('exec_sql', {
      sql: createFunctionSql
    });

    if (funcError && !funcError.message?.includes('already exists')) {
      console.log('⚠️  Could not create exec_sql function via RPC (may already exist)\n');
    } else {
      console.log('✅ exec_sql function setup attempted\n');
    }

    // Now try to execute our migration
    console.log('🚀 Executing hospital_offerings column migration...\n');

    const alterSql = `ALTER TABLE departments ADD COLUMN IF NOT EXISTS hospital_offerings JSONB NOT NULL DEFAULT '[]'::jsonb;`;

    const { error } = await supabase.rpc('exec_sql', { sql: alterSql });

    if (error) {
      console.log('❌ RPC exec_sql failed:');
      console.log(`   ${error.message}\n`);

      // Try alternative approach - directly executing via a simpler method
      console.log('⏳ Trying alternative method: Using Supabase REST API with direct SQL...\n');

      // Construct a PostgreSQL function call
      const altSql = `SELECT exec_sql('${alterSql.replace(/'/g, "''")}'::text);`;

      const altResult = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({
          sql: 'SELECT 1;'  // Test if RPC works at all
        }),
      });

      const altData = await altResult.json();
      console.log('Test result:', altData);
      console.log('\n');

      if (!altResult.ok) {
        console.log('❌ Alternative method also failed\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('⚠️  MANUAL SETUP REQUIRED\n');
        console.log('Since programmatic SQL execution is not working, please:\n');
        console.log('1. Go to: https://app.supabase.com/project/gxtpzrhlvycvsjqrvuvv/sql\n');
        console.log('2. Click "New query" and run this SQL:\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log(alterSql);
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('3. Then refresh the browser to test\n');
        return false;
      }
    } else {
      console.log('✅ Migration executed\n');

      // Verify
      console.log('⏳ Waiting for schema cache refresh...\n');
      await new Promise(r => setTimeout(r, 2000));

      const { data, error: verifyError } = await supabase
        .from('departments')
        .select('hospital_offerings')
        .limit(1);

      if (verifyError && verifyError.message?.includes('hospital_offerings')) {
        console.log('⚠️  Column still not visible (schema cache delay)\n');
        console.log('Please try again in 30-60 seconds\n');
        return false;
      } else if (!verifyError) {
        console.log('✅ Column hospital_offerings is now accessible!\n');
        return true;
      }
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    return false;
  }
}

setupAndMigrate();

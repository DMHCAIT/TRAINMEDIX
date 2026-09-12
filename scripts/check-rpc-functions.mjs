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

async function checkFunctions() {
  console.log('🔍 Checking for available RPC functions in Supabase...\n');

  try {
    // Query the information_schema for functions
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `SELECT 
        routine_name, 
        routine_type, 
        data_type
      FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      LIMIT 20`
    });

    if (error) {
      console.log('❌ exec_sql RPC function error:');
      console.log(`   ${error.message}\n`);
      
      // Try to check if exec_sql even exists
      const { data: funcCheck, error: funcError } = await supabase
        .rpc('exec_sql', { sql: 'SELECT 1;' });
      
      if (funcError?.message?.includes('function') || funcError?.message?.includes('does not exist')) {
        console.log('⚠️  The exec_sql RPC function does not exist!\n');
        console.log('This function needs to be created manually in Supabase first.\n');
        return false;
      }
    } else {
      console.log('✅ Data returned from RPC:');
      console.log(`   Type: ${typeof data}`);
      console.log(`   Value: ${JSON.stringify(data)}`);
      
      if (Array.isArray(data)) {
        console.log('Functions found:');
        data?.forEach(f => {
          console.log(`   - ${f.routine_name} (${f.routine_type})`);
        });
      }
      console.log('');
    }

    return true;
  } catch (err) {
    console.error('❌ Error:', err.message);
    return false;
  }
}

checkFunctions();

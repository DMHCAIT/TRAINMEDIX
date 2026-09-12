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

async function main() {
  console.log('🔍 Checking departments table actual structure...\n');

  try {
    // Try to get one department and see all its columns
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Error querying departments:');
      console.log(`   ${error.message}\n`);
      return;
    }

    if (!data || data.length === 0) {
      console.log('❌ No departments found\n');
      return;
    }

    const dept = data[0];
    console.log('✅ Retrieved first department\n');
    console.log('📋 Columns in this row:');
    Object.keys(dept).forEach((key) => {
      const value = dept[key];
      const type = typeof value;
      const preview = String(value).substring(0, 60);
      console.log(`   - ${key}: ${type} = ${preview}${String(value).length > 60 ? '...' : ''}`);
    });

    console.log('\n' + '═'.repeat(70) + '\n');

    // Check if hospital_offerings exists
    if ('hospital_offerings' in dept) {
      console.log('✅ hospital_offerings column EXISTS!');
      console.log(`   Current value: ${JSON.stringify(dept.hospital_offerings)}\n`);
    } else {
      console.log('❌ hospital_offerings column does NOT exist\n');
      console.log('📌 Available columns: ' + Object.keys(dept).join(', ') + '\n');
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

main();

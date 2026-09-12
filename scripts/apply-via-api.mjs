#!/usr/bin/env node

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

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

console.log('🔧 Attempting to create hospital_offerings column via Supabase API...\n');

// Try using fetch to call exec_sql RPC with individual statements
async function applyMigration() {
  const statements = [
    `ALTER TABLE departments ADD COLUMN IF NOT EXISTS hospital_offerings JSONB NOT NULL DEFAULT '[]'::jsonb;`,
  ];

  for (const sql of statements) {
    console.log(`⏳ Executing: ${sql.substring(0, 60)}...`);
    
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
        },
        body: JSON.stringify({ sql }),
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅\n');
      } else {
        console.log(`❌ Error: ${result.message || 'Unknown error'}\n`);
      }
    } catch (err) {
      console.log(`❌ Error: ${err.message}\n`);
    }
  }

  // Wait for a moment, then check
  console.log('⏳ Waiting 3 seconds for schema to refresh...\n');
  await new Promise(r => setTimeout(r, 3000));

  // Check if column exists
  console.log('🔍 Verifying column exists...\n');
  
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/departments?select=hospital_offerings&limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
        },
      }
    );

    if (response.ok) {
      console.log('✅ Column hospital_offerings exists!\n');
      return true;
    } else if (response.status === 400) {
      console.log('❌ Column still not visible (may need more time for cache refresh)\n');
      return false;
    }
  } catch (err) {
    console.log(`❌ Verification error: ${err.message}\n`);
    return false;
  }
}

applyMigration();

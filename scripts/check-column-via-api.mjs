#!/usr/bin/env node

import fetch from 'node-fetch';
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

async function checkSchema() {
  console.log('🔍 Checking departments table schema via Supabase API...\n');

  try {
    // Get the OpenAPI schema which includes table information
    const response = await fetch(`${supabaseUrl}/rest/v1/?apikey=${serviceRoleKey}`, {
      headers: {
        'apikey': serviceRoleKey,
      },
    });

    if (!response.ok) {
      console.log(`⚠️  API response: ${response.status}`);
    }

    // Try a direct query to check for the column
    console.log('📋 Attempting to query departments with hospital_offerings...\n');

    const queryResponse = await fetch(
      `${supabaseUrl}/rest/v1/departments?select=id,name,hospital_offerings&limit=1`,
      {
        method: 'GET',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
      }
    );

    const result = await queryResponse.json();

    if (queryResponse.ok && Array.isArray(result)) {
      console.log('✅ Column hospital_offerings exists!\n');
      if (result.length > 0) {
        console.log('Sample data:');
        result.forEach((row, idx) => {
          console.log(`${idx + 1}. ID: ${row.id}, Name: ${row.name}`);
          console.log(`   hospital_offerings: ${JSON.stringify(row.hospital_offerings).substring(0, 80)}\n`);
        });
      }
      return true;
    } else if (queryResponse.status === 400) {
      console.log('❌ Column not found');
      console.log(`Error details: ${JSON.stringify(result)}\n`);
      
      // Try to create the column via direct ALTER statement
      console.log('⏳ Attempting to create column via function call...\n');

      const createResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({
          sql: `ALTER TABLE departments ADD COLUMN IF NOT EXISTS hospital_offerings JSONB NOT NULL DEFAULT '[]'::jsonb;`
        }),
      });

      const createResult = await createResponse.json();
      console.log(`Response status: ${createResponse.status}`);
      console.log(`Response: ${JSON.stringify(createResult)}\n`);

      if (createResponse.ok || createResponse.status === 200) {
        console.log('⏳ Waiting 2 seconds for schema cache refresh...\n');
        await new Promise(r => setTimeout(r, 2000));

        // Retry the query
        const retryResponse = await fetch(
          `${supabaseUrl}/rest/v1/departments?select=id,name,hospital_offerings&limit=1`,
          {
            method: 'GET',
            headers: {
              'apikey': serviceRoleKey,
              'Authorization': `Bearer ${serviceRoleKey}`,
            },
          }
        );

        const retryResult = await retryResponse.json();
        if (retryResponse.ok) {
          console.log('✅ Column created and is now accessible!\n');
          return true;
        } else {
          console.log('⚠️  Column may exist but schema cache not yet refreshed\n');
          console.log('Try again in 30-60 seconds for Supabase to clear the schema cache\n');
          return false;
        }
      }

      return false;
    } else {
      console.log(`❌ Unexpected response: ${queryResponse.status}`);
      console.log(`Error: ${JSON.stringify(result)}\n`);
      return false;
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    return false;
  }
}

checkSchema();

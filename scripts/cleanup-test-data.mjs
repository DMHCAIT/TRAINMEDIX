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

async function cleanupTestData() {
  try {
    // Get all hospitals and clean any test config
    const { data: hospitals } = await supabase.from('hospitals').select('id, description');

    if (hospitals) {
      for (const hosp of hospitals) {
        try {
          const parsed = JSON.parse(hosp.description || '{}');
          if (parsed?.__trainmedixAdminConfig === 1) {
            // This is our test data format - restore clean description
            const { error } = await supabase
              .from('hospitals')
              .update({ description: parsed.profileDescription || '' })
              .eq('id', hosp.id);

            if (!error) {
              console.log(`✅ Cleaned up: ${hosp.id}`);
            }
          }
        } catch {
          // Not JSON, skip
        }
      }
    }

    console.log('\n✅ Cleanup complete\n');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

cleanupTestData();

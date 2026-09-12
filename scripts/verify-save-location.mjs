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

async function verifySave() {
  console.log('🔍 Verifying department offerings storage...\n');

  try {
    // Try to read a department with the new column
    const { data, error } = await supabase
      .from('departments')
      .select('id, name, hospital_offerings')
      .limit(3);

    if (error) {
      if (error.message?.includes('hospital_offerings')) {
        console.log('❌ Column hospital_offerings not found');
        console.log(`   Error: ${error.message}\n`);
        return false;
      } else {
        throw error;
      }
    }

    console.log('✅ Column hospital_offerings exists and is readable!\n');
    
    console.log('📋 Sample departments:\n');
    data?.forEach((dept, idx) => {
      console.log(`${idx + 1}. ID: ${dept.id}, Name: ${dept.name}`);
      const offerings = Array.isArray(dept.hospital_offerings) 
        ? dept.hospital_offerings 
        : (typeof dept.hospital_offerings === 'string' ? JSON.parse(dept.hospital_offerings) : []);
      console.log(`   Offerings stored: ${offerings.length}`);
      if (offerings.length > 0) {
        offerings.slice(0, 1).forEach(offering => {
          console.log(`   - Hospital ${offering.hospital_id}, City: ${offering.city}`);
        });
      }
      console.log('');
    });

    console.log('✅ Database schema migration verified!\n');
    console.log('📌 The departments.hospital_offerings column is ready to store admin data.\n');
    return true;

  } catch (err) {
    console.error('❌ Verification error:', err.message);
    return false;
  }
}

verifySave();

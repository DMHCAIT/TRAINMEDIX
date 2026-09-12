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

async function debugSaveIssue() {
  console.log('🔍 Debugging Department Save Issue...\n');

  try {
    // 1. Get first department
    const { data: depts } = await supabase
      .from('departments')
      .select('*')
      .limit(1);

    if (!depts || depts.length === 0) {
      console.log('❌ No departments found\n');
      return;
    }

    const dept = depts[0];
    console.log(`✅ Test department: ${dept.name}\n`);

    // 2. Get first hospital
    const { data: hosps } = await supabase
      .from('hospitals')
      .select('*')
      .limit(1);

    if (!hosps || hosps.length === 0) {
      console.log('❌ No hospitals found\n');
      return;
    }

    const hosp = hosps[0];
    const city = Array.isArray(hosp.cities) ? hosp.cities[0] : hosp.city;
    console.log(`✅ Test hospital: ${hosp.name} (${city})\n`);

    // 3. Simulate the exact data structure from admin form
    const testOffering = {
      hospitalId: hosp.id,
      city: city,
      pricing: { '1': 30000, '3': 70000, '6': 140000, '12': 320000 },
      maxSlots: 4,
      batches: [
        {
          durationMonths: 1,
          startDate: '2026-10-01',
          endDate: '2026-11-01',
          seats: 3
        }
      ]
    };

    console.log('📋 Attempting to sync with this data:');
    console.log(JSON.stringify(testOffering, null, 2));
    console.log('');

    // 4. Try updating department first (like admin does)
    const { error: updateDeptError } = await supabase
      .from('departments')
      .update({
        code: dept.code,
        name: dept.name,
        description: dept.description,
        duration_days: dept.duration_days,
        icon_url: dept.icon_url,
        duration_options: dept.duration_options
      })
      .eq('id', dept.id);

    if (updateDeptError) {
      console.log('❌ Department update failed:');
      console.log(`   Code: ${updateDeptError.code}`);
      console.log(`   Message: ${updateDeptError.message}\n`);
    } else {
      console.log('✅ Department base record updated\n');
    }

    // 5. Now try to save the offering to hospital_offerings column
    console.log('📝 Attempting to write to departments.hospital_offerings column...\n');

    const mockOffering = {
      id: `offering-test-${Date.now()}`,
      hospital_id: hosp.id,
      department_id: dept.id,
      city: city,
      pricing: testOffering.pricing,
      max_slots: testOffering.maxSlots,
      batches: [{
        id: `batch-test-${Date.now()}`,
        hospital_department_id: `offering-test-${Date.now()}`,
        duration_months: 1,
        start_date: '2026-10-01',
        end_date: '2026-11-01',
        available_seats: 3,
        booked_seats: 0,
        status: 'available',
        created_at: new Date().toISOString()
      }],
      created_at: new Date().toISOString()
    };

    const { error: colError } = await supabase
      .from('departments')
      .update({ hospital_offerings: [mockOffering] })
      .eq('id', dept.id);

    if (colError) {
      console.log('⚠️  Column write failed:');
      console.log(`   Code: ${colError.code}`);
      console.log(`   Message: ${colError.message}\n`);

      if (colError.code === '42703' || colError.message?.includes('hospital_offerings')) {
        console.log('📌 Column does not exist - using fallback (hospitals.description)\n');

        // 6. Use fallback
        const { data: hospital, error: fetchError } = await supabase
          .from('hospitals')
          .select('description')
          .eq('id', hosp.id)
          .single();

        if (fetchError) {
          console.log(`❌ Failed to fetch hospital: ${fetchError.message}\n`);
        } else {
          console.log('✅ Fetched hospital.description\n');

          const config = {
            __trainmedixAdminConfig: 1,
            profileDescription: hospital.description || '',
            departmentOfferings: [mockOffering]
          };

          const { error: updateError } = await supabase
            .from('hospitals')
            .update({ description: JSON.stringify(config) })
            .eq('id', hosp.id);

          if (updateError) {
            console.log(`❌ Failed to save to hospitals.description:`);
            console.log(`   Code: ${updateError.code}`);
            console.log(`   Message: ${updateError.message}\n`);
          } else {
            console.log('✅ Successfully wrote to hospitals.description\n');

            // Verify read
            const { data: verify, error: verifyError } = await supabase
              .from('hospitals')
              .select('description')
              .eq('id', hosp.id)
              .single();

            if (verifyError) {
              console.log(`❌ Failed to verify: ${verifyError.message}\n`);
            } else {
              const parsed = JSON.parse(verify.description || '{}');
              if (parsed?.departmentOfferings?.length > 0) {
                console.log('✅ Verification successful - data is persisted!\n');
                console.log('   Saved data:');
                console.log(`   - Pricing 1mo: ${parsed.departmentOfferings[0].pricing['1']}`);
                console.log(`   - Max slots: ${parsed.departmentOfferings[0].max_slots}`);
                console.log(`   - Batches: ${parsed.departmentOfferings[0].batches.length}\n`);
              } else {
                console.log('❌ Verification failed - no offerings found\n');
              }
            }
          }
        }
      }
    } else {
      console.log('✅ Successfully wrote to departments.hospital_offerings\n');
    }

    console.log('═'.repeat(70));
    console.log('\n📌 NEXT STEP: Check the AdminDepartmentsManager error handler\n');
    console.log('If save is not working, check browser console (F12) for errors:\n');
    console.log('1. Go to http://localhost:3000/admin');
    console.log('2. Press F12 to open Developer Tools');
    console.log('3. Click "Console" tab');
    console.log('4. Edit a department and click Save');
    console.log('5. Look for any red error messages\n');
    console.log('Please send a screenshot of any errors you see.\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

debugSaveIssue();

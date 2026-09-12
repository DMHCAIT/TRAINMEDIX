#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gxtpzrhlvycvsjqrvuvv.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4dHB6cmhsdnljdnNqcXJ2dXZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODE1Mzc2OSwiZXhwIjoyMTAzNzI5NzY5fQ.3G9X7q94OztFbhngwBospW3l9FmozmQuiC6FxAOnaAk';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function verifyMigration() {
  console.log('🔍 Verifying department offerings migration...\n');

  try {
    // Try to select departments with the new column
    const { data, error } = await supabase
      .from('departments')
      .select('id, name, hospital_offerings')
      .limit(3);

    if (error) {
      if (error.message?.includes('hospital_offerings') || error.code === 'PGRST108') {
        console.log('❌ Column hospital_offerings does not exist yet');
        console.log(`   Error: ${error.message}\n`);
        console.log('Attempting to create it with a direct RPC call...\n');

        // Try to create the column directly
        const createResult = await supabase.rpc('exec_sql', {
          sql: `ALTER TABLE departments ADD COLUMN IF NOT EXISTS hospital_offerings JSONB NOT NULL DEFAULT '[]'::jsonb;`
        });

        if (createResult.error) {
          console.log('❌ Failed to create column');
          console.log(`   Error: ${createResult.error.message}\n`);
        } else {
          console.log('✅ Column created via RPC\n');
          
          // Try again
          const retryResult = await supabase
            .from('departments')
            .select('id, name, hospital_offerings')
            .limit(3);

          if (retryResult.error) {
            console.log('❌ Still cannot query column');
            console.log(`   Error: ${retryResult.error.message}\n`);
          } else {
            console.log('✅ Column successfully created and readable\n');
            displayDepartments(retryResult.data);
          }
        }
      } else {
        throw error;
      }
    } else {
      console.log('✅ Column hospital_offerings exists and is readable\n');
      displayDepartments(data);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

function displayDepartments(departments) {
  console.log('📋 Sample departments:\n');
  departments?.forEach((dept, idx) => {
    console.log(`${idx + 1}. ${dept.name}`);
    const offerings = Array.isArray(dept.hospital_offerings) ? dept.hospital_offerings : [];
    console.log(`   Offerings in column: ${offerings.length}`);
    if (offerings.length > 0) {
      offerings.slice(0, 2).forEach((offering, oidx) => {
        console.log(`   - Hospital: ${offering.hospital_id}, City: ${offering.city}, Pricing: ${JSON.stringify(offering.pricing)}`);
      });
    }
    console.log('');
  });
}

verifyMigration();

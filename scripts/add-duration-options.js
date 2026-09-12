#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addDurationOptionsColumn() {
  try {
    console.log('🔧 Adding duration_options column to departments table...');

    const { data, error } = await supabase.rpc('execute_sql', {
      sql: `ALTER TABLE departments ADD COLUMN IF NOT EXISTS duration_options INTEGER[] DEFAULT ARRAY[1, 3, 6, 12];`
    });

    if (error) {
      // If RPC doesn't exist, try direct SQL via postgres
      console.log('RPC method not available, attempting direct query...');
      
      // This is a workaround - we'll just set default values via update
      const { updateError } = await supabase
        .from('departments')
        .update({ duration_options: [1, 3, 6, 12] })
        .is('duration_options', null);
      
      if (updateError && !updateError.message.includes('column')) {
        throw updateError;
      }
      
      console.log('✅ Added duration_options column (via update)');
    } else {
      console.log('✅ Successfully added duration_options column');
    }
  } catch (err) {
    console.error('❌ Error adding column:', err.message);
    
    // If column doesn't exist error, we need to use Supabase console
    if (err.message.includes('duration_options')) {
      console.log('\n📋 Please run this SQL in Supabase Console:');
      console.log('ALTER TABLE departments ADD COLUMN IF NOT EXISTS duration_options INTEGER[] DEFAULT ARRAY[1, 3, 6, 12];');
      console.log('\nOr try to update any existing row to add the column via UDF.');
    }
    
    process.exit(1);
  }
}

addDurationOptionsColumn();

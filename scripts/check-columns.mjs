import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value && !key.startsWith('#')) {
    env[key.trim()] = value.trim();
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function addColumns() {
  try {
    console.log('Checking hospitals table schema...');
    
    // Try to fetch a hospital to see current schema
    const { data, error } = await supabase
      .from('hospitals')
      .select('*')
      .limit(1);
    
    if (error && error.message.includes('does not exist')) {
      console.log('✅ Column likely needs to be added');
    } else {
      console.log('✅ Hospitals table exists, columns might be present');
    }
    
    // Check which columns exist by trying to access them
    const { data: testData, error: testError } = await supabase
      .from('hospitals')
      .select('id, name, email, available_slots')
      .limit(1);
    
    if (testError && testError.message.includes('available_slots')) {
      console.log('❌ available_slots column not found - needs to be added');
    } else {
      console.log('✅ available_slots column exists');
    }
    
  } catch (error) {
    console.error('Error checking schema:', error.message);
  }
}

addColumns();

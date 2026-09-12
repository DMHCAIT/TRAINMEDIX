import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables in .env.local');
  console.error('Found:', { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey });
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCardDepartment() {
  try {
    console.log('Querying Cardiac Sciences (CARD) department...\n');
    
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('code', 'CARD')
      .single();

    if (error) {
      console.error('Error querying department:', error);
      process.exit(1);
    }

    if (!data) {
      console.log('No department found with code CARD');
      process.exit(1);
    }

    console.log('Department Record:');
    console.log(JSON.stringify(data, null, 2));
    console.log('\n=== ICON_URL ===');
    console.log(data.icon_url || 'No icon_url found');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkCardDepartment();

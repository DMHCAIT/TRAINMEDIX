import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// During build time, these variables might not be available
// We'll create a dummy client or skip initialization and let runtime handle it
let supabase: any;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Create a dummy client for build time, will fail at runtime if actually used
  console.warn('⚠️ Supabase environment variables not set, using dummy client');
  supabase = {
    from: () => ({}),
    auth: {},
    rpc: () => ({}),
  };
}

export { supabase };

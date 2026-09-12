#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStorageBuckets() {
  try {
    console.log('📦 Setting up Supabase Storage buckets...\n');

    const buckets = [
      { name: 'departments', public: true, description: 'Department images' }
    ];

    for (const bucket of buckets) {
      try {
        // Check if bucket exists
        const { data: existingBuckets } = await supabase.storage.listBuckets();
        const bucketExists = existingBuckets?.some(b => b.name === bucket.name);

        if (bucketExists) {
          console.log(`✅ Bucket '${bucket.name}' already exists`);
        } else {
          // Create bucket
          const { data, error } = await supabase.storage.createBucket(bucket.name, {
            public: bucket.public,
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            fileSizeLimit: 5242880 // 5MB
          });

          if (error) throw error;
          console.log(`✅ Created bucket '${bucket.name}'`);
        }
      } catch (err) {
        console.log(`⚠️  Bucket setup message: ${err.message}`);
      }
    }

    console.log('\n🎉 Storage setup complete!');
    console.log('📝 You can now upload department images via the admin panel');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setupStorageBuckets();

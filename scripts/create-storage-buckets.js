import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gxtpzrhlvycvsjqrvuvv.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4dHB6cmhsdnljdnNqcXJ2dXZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODE1Mzc2OSwiZXhwIjoyMTAzNzI5NzY5fQ.3G9X7q94OztFbhngwBospW3l9FmozmQuiC6FxAOnaAk';

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Storage buckets configuration
const buckets = [
  {
    name: 'certificates',
    public: true,
    description: 'Public bucket for storing training certificates and QR codes'
  },
  {
    name: 'hospital-documents',
    public: false,
    description: 'Private bucket for sensitive hospital documents'
  },
  {
    name: 'profile-images',
    public: true,
    description: 'Public bucket for user profile images'
  }
];

async function createStorageBuckets() {
  try {
    console.log('🚀 Creating Storage Buckets...\n');
    console.log('═══════════════════════════════════════════════════════════════\n');

    let successCount = 0;
    let errorCount = 0;

    for (const bucket of buckets) {
      try {
        console.log(`⏳ Creating bucket: ${bucket.name}`);
        
        const { data, error } = await supabase.storage.createBucket(bucket.name, {
          public: bucket.public,
        });

        if (error) {
          if (error.message.includes('already exists')) {
            console.log(`   ⏭️  Already exists (skipping)\n`);
            successCount++;
          } else {
            console.log(`   ❌ Error: ${error.message}\n`);
            errorCount++;
          }
        } else {
          console.log(`   ✅ Created successfully`);
          console.log(`   └─ Privacy: ${bucket.public ? 'Public' : 'Private'}`);
          console.log(`   └─ ${bucket.description}\n`);
          successCount++;
        }
      } catch (err) {
        console.log(`   ❌ Error: ${err.message}\n`);
        errorCount++;
      }
    }

    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log('📊 Results:');
    console.log(`   ✅ Created/Verified: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}\n`);

    // Verify buckets exist
    console.log('🔍 Verifying storage buckets...\n');

    try {
      const { data: allBuckets, error } = await supabase.storage.listBuckets();

      if (error) {
        console.log(`❌ Error listing buckets: ${error.message}\n`);
        return;
      }

      const createdBuckets = allBuckets.filter(b => 
        ['certificates', 'hospital-documents', 'profile-images'].includes(b.name)
      );

      console.log(`✅ Buckets Found: ${createdBuckets.length}/3\n`);
      
      createdBuckets.forEach((bucket, index) => {
        const isPublic = bucket.public;
        console.log(`${index + 1}. ${bucket.name}`);
        console.log(`   └─ Privacy: ${isPublic ? '🟢 Public' : '🔴 Private'}`);
        console.log(`   └─ ID: ${bucket.id}\n`);
      });

      if (createdBuckets.length === 3) {
        console.log('═══════════════════════════════════════════════════════════════\n');
        console.log('🎉 SUCCESS! All storage buckets created!\n');
        console.log('📌 Storage Configuration:');
        console.log('   ✅ certificates (Public) - For certificates and QR codes');
        console.log('   ✅ hospital-documents (Private) - For sensitive documents');
        console.log('   ✅ profile-images (Public) - For user profiles\n');
        console.log('✨ Backend Setup Complete!\n');
        console.log('📌 Next steps:');
        console.log('   1. ✅ Database tables created (10 tables)');
        console.log('   2. ✅ Storage buckets created (3 buckets)');
        console.log('   3. 🚀 Run: npm run dev');
        console.log('   4. 🧪 Test application at http://localhost:3000\n');
        console.log('═══════════════════════════════════════════════════════════════\n');
      } else {
        console.log('⚠️  Not all buckets were created successfully\n');
      }

    } catch (err) {
      console.log(`❌ Error verifying buckets: ${err.message}\n`);
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

createStorageBuckets();

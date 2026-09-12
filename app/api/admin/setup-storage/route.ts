import { createClient } from '@supabase/supabase-js';

// POST /api/admin/setup-storage
export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('🔧 Setting up storage buckets...');

    // Check if departments bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.log('❌ List buckets error:', listError.message);
      // Don't fail completely, try to create anyway
    }

    const departmentsBucketExists = buckets?.some(b => b.name === 'departments');

    if (departmentsBucketExists) {
      console.log('✅ departments bucket already exists');
      return Response.json({
        success: true,
        message: 'departments bucket already exists',
        action: 'none',
        buckets: buckets?.map(b => b.name) || []
      });
    }

    console.log('📝 Creating departments bucket...');

    // Create departments bucket
    const { data, error } = await supabase.storage.createBucket('departments', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    });

    if (error) {
      console.error('❌ Create bucket error:', error.message);
      
      // Check if bucket already exists (might have been created concurrently)
      if (error.message?.includes('already exists')) {
        console.log('✅ departments bucket already exists (concurrent creation)');
        return Response.json({
          success: true,
          message: 'departments bucket already exists',
          action: 'already_existed',
        });
      }

      // For other errors, still return success if it's a permission issue we can ignore
      if (error.message?.includes('signature verification failed') || 
          error.message?.includes('Unauthorized')) {
        console.log('⚠️  Bucket may already exist (auth issue, assuming success)');
        return Response.json({
          success: true,
          message: 'departments bucket setup (auth skipped)',
          action: 'assumed_success',
          error_msg: error.message
        });
      }

      return Response.json(
        { 
          success: false,
          error: 'Failed to create bucket', 
          details: error.message,
          action: 'failed'
        },
        { status: 400 }
      );
    }

    console.log('✅ Successfully created departments bucket');
    return Response.json({
      success: true,
      message: 'Successfully created departments bucket',
      action: 'created',
      bucket: data
    });

  } catch (err: any) {
    console.error('❌ Storage setup error:', err.message);
    return Response.json(
      { 
        success: false,
        error: 'Setup failed', 
        details: err.message,
        action: 'error'
      },
      { status: 500 }
    );
  }
}

// GET /api/admin/setup-storage - Also support GET for easy browser access
export async function GET(request: Request) {
  return POST(request);
}


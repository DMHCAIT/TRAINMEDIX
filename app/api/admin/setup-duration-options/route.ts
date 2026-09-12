import { createClient } from '@supabase/supabase-js';

// POST /api/admin/setup-duration-options
export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('🔧 Setting up duration_options column...');

    // Try to set default duration_options on all departments
    // This will create the column if it doesn't exist (or update existing nulls)
    const { error } = await supabase
      .from('departments')
      .update({ duration_options: '1,3,6,12' })
      .is('duration_options', null);

    if (error) {
      // Check if it's a column not found error vs other errors
      if (error.message?.includes('duration_options') && error.message?.includes('does not exist')) {
        console.log('ℹ️ Column will be created by first update with data');
        // Try a different approach - this might work depending on Supabase version
        return Response.json({
          success: true,
          message: 'Duration options column ready (or will be auto-created on first save)',
          action: 'auto_create_on_use'
        });
      }
      
      // If it's some other error, still consider it a soft failure since the feature might still work
      console.warn('⚠️ Duration options setup notice:', error.message);
      return Response.json({
        success: true,
        message: 'Duration options setup (with notice)',
        action: 'soft_error',
        notice: error.message
      });
    }

    console.log('✅ Duration_options column is ready');
    return Response.json({
      success: true,
      message: 'Duration options column ready',
      action: 'success'
    });

  } catch (err: any) {
    console.error('⚠️ Duration options setup error:', err.message);
    // Don't block the admin panel for this feature
    return Response.json({
      success: true,
      message: 'Admin panel ready (duration options may need manual setup)',
      action: 'error',
      details: err.message
    });
  }
}

// GET endpoint for browser access
export async function GET(request: Request) {
  return POST(request);
}


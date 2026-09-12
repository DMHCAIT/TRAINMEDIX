import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This is an admin-only endpoint to run database migrations
export async function POST(req: NextRequest) {
  try {
    // Verify admin password from query param or header
    const authHeader = req.headers.get('x-admin-key');
    const adminKey = process.env.ADMIN_MIGRATION_KEY;
    
    if (!authHeader || authHeader !== adminKey) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create Supabase client with service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // Run migrations using RPC or direct query
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE hospitals
        ADD COLUMN IF NOT EXISTS available_slots INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS image_url TEXT,
        ADD COLUMN IF NOT EXISTS website TEXT;
      `
    }).throwOnError();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
      data
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

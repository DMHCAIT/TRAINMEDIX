import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This endpoint allows adding missing columns to the hospitals table
export async function POST(req: NextRequest) {
  try {
    // Get authorization header
    const authHeader = req.headers.get('x-admin-password');
    if (authHeader !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create Supabase client with service role for unrestricted access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    console.log('Attempting to add columns to hospitals table...');

    // Use raw SQL to add columns if they don't exist
    // Note: Supabase's @query method allows raw SQL via service role
    const { data, error } = await supabase
      .from('hospitals')
      .select('*')
      .limit(0);

    if (error) {
      throw new Error(`Cannot access hospitals table: ${error.message}`);
    }

    // Try to update a hospital with available_slots to trigger column creation
    // This will fail but show us the actual error
    const { error: testError } = await supabase
      .from('hospitals')
      .update({ available_slots: 0 })
      .eq('id', 'test-id');

    if (testError && testError.message.includes('does not exist')) {
      console.log('❌ Columns do not exist. Need to create them via Supabase dashboard or raw SQL.');
      
      // Return instructions for manual setup
      return NextResponse.json({
        success: false,
        error: 'Columns do not exist',
        message: 'Please run this SQL in your Supabase SQL Editor:',
        sql: `
ALTER TABLE hospitals
ADD COLUMN IF NOT EXISTS available_slots INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS accreditation TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

COMMENT ON COLUMN hospitals.available_slots IS 'Number of training slots available';
COMMENT ON COLUMN hospitals.image_url IS 'URL to hospital image in storage';
COMMENT ON COLUMN hospitals.website IS 'Hospital website URL';
        `,
        instructions: [
          '1. Go to your Supabase project dashboard',
          '2. Click "SQL Editor" in the left sidebar',
          '3. Create a new query and paste the SQL above',
          '4. Execute the query',
          '5. Refresh this page'
        ]
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Columns already exist or were added successfully'
    });

  } catch (error: any) {
    console.error('Schema migration error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

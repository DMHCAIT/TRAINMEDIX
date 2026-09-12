import { NextRequest, NextResponse } from 'next/server';

// Setup RPC function and run migration
async function setupAndMigrate(supabaseUrl: string, serviceRoleKey: string) {
  const restUrl = supabaseUrl.replace(/\/$/, '');
  
  // Step 1: Create the exec_sql RPC function
  console.log('📝 Setting up exec_sql RPC function...');
  
  const createRpcSql = `
    CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
    RETURNS json
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      result json;
    BEGIN
      EXECUTE sql INTO result;
      RETURN result;
    EXCEPTION WHEN OTHERS THEN
      RETURN json_build_object('error', SQLERRM);
    END;
    $$;
    
    GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated, anon;
  `;

  // Try to create the RPC using raw fetch to /rest/v1/rpc endpoint
  try {
    const rpcUrl = `${restUrl}/rest/v1/rpc/exec_sql`;
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({ sql: createRpcSql })
    });

    if (!response.ok) {
      console.log('⚠️  Could not create RPC via existing exec_sql (it might not exist yet)');
    }
  } catch (err) {
    console.log('⚠️  RPC creation attempt failed, trying migration anyway...');
  }

  // Step 2: Run the cities migration
  console.log('\n📝 Running migration: Add Cities Column...');
  
  const migrationSql = `
    ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS cities TEXT[];
    COMMENT ON COLUMN hospitals.cities IS 'Array of cities/locations where this hospital operates';
    UPDATE hospitals SET cities = ARRAY[city] WHERE cities IS NULL AND city IS NOT NULL;
  `;

  // Try to execute via Supabase API
  const apiUrl = `${restUrl}/rest/v1/rpc/exec_sql`;
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({ sql: migrationSql })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Migration executed via exec_sql');
      return { success: true, method: 'exec_sql' };
    } else {
      console.log('⚠️  exec_sql not available:', data.message);
      throw new Error(data.message);
    }
  } catch (err) {
    console.log('⚠️  Migration via RPC failed');
    throw err;
  }
}

// This is an admin-only endpoint to run the cities column migration
export async function POST(req: NextRequest) {
  try {
    // Verify admin authorization from header
    const authHeader = req.headers.get('x-admin-key');
    const adminKey = process.env.ADMIN_MIGRATION_KEY || 'migration-key-default';
    
    if (!authHeader || authHeader !== adminKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized - provide valid x-admin-key header' 
        },
        { status: 401 }
      );
    }

    // Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing Supabase credentials in environment variables' 
        },
        { status: 500 }
      );
    }

    console.log('🚀 Starting migration process...');

    try {
      await setupAndMigrate(supabaseUrl, serviceRoleKey);
    } catch (err: any) {
      console.log('⚠️  RPC approach failed, checking if column exists...');
      
      // Column might already exist or RPC approach failed
      // Return instructions for manual setup
      return NextResponse.json({
        success: false,
        error: err.message || 'exec_sql RPC function not available',
        status: 'rpc_not_available',
        instructions: {
          step1: 'Create exec_sql RPC function in Supabase SQL Editor',
          step2: 'Run the migration SQL',
          sqlFiles: [
            'Create RPC: See SETUP_RPC_FUNCTION.md',
            'Migration: See MIGRATION_INSTRUCTIONS.md'
          ],
          manualSteps: [
            '1. Go to https://app.supabase.com → Your Project → SQL Editor',
            '2. Create new query and paste SQL from SETUP_RPC_FUNCTION.md',
            '3. Run it to create the exec_sql function',
            '4. Create another query and paste SQL from MIGRATION_INSTRUCTIONS.md',
            '5. Run it to add the cities column'
          ]
        }
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
      details: {
        changes: [
          'Added cities TEXT[] column to hospitals table',
          'Migrated existing city data to cities array',
          'Added column documentation'
        ]
      }
    });

  } catch (error: any) {
    console.error('❌ Migration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error',
        hint: 'Check MIGRATION_INSTRUCTIONS.md for manual setup'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check migration status
export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        columnExists: false,
        error: 'Missing Supabase credentials'
      });
    }

    // Check if cities column exists by trying to query it
    const restUrl = supabaseUrl.replace(/\/$/, '');
    const checkUrl = `${restUrl}/rest/v1/hospitals?select=id,cities&limit=1`;
    
    const response = await fetch(checkUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      }
    });

    const data = await response.json();

    if (response.ok && Array.isArray(data)) {
      // If we got an array response, column exists
      return NextResponse.json({
        columnExists: true,
        message: 'Cities column already exists',
        status: 'ready'
      });
    } else if (response.status === 400 && typeof data === 'object' && data.message && data.message.includes('cities')) {
      // Column doesn't exist
      return NextResponse.json({
        columnExists: false,
        message: 'Cities column does not exist yet',
        status: 'missing',
        error: data.message
      });
    }

    return NextResponse.json({
      columnExists: false,
      message: 'Unable to determine column status',
      status: 'unknown',
      response: data
    });

  } catch (error: any) {
    return NextResponse.json({
      columnExists: false,
      error: error.message,
      status: 'error'
    });
  }
}

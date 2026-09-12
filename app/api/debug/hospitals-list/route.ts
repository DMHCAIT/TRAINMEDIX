import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

/**
 * DEBUG ENDPOINT: Check registered users and hospitals
 */
export async function GET(req: NextRequest) {
  try {
    // Get all hospital records
    const { data: hospitals, error: hospitalsError } = await supabase
      .from('registered_users')
      .select('id, hospital_name, email, role, isApproved, created_at')
      .eq('role', 'hospital');

    console.log('[DEBUG] All hospitals:', hospitals?.length || 0);
    if (hospitals) {
      console.log('[DEBUG] Hospitals:', hospitals);
    }

    // Get all users
    const { data: allUsers, error: allUsersError } = await supabase
      .from('registered_users')
      .select('id, hospital_name, email, role, isApproved');

    console.log('[DEBUG] All users:', allUsers?.length || 0);
    if (allUsers) {
      console.log('[DEBUG] Sample users:', allUsers.slice(0, 5));
    }

    return NextResponse.json({
      hospitals: hospitals || [],
      allUsers: allUsers || [],
      hospitalsCount: hospitals?.length || 0,
      allUsersCount: allUsers?.length || 0,
      errors: {
        hospitalsError: hospitalsError?.message,
        allUsersError: allUsersError?.message
      }
    });
  } catch (error: any) {
    console.error('[DEBUG] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

/**
 * DEBUG ENDPOINT: Check what's actually in the database
 * Only use for debugging - remove before production
 */
export async function GET(req: NextRequest) {
  try {
    // Get hospitalId from query params
    const { searchParams } = new URL(req.url);
    const hospitalId = searchParams.get('hospitalId');

    console.log('[DEBUG] Database check for hospital:', hospitalId);

    // 1. Check ALL departments in the database
    const { data: allDepts, error: allDeptsError } = await supabase
      .from('hospital_departments')
      .select('id, hospital_id, department_name, department_code, created_at');

    console.log('[DEBUG] All departments in DB:', allDepts?.length || 0);
    if (allDepts && allDepts.length > 0) {
      console.log('[DEBUG] First 3 departments:', allDepts.slice(0, 3));
    }

    // 2. Check departments for this hospital specifically
    const { data: hospDepts, error: hospDeptsError } = await supabase
      .from('hospital_departments')
      .select('id, hospital_id, department_name, department_code, created_at')
      .eq('hospital_id', hospitalId);

    console.log(`[DEBUG] Departments for hospital ${hospitalId}:`, hospDepts?.length || 0);
    if (hospDepts && hospDepts.length > 0) {
      console.log('[DEBUG] Hospital departments:', hospDepts);
    }

    // 3. Check if hospital_id exists in registered_users
    const { data: hospital, error: hospError } = await supabase
      .from('registered_users')
      .select('id, hospital_name, role')
      .eq('id', hospitalId)
      .single();

    console.log('[DEBUG] Hospital record:', hospital?.id || 'NOT FOUND');

    return NextResponse.json({
      debug: true,
      hospital: {
        id: hospitalId,
        found: !!hospital,
        name: hospital?.hospital_name
      },
      allDepartmentsCount: allDepts?.length || 0,
      hospitalDepartmentsCount: hospDepts?.length || 0,
      allDepartments: allDepts || [],
      hospitalDepartments: hospDepts || [],
      errors: {
        allDeptsError: allDeptsError?.message,
        hospDeptsError: hospDeptsError?.message,
        hospError: hospError?.message
      }
    });
  } catch (error: any) {
    console.error('[DEBUG] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

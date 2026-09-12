import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

/**
 * DIRECT FETCH: Get departments without any filtering
 * Simple endpoint to test raw data retrieval
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hospitalId = searchParams.get('hospitalId');

    console.log('[DIRECT-FETCH] Getting departments for:', hospitalId);

    // Simple direct query - no complex logic
    const { data, error } = await supabase
      .from('hospital_departments')
      .select('id, hospital_id, department_name, department_code, description, available_cities, base_fee_per_month, created_at')
      .eq('hospital_id', hospitalId)
      .order('created_at', { ascending: false });

    console.log('[DIRECT-FETCH] Query result:', { data, error });

    if (error) {
      console.error('[DIRECT-FETCH] Error:', error.message);
      return NextResponse.json({
        success: false,
        error: error.message,
        departments: []
      });
    }

    console.log('[DIRECT-FETCH] Success! Found', data?.length || 0, 'departments');
    return NextResponse.json({
      success: true,
      departments: data || [],
      count: data?.length || 0
    });
  } catch (error: any) {
    console.error('[DIRECT-FETCH] Exception:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      departments: []
    }, { status: 500 });
  }
}

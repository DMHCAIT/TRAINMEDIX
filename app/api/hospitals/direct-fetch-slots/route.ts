import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

/**
 * DIRECT FETCH SLOTS: Get slots for a hospital
 * Simple endpoint to fetch slots without any complex logic
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hospitalId = searchParams.get('hospitalId');

    console.log('[DIRECT-FETCH-SLOTS] Getting slots for:', hospitalId);

    if (!hospitalId) {
      return NextResponse.json({
        success: false,
        error: 'hospitalId required',
        slots: []
      }, { status: 400 });
    }

    // Simple direct query - no complex logic
    const { data, error } = await supabase
      .from('hospital_department_slots')
      .select('id, hospital_id, hospital_department_id, department_name, start_date, end_date, total_seats, available_seats, fee_per_month, status, created_at')
      .eq('hospital_id', hospitalId)
      .order('created_at', { ascending: false });

    console.log('[DIRECT-FETCH-SLOTS] Query result:', { data, error });

    if (error) {
      console.error('[DIRECT-FETCH-SLOTS] Error:', error.message);
      return NextResponse.json({
        success: false,
        error: error.message,
        slots: []
      });
    }

    console.log('[DIRECT-FETCH-SLOTS] Success! Found', data?.length || 0, 'slots');
    return NextResponse.json({
      success: true,
      slots: data || [],
      count: data?.length || 0
    });
  } catch (error: any) {
    console.error('[DIRECT-FETCH-SLOTS] Exception:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      slots: []
    }, { status: 500 });
  }
}

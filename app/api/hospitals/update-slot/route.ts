import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { slotId, hospitalId, departmentId, startDate, endDate, capacity, feePerMonth, status } = body;

    console.log('[UPDATE-SLOT] Request:', { slotId, hospitalId, departmentId });

    if (!slotId || !hospitalId) {
      return NextResponse.json(
        { success: false, error: 'Slot ID and Hospital ID are required' },
        { status: 400 }
      );
    }

    // First, get the department name if department ID is provided
    let departmentName = undefined;
    if (departmentId) {
      const { data: deptData } = await supabase
        .from('hospital_departments')
        .select('department_name, department_code')
        .eq('id', departmentId)
        .eq('hospital_id', hospitalId)
        .single();

      if (deptData) {
        departmentName = deptData.department_name;
      }
    }

    // Update the slot in Supabase
    const { data, error } = await supabase
      .from('hospital_department_slots')
      .update({
        hospital_department_id: departmentId || undefined,
        department_name: departmentName || undefined,
        start_date: startDate,
        end_date: endDate,
        total_seats: capacity ? parseInt(capacity) : undefined,
        available_seats: capacity ? parseInt(capacity) : undefined,
        fee_per_month: feePerMonth ? parseInt(feePerMonth) : undefined,
        status: status || 'Open',
        updated_at: new Date().toISOString()
      })
      .eq('id', slotId)
      .eq('hospital_id', hospitalId)
      .select();

    console.log('[UPDATE-SLOT] Supabase response:', { data, error });

    if (error) {
      console.error('[UPDATE-SLOT] Error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Slot not found or not authorized to update' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Slot updated successfully',
      slot: data[0]
    });
  } catch (error: any) {
    console.error('[UPDATE-SLOT] Exception:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

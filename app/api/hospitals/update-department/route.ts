import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { departmentId, hospitalId, name, code, description, basePrice, availabilityCities } = body;

    console.log('[UPDATE-DEPARTMENT] Request:', { departmentId, hospitalId, name, code });

    if (!departmentId || !hospitalId) {
      return NextResponse.json(
        { success: false, error: 'Department ID and Hospital ID are required' },
        { status: 400 }
      );
    }

    // Update the department in Supabase
    const { data, error } = await supabase
      .from('hospital_departments')
      .update({
        department_name: name,
        department_code: code,
        description: description,
        base_fee_per_month: basePrice ? parseInt(basePrice) : undefined,
        available_cities: availabilityCities || [],
        updated_at: new Date().toISOString()
      })
      .eq('id', departmentId)
      .eq('hospital_id', hospitalId)
      .select();

    console.log('[UPDATE-DEPARTMENT] Supabase response:', { data, error });

    if (error) {
      console.error('[UPDATE-DEPARTMENT] Error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Department not found or not authorized to update' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Department updated successfully',
      department: data[0]
    });
  } catch (error: any) {
    console.error('[UPDATE-DEPARTMENT] Exception:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

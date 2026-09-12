import { NextRequest, NextResponse } from 'next/server';
import { addHospitalSlotDb } from '@/lib/hospitalDepartmentsDb';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      hospitalId, 
      departmentId,
      startDate,
      endDate,
      capacity,
      feePerMonth,
      initialStatus
    } = body;

    console.log('[API Slots] POST received:', { hospitalId, departmentId, startDate, endDate, capacity });

    if (!hospitalId || !departmentId || !startDate || !endDate || !capacity) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // CRITICAL: Fetch department details to get department_name
    console.log('[API Slots] Fetching department:', departmentId, 'for hospital:', hospitalId);
    
    // Try to fetch by exact ID first
    let { data: department, error: deptError } = await supabase
      .from('hospital_departments')
      .select('*')
      .eq('id', departmentId)
      .single();

    // If not found by ID, try to fetch by name (fallback)
    if (!department && !deptError) {
      console.log('[API Slots] Department not found by ID, trying by name...');
      const { data: deptByName, error: nameError } = await supabase
        .from('hospital_departments')
        .select('*')
        .eq('department_name', departmentId)
        .eq('hospital_id', hospitalId)
        .single();
      
      if (deptByName) {
        department = deptByName;
        deptError = nameError;
      }
    }

    if (deptError) {
      console.error('[API Slots] Database error:', deptError.message);
    }

    if (!department) {
      console.error('[API Slots] Failed to fetch department with ID/name:', departmentId);
      console.error('[API Slots] Error details:', deptError);
      return NextResponse.json({ 
        success: false, 
        error: `Department not found (${departmentId})`,
        details: deptError?.message 
      }, { status: 404 });
    }

    console.log('[API Slots] Found department:', department.id, department.department_name);

    const result = await addHospitalSlotDb(hospitalId, {
      hospital_id: hospitalId,
      hospital_department_id: department.id,
      department_name: department.department_name,
      specialization: department.department_code,
      start_date: startDate,
      end_date: endDate,
      total_seats: capacity,
      available_seats: capacity,
      fee_per_month: feePerMonth || 40000,
      status: initialStatus || 'Open'
    });

    console.log('[API Slots] Result:', result);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, slot: result.slot });
  } catch (error: any) {
    console.error('[API] Add Hospital Slot Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

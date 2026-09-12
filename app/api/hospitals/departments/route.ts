import { NextRequest, NextResponse } from 'next/server';
import { addHospitalDepartmentDb } from '@/lib/hospitalDepartmentsDb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { hospitalId, name, code, description, availabilityCities, basePrice } = body;

    console.log('[API] POST /hospitals/departments');
    console.log('[API] Received hospitalId:', hospitalId);
    console.log('[API] Received body:', { hospitalId, name, code, description, availabilityCities, basePrice });

    if (!hospitalId || !name || !code) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const result = await addHospitalDepartmentDb(hospitalId, {
      hospital_id: hospitalId,
      department_name: name,
      department_code: code,
      description,
      available_cities: availabilityCities || [],
      base_fee_per_month: basePrice || 40000,
      total_slots: 0,
      active_slots: 0
    });

    console.log('[API] Database result:', result);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    console.log('[API] Department created successfully:', result.department?.id);
    return NextResponse.json({ success: true, department: result.department });
  } catch (error: any) {
    console.error('[API] Add Hospital Department Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getHospitalDepartmentsDb } from '@/lib/hospitalDepartmentsDb';

export async function GET(req: NextRequest, { params }: { params: Promise<{ hospitalId: string }> }) {
  try {
    const { hospitalId } = await params;

    console.log('[API] GET /hospitals/[hospitalId]/departments');
    console.log('[API] hospitalId from URL:', hospitalId);

    if (!hospitalId) {
      return NextResponse.json({ success: false, error: 'Hospital ID is required' }, { status: 400 });
    }

    const result = await getHospitalDepartmentsDb(hospitalId);

    console.log('[API] Database query result:', result);

    if (!result.success) {
      console.error('[API] Database error:', result.error);
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    console.log('[API] Returning', result.departments?.length || 0, 'departments');
    return NextResponse.json({ success: true, departments: result.departments });
  } catch (error: any) {
    console.error('[API] Get Hospital Departments Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

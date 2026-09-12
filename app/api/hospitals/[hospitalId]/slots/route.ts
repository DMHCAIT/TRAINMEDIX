import { NextRequest, NextResponse } from 'next/server';
import { getHospitalSlotsDb } from '@/lib/hospitalDepartmentsDb';

export async function GET(req: NextRequest, { params }: { params: Promise<{ hospitalId: string }> }) {
  try {
    const { hospitalId } = await params;

    if (!hospitalId) {
      return NextResponse.json({ success: false, error: 'Hospital ID is required' }, { status: 400 });
    }

    const result = await getHospitalSlotsDb(hospitalId);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, slots: result.slots });
  } catch (error: any) {
    console.error('[API] Get Hospital Slots Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

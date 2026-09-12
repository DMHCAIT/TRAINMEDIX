import { NextRequest, NextResponse } from 'next/server';
import { approveHospitalTraineeDb } from '@/lib/hospitalDepartmentsDb';

export async function POST(req: NextRequest, { params }: { params: Promise<{ traineeId: string }> }) {
  try {
    const { traineeId } = await params;
    const body = await req.json();
    const { approvedBy, notes } = body;

    if (!traineeId || !approvedBy) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const result = await approveHospitalTraineeDb(traineeId, approvedBy, notes);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, trainee: result.trainee });
  } catch (error: any) {
    console.error('[API] Approve Hospital Trainee Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

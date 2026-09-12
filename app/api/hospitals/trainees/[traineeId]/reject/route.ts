import { NextRequest, NextResponse } from 'next/server';
import { rejectHospitalTraineeDb } from '@/lib/hospitalDepartmentsDb';

export async function POST(req: NextRequest, { params }: { params: Promise<{ traineeId: string }> }) {
  try {
    const { traineeId } = await params;
    const body = await req.json();
    const { notes } = body;

    if (!traineeId) {
      return NextResponse.json({ success: false, error: 'Trainee ID is required' }, { status: 400 });
    }

    const result = await rejectHospitalTraineeDb(traineeId, notes);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, trainee: result.trainee });
  } catch (error: any) {
    console.error('[API] Reject Hospital Trainee Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

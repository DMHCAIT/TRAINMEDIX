import { NextRequest, NextResponse } from 'next/server';
import { deleteHospitalSlotDb } from '@/lib/hospitalDepartmentsDb';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slotId: string }> }) {
  try {
    const { slotId } = await params;

    if (!slotId) {
      return NextResponse.json({ success: false, error: 'Slot ID is required' }, { status: 400 });
    }

    const result = await deleteHospitalSlotDb(slotId);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Slot deleted' });
  } catch (error: any) {
    console.error('[API] Delete Hospital Slot Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

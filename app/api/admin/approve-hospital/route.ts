import { NextRequest, NextResponse } from 'next/server';
import { approveHospitalPartnerDb } from '../../../../src/lib/userStoreDb';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required.' },
        { status: 400 }
      );
    }

    const success = await approveHospitalPartnerDb(userId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to approve hospital partner.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Hospital partner approved successfully.'
    });
  } catch (error: any) {
    console.error('[Approve Hospital Error]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to approve hospital partner.' },
      { status: 500 }
    );
  }
}

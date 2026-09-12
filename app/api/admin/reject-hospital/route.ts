import { NextRequest, NextResponse } from 'next/server';
import { rejectHospitalPartnerDb } from '../../../../src/lib/userStoreDb';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required.' },
        { status: 400 }
      );
    }

    const success = await rejectHospitalPartnerDb(userId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to reject hospital partner.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Hospital partner rejected successfully.'
    });
  } catch (error: any) {
    console.error('[Reject Hospital Error]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reject hospital partner.' },
      { status: 500 }
    );
  }
}

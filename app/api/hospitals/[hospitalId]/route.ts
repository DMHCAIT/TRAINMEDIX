import { NextRequest, NextResponse } from 'next/server';
import { backendStore } from '../../../../src/lib/backendStore';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ hospitalId: string }> }
) {
  try {
    const { hospitalId } = await params;
    const hospital = backendStore.getHospitalById(hospitalId);

    if (!hospital) {
      return NextResponse.json(
        { success: false, error: `Hospital '${hospitalId}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: hospital
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

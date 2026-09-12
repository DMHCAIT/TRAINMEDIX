import { NextRequest, NextResponse } from 'next/server';
import { backendStore } from '../../../../src/lib/backendStore';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hospital = backendStore.getHospitalById(id);

    if (!hospital) {
      return NextResponse.json(
        { success: false, error: `Hospital '${id}' not found.` },
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

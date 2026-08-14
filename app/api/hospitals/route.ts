import { NextRequest, NextResponse } from 'next/server';
import { backendStore } from '../../../src/lib/backendStore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city') || undefined;
    const dept = searchParams.get('dept') || undefined;

    const hospitals = backendStore.getHospitals(city, dept);

    return NextResponse.json({
      success: true,
      count: hospitals.length,
      data: hospitals
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { backendStore } from '../../../src/lib/backendStore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hospitalId = searchParams.get('hospitalId') || undefined;
    const departmentId = searchParams.get('departmentId') || undefined;

    const slots = backendStore.getSlots(hospitalId, departmentId);

    return NextResponse.json({
      success: true,
      data: slots
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      hospitalId,
      departmentId,
      subCategoryName,
      month,
      year,
      duration,
      fee,
      availableSeats = 5
    } = body;

    if (!subCategoryName || !hospitalId) {
      return NextResponse.json(
        { success: false, error: 'Specialization name and hospital ID are required.' },
        { status: 400 }
      );
    }

    const newSlot = backendStore.createSlot({
      hospitalId,
      departmentId: departmentId || 'dept-em',
      subDepartment: subCategoryName,
      city: 'Delhi',
      duration: duration || '3 Months',
      startDate: '2026-09-01',
      endDate: '2026-11-30',
      totalSeats: Number(availableSeats) + 2,
      availableSeats: Number(availableSeats),
      monthlyFee: fee || 45000,
      status: 'Open'
    });

    return NextResponse.json({
      success: true,
      message: 'Training slot created successfully.',
      data: newSlot
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

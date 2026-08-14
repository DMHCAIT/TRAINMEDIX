import { NextRequest, NextResponse } from 'next/server';
import { backendStore } from '../../../src/lib/backendStore';

export async function GET() {
  try {
    const departments = backendStore.getDepartments();
    return NextResponse.json({
      success: true,
      data: departments
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
    const { name, code, description, subDepartments, availableCities } = body;

    if (!name || !code) {
      return NextResponse.json(
        { success: false, error: 'Department name and code are required.' },
        { status: 400 }
      );
    }

    const newDept = backendStore.addDepartment({
      name,
      code,
      description: description || '',
      subDepartments: subDepartments || [],
      availableCities: availableCities || ['Delhi', 'Noida'],
      hospitalsCount: 0,
      iconName: 'Activity',
      featured: false,
      baseFeePerMonth: 45000,
      clinicalHighlights: ['Hands-on Clinical Rotation', 'Mentor Supervision']
    });

    return NextResponse.json({
      success: true,
      message: 'Department created successfully.',
      data: newDept
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

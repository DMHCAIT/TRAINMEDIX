import { NextRequest, NextResponse } from 'next/server';
import { backendStore } from '../../../../src/lib/backendStore';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const department = backendStore.getDepartmentByCode(slug);

    if (!department) {
      return NextResponse.json(
        { success: false, error: `Department with code '${slug}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: department
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getHospitalDepartmentsDb } from '@/lib/hospitalDepartmentsDb';

/**
 * TEST ENDPOINT: Test the fetch directly
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hospitalId = searchParams.get('hospitalId');

    console.log('[TEST-FETCH] Testing fetch for hospital:', hospitalId);

    if (!hospitalId) {
      return NextResponse.json({
        success: false,
        error: 'hospitalId required',
        test: 'FAILED - No hospitalId provided'
      }, { status: 400 });
    }

    // Call the database function directly
    const result = await getHospitalDepartmentsDb(hospitalId);
    
    console.log('[TEST-FETCH] Result:', result);

    return NextResponse.json({
      success: true,
      test: 'SUCCESS - Fetch function works',
      hospitalId,
      result,
      departmentCount: result.departments?.length || 0,
      departments: result.departments || []
    });
  } catch (error: any) {
    console.error('[TEST-FETCH] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      test: 'FAILED - Exception thrown'
    }, { status: 500 });
  }
}

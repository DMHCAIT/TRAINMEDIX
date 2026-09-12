import { NextRequest, NextResponse } from 'next/server';
import { addHospitalTraineeDb } from '@/lib/hospitalDepartmentsDb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      hospitalId,
      trainee_email,
      trainee_name,
      qualification,
      course_interested,
      certificate_url,
      city,
      trainee_id,
      hospital_department_id,
      department_name,
      duration_months,
      start_date,
      end_date,
      status
    } = body;

    if (!hospitalId || !trainee_email || !trainee_name || !qualification || !course_interested || !certificate_url || !city || !hospital_department_id || !department_name || !start_date || !end_date) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const result = await addHospitalTraineeDb(hospitalId, {
      hospital_id: hospitalId,
      trainee_email,
      trainee_name,
      qualification,
      course_interested,
      certificate_url,
      city,
      trainee_id,
      hospital_department_id,
      department_name,
      duration_months: duration_months || 3,
      start_date,
      end_date,
      status: status || 'Pending'
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, trainee: result.trainee });
  } catch (error: any) {
    console.error('[API] Add Hospital Trainee Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

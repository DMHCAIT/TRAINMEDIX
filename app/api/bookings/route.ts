import { NextRequest, NextResponse } from 'next/server';
import { authService } from '../../../src/lib/supabase-auth';
import { bookingService, auditLogService } from '../../../src/lib/supabase-db';
import { getSessionUser } from '../../../src/lib/authSession';
import { backendStore } from '../../../src/lib/backendStore';

export async function GET(req: NextRequest) {
  try {
    const user = await authService.getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let bookings;
    if (user.role === 'trainee') {
      bookings = await bookingService.getByTrainee(user.id);
    } else if (user.role === 'hospital') {
      bookings = await bookingService.getByHospital(user.id);
    } else if (user.role === 'admin') {
      bookings = await bookingService.getPending();
    }

    return NextResponse.json({
      success: true,
      data: bookings
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
    const user = await getSessionUser();
    const body = await req.json();

    const {
      departmentId,
      departmentName,
      hospitalId,
      hospitalName,
      city,
      duration,
      startDate,
      amountPaid = 45000,
      paymentMethod = 'UPI Online',
      traineeName = user?.fullName || 'Trainee Doctor',
      traineeEmail = user?.email || '',
      traineePhone = user?.phone || ''
    } = body;

    if (!departmentName || !hospitalName) {
      return NextResponse.json(
        { success: false, error: 'Department and Hospital details are required for booking.' },
        { status: 400 }
      );
    }

    const newBooking = backendStore.createBooking({
      traineeName,
      traineeEmail,
      traineePhone,
      medicalQualification: user?.qualification || 'MBBS',
      councilRegistrationNumber: 'MCI-2022-77142',
      departmentId: departmentId || 'dept-em',
      departmentName,
      hospitalId: hospitalId || 'hosp-1',
      hospitalName,
      city: city || 'Delhi',
      duration: duration || '3 Months',
      startDate: startDate || new Date().toISOString().split('T')[0],
      amountPaid: Number(amountPaid),
      paymentMethod: 'UPI',
      paymentStatus: 'Paid',
      bookingStatus: 'Pending Approval',
      documents: {
        medicalLicense: 'Verified',
        idProof: 'Verified',
        degreeCertificate: 'Verified'
      },
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Rotation booking created successfully.',
      data: newBooking
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

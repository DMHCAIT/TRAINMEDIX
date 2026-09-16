import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '../../../src/lib/authSession';
import { supabaseAdmin } from '../../../src/lib/supabase';
import type { Booking } from '../../../src/types';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const mapStatus = (status: string): Booking['bookingStatus'] => {
  switch (status) {
    case 'approved': return 'Approved';
    case 'in_rotation': return 'In Rotation';
    case 'completed': return 'Completed';
    case 'rejected':
    case 'cancelled': return 'Rejected';
    default: return 'Pending Approval';
  }
};

const mapBooking = (row: any): Booking => {
  const details = row.booking_details || {};
  const document = details.document;

  return {
    id: row.id,
    bookingRef: row.booking_ref || details.bookingRef || row.id,
    traineeName: details.traineeName || '',
    traineeEmail: details.traineeEmail || '',
    traineePhone: details.traineePhone || '',
    medicalQualification: details.medicalQualification || '',
    councilRegistrationNumber: details.councilRegistrationNumber || '',
    departmentId: row.department_id || details.departmentId || '',
    departmentName: details.departmentName || '',
    subDepartment: details.subDepartment,
    hospitalId: row.hospital_id || details.hospitalId || '',
    hospitalName: details.hospitalName || '',
    city: details.city || '',
    duration: details.duration || '1 Month',
    slotId: details.slotId,
    startDate: row.start_date || details.startDate || '',
    endDate: row.end_date || details.endDate || '',
    courseFee: Number(details.courseFee || 0),
    gstAmount: Number(details.gstAmount || 0),
    gatewayFee: Number(details.gatewayFee || 0),
    amountPaid: Number(details.amountPaid || 0),
    paymentMethod: details.paymentMethod || 'UPI',
    paymentStatus: details.paymentStatus || 'Paid',
    bookingStatus: mapStatus(row.status),
    documents: document ? {
      degreeCertificate: `/api/bookings/${row.id}/document`,
      degreeCertificateName: document.name,
      degreeCertificateSize: document.size,
      degreeCertificateType: document.type
    } : {},
    createdAt: row.created_at
  };
};

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ success: true, data: [] });
    }

    const supabase = supabaseAdmin();
    let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });

    if (user.role === 'trainee') {
      query = query.contains('booking_details', { traineeEmail: user.email });
    } else if (user.role === 'hospital' && UUID_PATTERN.test(user.id)) {
      query = query.eq('hospital_id', user.id);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: (data || []).map(mapBooking)
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
    if (!user || user.role !== 'trainee') {
      return NextResponse.json({ success: false, error: 'Trainee login required.' }, { status: 401 });
    }

    const requestData = await req.formData();
    const rawBooking = requestData.get('booking');
    const documentFile = requestData.get('degreeCertificate');
    const body = typeof rawBooking === 'string' ? JSON.parse(rawBooking) : {};

    if (!body.departmentId || !body.departmentName || !body.hospitalId || !body.hospitalName ||
        !body.slotId || !body.startDate || !body.endDate || !documentFile || !(documentFile instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'Complete booking, batch, and degree certificate details are required.' },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin();
    const bookingId = crypto.randomUUID();
    const bookingRef = `TMX-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const safeFileName = documentFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const documentPath = `${bookingId}/${Date.now()}-${safeFileName}`;

    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.some((bucket) => bucket.name === 'trainee-documents')) {
      const { error: bucketError } = await supabase.storage.createBucket('trainee-documents', {
        public: false,
        fileSizeLimit: 10 * 1024 * 1024,
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png']
      });
      if (bucketError && !bucketError.message.toLowerCase().includes('already exists')) throw bucketError;
    }

    const { error: uploadError } = await supabase.storage
      .from('trainee-documents')
      .upload(documentPath, documentFile, { contentType: documentFile.type, upsert: false });
    if (uploadError) throw uploadError;

    const details = {
      ...body,
      bookingRef,
      traineeName: body.traineeName || user.fullName,
      traineeEmail: body.traineeEmail || user.email,
      traineePhone: body.traineePhone || user.phone,
      paymentStatus: 'Paid',
      document: {
        path: documentPath,
        name: documentFile.name,
        size: body.documentSize || `${(documentFile.size / (1024 * 1024)).toFixed(1)} MB`,
        type: documentFile.type
      }
    };

    const { data, error } = await supabase.from('bookings').insert({
      id: bookingId,
      booking_ref: bookingRef,
      trainee_id: UUID_PATTERN.test(user.id) ? user.id : null,
      slot_id: null,
      hospital_id: body.hospitalId,
      department_id: body.departmentId,
      start_date: body.startDate,
      end_date: body.endDate,
      status: 'pending',
      booking_details: details
    }).select().single();

    if (error) {
      await supabase.storage.from('trainee-documents').remove([documentPath]);
      if (error.message.includes('booking_details') || error.message.includes('booking_ref')) {
        throw new Error('Booking database migration has not been applied yet.');
      }
      throw error;
    }

    const newBooking = mapBooking(data);

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

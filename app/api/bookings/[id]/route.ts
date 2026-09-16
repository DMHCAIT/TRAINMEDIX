import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/authSession';
import { supabaseAdmin } from '@/lib/supabase';

const STATUS_MAP: Record<string, string> = {
  'Pending Approval': 'pending',
  Approved: 'approved',
  'In Rotation': 'in_rotation',
  Completed: 'completed',
  Rejected: 'rejected'
};

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const body = await request.json();
    const user = await getSessionUser();

    if (!user || !['admin', 'hospital'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - Hospital role required' },
        { status: 401 }
      );
    }

    const { status, rejectionReason } = body;
    const bookingId = params.id;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const databaseStatus = STATUS_MAP[status] || status;
    const { data: booking, error } = await supabaseAdmin()
      .from('bookings')
      .update({
        status: databaseStatus,
        approval_date: databaseStatus === 'approved' ? new Date().toISOString() : null,
        rejection_reason: databaseStatus === 'rejected' ? rejectionReason : null
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ booking });
  } catch (error: any) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update booking' },
      { status: 400 }
    );
  }
}

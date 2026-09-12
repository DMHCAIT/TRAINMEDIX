import { NextRequest, NextResponse } from 'next/server';
import { bookingService, auditLogService } from '@/lib/supabase-db';
import { authService } from '@/lib/supabase-auth';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const body = await request.json();
    const user = await authService.getCurrentUser();

    if (!user || user.role !== 'hospital') {
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

    // Update booking status
    const booking = await bookingService.updateStatus(
      bookingId,
      status,
      status === 'approved' ? new Date().toISOString() : undefined,
      status === 'rejected' ? rejectionReason : undefined
    );

    // Log audit
    await auditLogService.create({
      userId: user.id,
      action: `${status.toUpperCase()}_BOOKING`,
      entityType: 'booking',
      entityId: bookingId,
    });

    return NextResponse.json({ booking });
  } catch (error: any) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update booking' },
      { status: 400 }
    );
  }
}

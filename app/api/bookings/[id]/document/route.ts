import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/authSession';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const supabase = supabaseAdmin();
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('booking_details')
      .eq('id', id)
      .single();

    if (error || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const details = booking.booking_details || {};
    if (user.role === 'trainee' && details.traineeEmail !== user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const documentPath = details.document?.path;
    if (!documentPath) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const { data, error: signedUrlError } = await supabase.storage
      .from('trainee-documents')
      .createSignedUrl(documentPath, 60);

    if (signedUrlError || !data?.signedUrl) throw signedUrlError || new Error('Unable to open document');
    return NextResponse.redirect(data.signedUrl);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unable to open document' }, { status: 500 });
  }
}
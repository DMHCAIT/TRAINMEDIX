import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/authSession';
import { supabaseAdmin } from '@/lib/supabase';

const ALLOWED_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const hospitalId = String(formData.get('hospitalId') || '');

    if (!(file instanceof File) || !hospitalId) {
      return NextResponse.json({ success: false, error: 'Certificate and hospital are required' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ success: false, error: 'Only PDF, JPG, and PNG certificates are allowed' }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: 'Certificate must be 10 MB or smaller' }, { status: 400 });
    }

    const safeHospitalId = hospitalId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${safeHospitalId}/trainee_${Date.now()}_${safeFileName}`;
    const supabase = supabaseAdmin();
    const { error } = await supabase.storage
      .from('certificates')
      .upload(filePath, Buffer.from(await file.arrayBuffer()), {
        contentType: file.type,
        upsert: false
      });

    if (error) throw error;

    const { data } = supabase.storage.from('certificates').getPublicUrl(filePath);
    if (!data.publicUrl) throw new Error('Supabase did not return a certificate URL');

    return NextResponse.json({ success: true, url: data.publicUrl, path: filePath });
  } catch (error: any) {
    console.error('[Trainee Certificate Upload]', error);
    return NextResponse.json({ success: false, error: error.message || 'Certificate upload failed' }, { status: 500 });
  }
}
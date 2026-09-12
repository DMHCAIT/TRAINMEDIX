import { NextRequest, NextResponse } from 'next/server';
import { setSessionCookie } from '@/lib/authSession';

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Admin email and password are required' }, { status: 400 });
    }
    if (password !== (process.env.ADMIN_PASSWORD || 'Medix@2026')) {
      return NextResponse.json({ success: false, error: 'Invalid admin credentials' }, { status: 401 });
    }

    await setSessionCookie({
      id: 'admin',
      fullName: fullName || 'System Administrator',
      email,
      phone: '',
      role: 'admin'
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create admin session' }, { status: 500 });
  }
}
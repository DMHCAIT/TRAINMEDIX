import { NextRequest, NextResponse } from 'next/server';
import { authService } from '../../../../src/lib/supabase-auth';
import { auditLogService } from '../../../../src/lib/supabase-db';
import { setSessionCookie } from '../../../../src/lib/authSession';

function getIpAddress(request: NextRequest): string {
  return request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ipAddress = getIpAddress(req);
    const {
      role = 'trainee',
      fullName,
      email,
      password,
      phone,
    } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Full name, email, and password are required.' },
        { status: 400 }
      );
    }

    // Sign up with Supabase
    const result = await authService.signup({
      email: email.trim(),
      password,
      phone: phone?.trim(),
      fullName: fullName.trim(),
      role,
    });

    // Log audit
    await auditLogService.create({
      userId: result.user.id,
      action: 'SIGNUP',
      entityType: 'user',
      entityId: result.user.id,
      ipAddress,
    });

    const sessionUser = {
      id: result.user.id,
      fullName: result.user.full_name,
      email: result.user.email,
      phone: result.user.phone,
      role: result.user.role,
      interests: result.user.interests || [],
      address: result.user.address || ''
    };

    // Set HTTP-only cookie
    await setSessionCookie(sessionUser);

    return NextResponse.json({
      success: true,
      message: `${role === 'hospital' ? 'Hospital Partner' : 'Trainee Doctor'} registered successfully.`,
      user: sessionUser
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Signup failed.' },
      { status: 500 }
    );
  }
}

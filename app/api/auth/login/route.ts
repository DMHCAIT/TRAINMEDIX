import { NextRequest, NextResponse } from 'next/server';
import { authService } from '../../../../src/lib/supabase-auth';
import { auditLogService } from '../../../../src/lib/supabase-db';

function getIpAddress(request: NextRequest): string {
  return request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ipAddress = getIpAddress(req);
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // Login with Supabase
    const result = await authService.login({ email, password });

    // Log audit
    await auditLogService.create({
      userId: result.user.id,
      action: 'LOGIN',
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
    };

    return NextResponse.json({
      success: true,
      message: 'Signed in successfully.',
      user: sessionUser
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Login failed.' },
      { status: 500 }
    );
  }
}

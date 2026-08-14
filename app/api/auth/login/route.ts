import { NextRequest, NextResponse } from 'next/server';
import { backendStore } from '../../../../src/lib/backendStore';
import { setSessionCookie, SessionUser } from '../../../../src/lib/authSession';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { loginInput, role = 'trainee' } = body;

    if (!loginInput) {
      return NextResponse.json(
        { success: false, error: 'Email or phone number is required.' },
        { status: 400 }
      );
    }

    let user = backendStore.findUserByEmailOrPhone(loginInput);

    if (!user) {
      // Create user record dynamically if first time logging in
      const isEmail = loginInput.includes('@');
      user = backendStore.createUser({
        fullName: isEmail ? (loginInput.split('@')[0].replace('.', ' ') || 'Dr. Trainee') : 'Dr. Trainee',
        email: isEmail ? loginInput : 'trainee@trainmedix.com',
        phone: !isEmail ? loginInput : '+91 98765 43210',
        role: role as any,
        interests: ['Emergency Medicine', 'Cardiology']
      });
    }

    const sessionUser: SessionUser = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      qualification: user.qualification,
      interests: user.interests,
      bedCapacity: user.bedCapacity,
      address: user.address
    };

    // Set HTTP-only session cookie
    await setSessionCookie(sessionUser);

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

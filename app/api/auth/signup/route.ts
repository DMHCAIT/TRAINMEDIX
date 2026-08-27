import { NextRequest, NextResponse } from 'next/server';
import { backendStore } from '../../../../src/lib/backendStore';
import { setSessionCookie, SessionUser } from '../../../../src/lib/authSession';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      role = 'trainee',
      fullName,
      email,
      phone,
      qualification,
      interests,
      address
    } = body;

    if (!fullName || (!email && !phone)) {
      return NextResponse.json(
        { success: false, error: 'Full name and email or phone number are required.' },
        { status: 400 }
      );
    }

    const primaryIdentifier = email || phone;
    const existingUser = backendStore.findUserByEmailOrPhone(primaryIdentifier);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email/phone already exists.' },
        { status: 409 }
      );
    }

    const createdUser = backendStore.createUser({
      fullName: fullName.trim(),
      email: email ? email.trim() : '',
      phone: phone ? phone.trim() : '',
      role,
      qualification: qualification ? qualification.trim() : undefined,
      interests: Array.isArray(interests) ? interests : [],
      address: address ? address.trim() : undefined
    });

    const sessionUser: SessionUser = {
      id: createdUser.id,
      fullName: createdUser.fullName,
      email: createdUser.email,
      phone: createdUser.phone,
      role: createdUser.role,
      qualification: createdUser.qualification,
      interests: createdUser.interests,
      address: createdUser.address
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

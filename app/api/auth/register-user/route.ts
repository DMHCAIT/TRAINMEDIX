import { NextRequest, NextResponse } from 'next/server';
import { createUserDb, findUserByEmailDb } from '../../../../src/lib/userStoreDb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role, fullName, email, phone, qualification, interests, address, preferredCity } = body;

    if (!fullName?.trim() || !email?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Full name and email are required.' },
        { status: 400 }
      );
    }

    const existingUser = await findUserByEmailDb(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'This email is already signed up. Please sign in instead.' },
        { status: 409 }
      );
    }

    const user = await createUserDb({
      role: role === 'hospital' ? 'hospital' : 'trainee',
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone?.trim(),
      qualification,
      interests,
      address,
      preferredCity
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to register account.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmailDb, recordLoginDb } from '../../../../src/lib/userStoreDb';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });
    }

    const user = await findUserByEmailDb(email);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No account found for this email. Please sign up before signing in.' },
        { status: 404 }
      );
    }

    const updatedUser = await recordLoginDb(email);

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to record login.' },
      { status: 500 }
    );
  }
}

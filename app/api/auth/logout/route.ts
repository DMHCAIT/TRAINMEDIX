import { NextResponse } from 'next/server';
import { clearSessionCookie } from '../../../../src/lib/authSession';

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Logout failed.' },
      { status: 500 }
    );
  }
}

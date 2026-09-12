import { NextRequest, NextResponse } from 'next/server';
import { verifyOtpDb } from '../../../../src/lib/otpStoreDb';

export async function POST(req: NextRequest) {
  try {
    const { email, otp, purpose } = await req.json();

    if (!email || !otp || !purpose) {
      return NextResponse.json(
        { success: false, error: 'Email, OTP, and purpose are required.' },
        { status: 400 }
      );
    }

    if (!['signup', 'login'].includes(purpose)) {
      return NextResponse.json(
        { success: false, error: 'Invalid purpose. Must be signup or login.' },
        { status: 400 }
      );
    }

    console.log(`[OTP Verify] Email: ${email}, Purpose: ${purpose}, OTP: ${otp}`);
    const result = await verifyOtpDb(email, otp, purpose);

    if (!result.success) {
      console.log(`[OTP Verify Failed] ${result.error}`);
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    console.log(`[OTP Verify Success] Email: ${email} verified successfully (purpose: ${purpose})`);
    return NextResponse.json({ success: true, verified: true });
  } catch (error: any) {
    console.error('[OTP Verify Error]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to verify OTP.' },
      { status: 500 }
    );
  }
}

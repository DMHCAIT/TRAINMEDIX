import { NextRequest, NextResponse } from 'next/server';
import { generateOtpDb } from '../../../../src/lib/otpStoreDb';
import { sendMail } from '../../../../src/lib/mailer';
import { findUserByEmailDb } from '../../../../src/lib/userStoreDb';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { email, purpose, role } = await req.json();

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required to receive the OTP.' },
        { status: 400 }
      );
    }

    if (purpose === 'login' && !role) {
      return NextResponse.json(
        { success: false, error: 'Account type (trainee/hospital) is required for login.' },
        { status: 400 }
      );
    }

    const existingUser = await findUserByEmailDb(email);

    if (purpose === 'signup' && existingUser) {
      return NextResponse.json(
        { success: false, error: 'This email is already signed up. Please sign in instead.' },
        { status: 409 }
      );
    }

    if (purpose === 'login') {
      if (!existingUser) {
        return NextResponse.json(
          { success: false, error: `No ${role} account found for this email. Please sign up first.` },
          { status: 404 }
        );
      }
      // Check if the user's role matches the login role
      if (existingUser.role !== role) {
        return NextResponse.json(
          { success: false, error: `This email is registered as a ${existingUser.role}, not a ${role}. Please select the correct account type.` },
          { status: 403 }
        );
      }
    }

    const otp = await generateOtpDb(email, purpose);

    try {
      await sendMail({
        to: email,
        subject: 'Your TrainMedix Verification Code',
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #2F855A;">TrainMedix Verification Code</h2>
            <p>Use the code below to verify your email address. This code expires in 2 minutes.</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2F855A; background: #EBF7F1; padding: 16px 24px; border-radius: 12px; text-align: center; margin: 20px 0;">
              ${otp}
            </div>
            <p style="color: #666; font-size: 12px;">If you didn't request this code, you can safely ignore this email.</p>
          </div>
        `
      });
      console.log(`[OTP Email] Successfully sent OTP to: ${email}`);
    } catch (emailErr: any) {
      console.error(`[Email Error] Failed to send to ${email}:`, emailErr.message);
      throw new Error(`Failed to send verification email: ${emailErr.message}`);
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully to your email.' });
  } catch (error: any) {
    console.error('send-otp error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send OTP.' },
      { status: 500 }
    );
  }
}

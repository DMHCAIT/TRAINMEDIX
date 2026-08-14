import { NextResponse } from 'next/server';
import { getSessionUser } from '../../../../src/lib/authSession';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { success: false, isLoggedIn: false, user: null },
        { status: 200 }
      );
    }
    return NextResponse.json({
      success: true,
      isLoggedIn: true,
      user
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, isLoggedIn: false, error: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { backendStore } from '../../../src/lib/backendStore';
import { getSessionUser } from '../../../src/lib/authSession';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('bookingId') || undefined;

    const entries = backendStore.getLogbook(bookingId);

    return NextResponse.json({
      success: true,
      data: entries
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const body = await req.json();

    const {
      bookingId = 'bk-9901',
      procedureName,
      casesObserved = 1,
      casesAssisted = 0,
      notes = ''
    } = body;

    if (!procedureName) {
      return NextResponse.json(
        { success: false, error: 'Procedure name is required.' },
        { status: 400 }
      );
    }

    const newLog = backendStore.createLogbookEntry({
      bookingId,
      date: new Date().toISOString().split('T')[0],
      procedureName: procedureName.trim(),
      casesObserved: Number(casesObserved),
      casesAssisted: Number(casesAssisted),
      supervisorSignature: true,
      notes: notes.trim()
    });

    return NextResponse.json({
      success: true,
      message: 'Logbook entry recorded successfully.',
      data: newLog
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

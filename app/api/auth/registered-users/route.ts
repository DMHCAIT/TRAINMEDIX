import { NextResponse } from 'next/server';
import { listUsersDb } from '../../../../src/lib/userStoreDb';

export async function GET() {
  const users = await listUsersDb();
  return NextResponse.json({ success: true, users });
}

import { cookies } from 'next/headers';

export interface SessionUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'trainee' | 'hospital' | 'admin';
  qualification?: string;
  interests?: string[];
  bedCapacity?: string;
  address?: string;
}

const COOKIE_NAME = 'trainmedix_session';

/**
 * Encodes a user object into a base64 session token string (for template/demo purposes).
 */
export function encodeSession(user: SessionUser): string {
  const jsonStr = JSON.stringify(user);
  if (typeof btoa !== 'undefined') {
    return btoa(jsonStr);
  }
  return Buffer.from(jsonStr).toString('base64');
}

/**
 * Decodes a session token string back into a SessionUser object.
 */
export function decodeSession(token: string): SessionUser | null {
  try {
    let jsonStr: string;
    if (typeof atob !== 'undefined') {
      jsonStr = atob(token);
    } else {
      jsonStr = Buffer.from(token, 'base64').toString('utf-8');
    }
    return JSON.parse(jsonStr) as SessionUser;
  } catch (error) {
    return null;
  }
}

/**
 * Sets an HTTP-only authentication cookie.
 */
export async function setSessionCookie(user: SessionUser) {
  const cookieStore = await cookies();
  const token = encodeSession(user);
  
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });
}

/**
 * Retrieves the current session user from HTTP-only cookie.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }
  return decodeSession(sessionCookie.value);
}

/**
 * Clears the session cookie on logout.
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

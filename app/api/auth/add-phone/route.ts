import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { setAuthCookies } from '@/lib/auth/auth-cookies';
import { isJwtResponse, type AuthResponse, type JwtResponse } from '@/lib/auth/auth-types';
import { parseJsonResponse } from '@/lib/auth/route-helpers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
const PHONE_TARGET_COOKIE = 'reacherr_phone_target';
const isProd = process.env.NODE_ENV === 'production';

export async function POST(req: Request) {
  const body = await req.json();

  const res = await fetch(`${BACKEND_URL}/api/v1/phone/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const parsed = await parseJsonResponse<AuthResponse>(res);

  if (!parsed.ok) {
    return NextResponse.json(parsed.data, { status: parsed.status });
  }

  if (isJwtResponse(parsed.data as AuthResponse)) {
    const jwt = parsed.data as JwtResponse;
    await setAuthCookies(jwt.accessToken, jwt.refreshToken);
  }

  if (body?.phone) {
    const store = await cookies();
    store.set(PHONE_TARGET_COOKIE, body.phone, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 10 * 60,
    });
  }

  return NextResponse.json(parsed.data);
}

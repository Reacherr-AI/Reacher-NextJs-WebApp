import { NextResponse } from 'next/server';
import { getRefreshToken, setAuthCookies } from '@/lib/auth/auth-cookies';
import { isJwtResponse, type AuthResponse, type JwtResponse } from '@/lib/auth/auth-types';
import { parseJsonResponse } from '@/lib/route-helpers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const refreshToken = (await getRefreshToken()) || body.refreshToken;

  if (!refreshToken) {
    return NextResponse.json({ message: 'Missing refresh token' }, { status: 401 });
  }

  const res = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const parsed = await parseJsonResponse<AuthResponse>(res);

  if (!parsed.ok) {
    return NextResponse.json(parsed.data, { status: parsed.status });
  }

  if (isJwtResponse(parsed.data as AuthResponse)) {
    const jwt = parsed.data as JwtResponse;
    await setAuthCookies(jwt.accessToken, jwt.refreshToken);
  }

  return NextResponse.json(parsed.data);
}

import { NextResponse } from 'next/server';
import { clearAuthCookies, getAccessToken } from '@/lib/auth/auth-cookies';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

export async function POST() {
  const accessToken = await getAccessToken();

  if (accessToken) {
    await fetch(`${BACKEND_URL}/api/v1/auth/signout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }).catch(() => null);
  }

  await clearAuthCookies();
  return NextResponse.json({ message: 'Logged out' });
}

import { NextResponse } from 'next/server';
import { setAuthCookies } from '@/lib/auth/auth-cookies';

type OAuthCallbackPayload = {
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
  username?: string;
  challengeToken?: string;
  challengeType?: 'EMAIL' | 'PHONE' | 'ADD_PHONE';
  target?: string;
};

export async function POST(req: Request) {
  const body = (await req.json()) as OAuthCallbackPayload;

  if (body.accessToken && body.refreshToken) {
    await setAuthCookies(body.accessToken, body.refreshToken);
    return NextResponse.json({ type: 'JWT' });
  }

  if (body.challengeToken && body.challengeType) {
    return NextResponse.json({
      type: 'CHALLENGE',
      challengeToken: body.challengeToken,
      challengeType: body.challengeType,
      target: body.target ?? '',
    });
  }

  return NextResponse.json(
    { message: 'Missing OAuth callback parameters' },
    { status: 400 }
  );
}

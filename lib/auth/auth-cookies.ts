import { cookies } from 'next/headers';

const ACCESS_COOKIE = 'accessToken';
const REFRESH_COOKIE = 'refreshToken';

const isProd = process.env.NODE_ENV === 'production';

export const setAuthCookies = async (accessToken: string, refreshToken: string) => {
  const store = await cookies();
  store.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
  });
  store.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
  });
};

export const clearAuthCookies = async () => {
  const store = await cookies();
  store.set(ACCESS_COOKIE, '', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  store.set(REFRESH_COOKIE, '', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
};

export const getAccessToken = async () => (await cookies()).get(ACCESS_COOKIE)?.value;

export const getRefreshToken = async () => (await cookies()).get(REFRESH_COOKIE)?.value;

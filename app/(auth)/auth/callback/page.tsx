'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const userId = searchParams.get('userId');
    const username = searchParams.get('username');
    const challengeToken = searchParams.get('challengeToken');
    const challengeType = searchParams.get('challengeType');
    const target = searchParams.get('target');

    const finish = async () => {
      try {
        if (accessToken && refreshToken) {
          const res = await fetch('/api/auth/oauth-callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              accessToken,
              refreshToken,
              userId: userId ?? '',
              username: username ?? '',
            }),
          });

          if (!res.ok) {
            const data = (await res.json()) as { message?: string };
            setError(data.message ?? 'Failed to complete sign-in');
            return;
          }

          router.replace('/');
          return;
        }

        if (challengeToken && challengeType) {
          const params = new URLSearchParams({
            challengeToken,
            challengeType,
          });

          if (challengeType === 'EMAIL') {
            router.replace(`/verify-email?${params.toString()}`);
          } else if (challengeType === 'ADD_PHONE') {
            router.replace(`/add-phone?${params.toString()}`);
          } else {
            if (target) {
              params.set('phone', target);
            }
            router.replace(`/verify-phone?${params.toString()}`);
          }
          return;
        }

        setError('Missing OAuth callback parameters');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to complete sign-in');
      }
    };

    void finish();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-black px-6 pb-16 pt-10 text-white">
      <div className="mx-auto w-full max-w-130 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_40px_120px_rgba(6,7,33,0.45)]">
        <h1 className="text-2xl font-semibold">Finishing sign in</h1>
        <p className="mt-2 text-sm text-white/60">
          {error ?? 'Hang tight while we complete your login.'}
        </p>
        {error ? (
          <div className="mt-6 flex flex-wrap gap-3 text-xs text-white/60">
            <button
              type="button"
              onClick={() => router.replace('/sign-in')}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white/80 hover:border-white/40"
            >
              Back to sign in
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

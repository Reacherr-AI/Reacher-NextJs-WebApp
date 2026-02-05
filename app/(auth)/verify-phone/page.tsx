'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import type { AuthResponse } from '@/lib/auth/auth-types';

export default function VerifyPhonePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const challengeToken = searchParams.get('challengeToken') ?? '';
  const phone = searchParams.get('phone') ?? '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeToken,
          otp,
          otpType: 'PHONE',
          target: phone || undefined,
        }),
      });

      const data = (await res.json()) as AuthResponse;

      if (!res.ok) {
        setError((data as { message?: string }).message ?? 'Verification failed');
        return;
      }

      if ('accessToken' in data) {
        router.replace('/');
        return;
      }

      const params = new URLSearchParams({
        challengeToken: data.challengeToken,
        challengeType: data.challengeType,
      });

      if (data.challengeType === 'ADD_PHONE') {
        router.push(`/add-phone?${params.toString()}`);
      } else {
        router.push(`/verify-email?${params.toString()}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black px-6 pb-16 pt-10 text-white">
      <div className="mx-auto w-full max-w-130 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_40px_120px_rgba(6,7,33,0.45)]">
        <h1 className="text-2xl font-semibold">Verify your phone</h1>
        <p className="mt-2 text-sm text-white/60">
          Enter the one-time code sent to your phone.
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <label className="text-xs font-semibold text-white/70">Phone OTP</label>
          <input
            type="text"
            placeholder="123456"
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#6b6ff9]"
          />

          {error ? (
            <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isLoading || !challengeToken}
            className="mt-6 w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? 'Verifying...' : 'Verify phone'}
          </button>
        </form>
      </div>
    </div>
  );
}

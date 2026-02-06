import { Suspense } from 'react';
import VerifyPhoneClient from './VerifyPhoneClient';

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-black px-6 pb-16 pt-10 text-white">
      <div className="mx-auto w-full max-w-130 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_40px_120px_rgba(6,7,33,0.45)]">
        <h1 className="text-2xl font-semibold">Verify your phone</h1>
        <p className="mt-2 text-sm text-white/60">
          Enter the one-time code sent to your phone.
        </p>
      </div>
    </div>
  );
}

export default function VerifyPhonePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyPhoneClient />
    </Suspense>
  );
}

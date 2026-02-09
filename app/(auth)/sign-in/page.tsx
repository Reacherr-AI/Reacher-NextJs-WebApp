import Link from "next/link";
import { SiteNavbar } from "@/components/layout/site-navbar";
import SignInClient from "./SignInClient";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black px-6 pb-16 pt-10 text-white">
      <div className="mx-auto flex min-h-[85vh] w-full max-w-300 flex-col rounded-3xl border border-white/10 bg-[radial-gradient(1200px_circle_at_75%_10%,rgba(56,66,218,0.25)_0%,rgba(0,0,0,0.9)_50%,rgba(0,0,0,1)_100%)] p-8 shadow-[0_40px_120px_rgba(6,7,33,0.45)] sm:p-12">
        <SiteNavbar
          rightSlot={
            <>
              <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black shadow-[0_10px_24px_rgba(255,255,255,0.2)]">
                Login
              </span>
              <Link
                href="/sign-up"
                className="rounded-full bg-black/80 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/10"
              >
                Contact Sale
              </Link>
            </>
          }
        />

        <SignInClient />
      </div>
    </div>
  );
}

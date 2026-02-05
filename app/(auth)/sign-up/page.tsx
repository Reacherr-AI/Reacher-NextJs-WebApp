'use client';

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AuthResponse } from "@/lib/auth/auth-types";

const navLinks = ["Home", "Product", "Solution", "Pricing", "About Us"];
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, password }),
      });

      const data = (await res.json()) as AuthResponse;

      if (!res.ok) {
        setError((data as { message?: string }).message ?? "Sign up failed");
        return;
      }

      if ("accessToken" in data) {
        router.replace("/");
        return;
      }

      const params = new URLSearchParams({
        challengeToken: data.challengeToken,
        challengeType: data.challengeType,
      });

      if (data.challengeType === "EMAIL") {
        router.push(`/verify-email?${params.toString()}`);
      } else if (data.challengeType === "ADD_PHONE") {
        router.push(`/add-phone?${params.toString()}`);
      } else {
        router.push(`/verify-phone?${params.toString()}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    setIsGoogleLoading(true);
    window.location.href = `${BACKEND_URL}/oauth2/authorization/google`;
  };

  return (
    <div className="min-h-screen bg-black px-6 pb-16 pt-10 text-white">
      <div className="mx-auto flex min-h-[85vh] w-full max-w-[1200px] flex-col rounded-3xl border border-white/10 bg-[radial-gradient(1200px_circle_at_75%_10%,rgba(56,66,218,0.25)_0%,rgba(0,0,0,0.9)_50%,rgba(0,0,0,1)_100%)] p-8 shadow-[0_40px_120px_rgba(6,7,33,0.45)] sm:p-12">
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 p-1 shadow-[0_10px_30px_rgba(56,66,218,0.35)]">
              <Image
                src="/icons/reacherr-logo.svg"
                alt="Reacherr"
                width={28}
                height={28}
                className="h-6 w-6"
                priority
              />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">
              reacherr
            </span>
          </div>

          <nav className="flex flex-1 flex-wrap items-center justify-center gap-3">
            <div className="flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/10 px-2 py-2 text-xs font-medium text-white/70 shadow-[0_12px_40px_rgba(9,11,30,0.45)] backdrop-blur">
              {navLinks.map((link) => (
                <span key={link} className="rounded-full px-4 py-2">
                  {link}
                </span>
              ))}
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/sign-in"
              className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black shadow-[0_10px_24px_rgba(255,255,255,0.2)]"
            >
              Login
            </Link>
            <span className="rounded-full bg-black/80 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/10">
              Contact Sale
            </span>
          </div>
        </header>

        <div className="mt-16 grid gap-10 sm:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
              Sign Up
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
              Create your Reacherr account
            </h1>
            <p className="mt-4 text-sm text-white/60 sm:text-base">
              Start building AI voice agents that handle calls, qualify leads,
              and automate workflows.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(10,12,35,0.55)] backdrop-blur"
          >
            <label className="text-xs font-semibold text-white/70">Full name</label>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#6b6ff9]"
            />

            <label className="mt-5 block text-xs font-semibold text-white/70">
              Email (used as username)
            </label>
            <input
              type="email"
              placeholder="you@company.com"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#6b6ff9]"
            />

            <label className="mt-5 block text-xs font-semibold text-white/70">
              Password
            </label>
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#6b6ff9]"
            />

            {error ? (
              <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>

            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={isGoogleLoading}
              className="mt-3 w-full rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 transition hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isGoogleLoading ? "Redirecting..." : "Continue with Google"}
            </button>

            <p className="mt-4 text-center text-xs text-white/60">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-white/90">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

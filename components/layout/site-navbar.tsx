"use client"; // Note: Removed 'server-only' as interactivity requires client-side state

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react"; // Install lucide-react if you haven't

type SiteNavbarLink = {
  label: string;
  href?: string;
};

type Props = {
  activeLabel?: string;
  className?: string;
  simple?: boolean;
};

const defaultLinks: SiteNavbarLink[] = [
  { label: "Home", href: "/" },
  { label: "Product", href: "/product" },
  { label: "Solution", href: "/solution" },
  { label: "Pricing", href: "/pricing" },
  { label: "About Us" },
];

export function SiteNavbar({ activeLabel, className, simple = false }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header
      className={
        className ?? "relative z-50 flex flex-wrap items-center justify-between gap-6 py-4"
      }
    >
      <Link href="/" className="flex items-center gap-3">
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
      </Link>

      {!simple && (
        <>
          {/* --- DESKTOP NAVIGATION --- */}
          <nav className="hidden lg:flex flex-1 items-center justify-center">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-2 py-2 text-xs font-medium text-white/70 shadow-[0_12px_40px_rgba(9,11,30,0.45)] backdrop-blur">
              {defaultLinks.map((link) => {
                const isActive = activeLabel ? link.label === activeLabel : false;
                const classNames = `rounded-full px-4 py-2 transition ${
                  isActive ? "bg-white text-black" : "hover:bg-white/10"
                }`;

                return link.href ? (
                  <Link key={link.label} href={link.href} className={classNames}>
                    {link.label}
                  </Link>
                ) : (
                  <span key={link.label} className="px-4 py-2">{link.label}</span>
                );
              })}
            </div>
          </nav>

          {/* --- RIGHT ACTIONS (Desktop) & MOBILE TOGGLE --- */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/sign-in"
                className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black shadow-[0_10px_24px_rgba(255,255,255,0.2)]"
              >
                Login
              </Link>
              <button className="rounded-full bg-black/80 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/10">
                Contact Sale
              </button>
            </div>

            {/* Hamburger Toggle */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white border border-white/10"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* --- MOBILE MENU OVERLAY --- */}
          {isOpen && (
            <div className="absolute top-20 left-0 right-0 z-50 flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#0A0A0B]/95 p-6 shadow-2xl backdrop-blur-xl lg:hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex flex-col gap-2">
                {defaultLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href || "#"}
                    onClick={() => setIsOpen(false)}
                    className={`flex w-full items-center rounded-xl px-4 py-3 text-sm font-medium transition ${
                      activeLabel === link.label 
                      ? "bg-white text-black" 
                      : "text-white/70 hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              
              <div className="mt-4 flex flex-col gap-3 border-t border-white/5 pt-6">
                <Link
                  href="/sign-in"
                  className="flex w-full justify-center rounded-xl bg-white py-3 text-sm font-bold text-black"
                >
                  Login
                </Link>
                <button className="w-full rounded-xl bg-black py-3 text-sm font-bold text-white ring-1 ring-white/10">
                  Contact Sale
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </header>
  );
}
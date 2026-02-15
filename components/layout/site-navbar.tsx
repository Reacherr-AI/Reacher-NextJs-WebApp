"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";


type SiteNavbarLink = {
  label: string;
  href?: string;
};

type Props = {
  activeLabel?: string;
  className?: string;
  simple?: boolean;
  showDashboard?: boolean; // New prop passed from server
};

const defaultLinks: SiteNavbarLink[] = [
  { label: "Home", href: "/" },
  { label: "Product", href: "/product" },
  { label: "Solution", href: "/solution" },
  { label: "Pricing", href: "/pricing" },
  { label: "About Us" },
];

export function SiteNavbar({ activeLabel, className, simple = false, showDashboard = false }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className={className ?? "relative z-50 flex flex-wrap items-center justify-between gap-6 py-4"}>
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 p-1 shadow-[0_10px_30px_rgba(56,66,218,0.35)]">
          <Image src="/icons/reacherr-logo.svg" alt="Reacherr" width={28} height={28} className="h-6 w-6" priority />
        </div>
        <span className="text-lg font-semibold tracking-tight text-white">reacherr</span>
      </Link>

      {!simple && (
        <>
          <nav className="hidden lg:flex flex-1 items-center justify-center">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-2 py-2 text-xs font-medium text-white/70 shadow-[0_12px_40px_rgba(9,11,30,0.45)] backdrop-blur">
              {defaultLinks.map((link) => (
                <Link 
                  key={link.label} 
                  href={link.href || "#"} 
                  className={`rounded-full px-4 py-2 transition ${activeLabel === link.label ? "bg-white text-black" : "hover:bg-white/10"}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href={showDashboard ? "/agents" : "/sign-in"}
                className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black shadow-[0_10px_24px_rgba(255,255,255,0.2)]"
              >
                {showDashboard ? "Dashboard" : "Login"}
              </Link>
              <button className="rounded-full bg-black/80 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/10">
                Contact Sale
              </button>
            </div>
            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white border border-white/10">
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
          
          {/* Mobile Menu Overlay logic remains the same... */}
        </>
      )}
    </header>
  );
}
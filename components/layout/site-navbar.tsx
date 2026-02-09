import "server-only";

import Image from "next/image";
import Link from "next/link";

type SiteNavbarLink = {
  label: string;
  href?: string;
};

type Props = {
  activeLabel?: string;
  className?: string;
};

const defaultLinks: SiteNavbarLink[] = [
  { label: "Home", href: "/" },
  { label: "Product", href: "/product" },
  { label: "Solution", href: "/solution" },
  { label: "Pricing" },
  { label: "About Us" },
];

export function SiteNavbar({
  activeLabel,
  className,
}: Props) {
  return (
    <header
      className={
        className ?? "flex flex-wrap items-center justify-between gap-6"
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

      <nav className="flex flex-1 flex-wrap items-center justify-center gap-3">
        <div className="flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/10 px-2 py-2 text-xs font-medium text-white/70 shadow-[0_12px_40px_rgba(9,11,30,0.45)] backdrop-blur">
          {defaultLinks.map((link) => {
            const isActive = activeLabel ? link.label === activeLabel : false;
            const classNames = `rounded-full px-4 py-2 transition ${
              isActive ? "bg-white text-black" : "hover:bg-white/10"
            }`;

            if (link.href) {
              return (
                <Link key={link.label} href={link.href} className={classNames}>
                  {link.label}
                </Link>
              );
            }

            return (
              <span
                key={link.label}
                className={isActive ? classNames : "rounded-full px-4 py-2"}
              >
                {link.label}
              </span>
            );
          })}
        </div>
      </nav>

      <div className="flex items-center gap-2">
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
    </header>
  );
}

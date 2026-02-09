import "server-only";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type Cta = {
  label: string;
  href?: string;
};

type PreviewImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
};

type Props = {
  title: string;
  cardTitle: ReactNode;
  cardDescription: ReactNode;
  primaryCta: Cta;
  secondaryCta: Cta;
  previewBack: PreviewImage;
  previewFront: PreviewImage;
};

function CtaButton({
  cta,
  className,
}: {
  cta: Cta;
  className: string;
}) {
  if (cta.href) {
    return (
      <Link href={cta.href} className={className}>
        {cta.label}
      </Link>
    );
  }

  return <button className={className}>{cta.label}</button>;
}

export function ProductHero({
  title,
  cardTitle,
  cardDescription,
  primaryCta,
  secondaryCta,
  previewBack,
  previewFront,
}: Props) {
  return (
    <section className="mx-auto mt-16 w-full max-w-275 px-6 text-white sm:px-10">
      <h1 className="text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
        {title}
      </h1>

      <div className="mt-12 grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-10 shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur">
          <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
            {cardTitle}
          </h2>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/55 sm:text-base">
            {cardDescription}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <CtaButton
              cta={primaryCta}
              className="rounded-full bg-white px-6 py-3 text-xs font-semibold text-black shadow-[0_12px_30px_rgba(255,255,255,0.12)]"
            />
            <CtaButton
              cta={secondaryCta}
              className="rounded-full bg-[#5B66FF] px-6 py-3 text-xs font-semibold text-white shadow-[0_18px_50px_rgba(91,102,255,0.35)]"
            />
          </div>
        </div>

        <div className="relative min-h-[300px] w-full sm:min-h-[380px]">
          <div className="absolute right-0 top-10 w-[min(560px,92%)]">
            <Image
              src={previewBack.src}
              alt={previewBack.alt}
              width={previewBack.width}
              height={previewBack.height}
              className={
                previewBack.className ??
                "h-auto w-full rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
              }
              priority={false}
            />
          </div>

          <div className="absolute right-10 top-0 w-[min(600px,96%)]">
            <Image
              src={previewFront.src}
              alt={previewFront.alt}
              width={previewFront.width}
              height={previewFront.height}
              className={
                previewFront.className ??
                "h-auto w-full rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
              }
              priority={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}


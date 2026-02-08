import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type FeatureItem = {
  title: string;
  description: string;
  Icon: LucideIcon;
};

type FeaturesGridProps = {
  eyebrow?: string;
  headline: ReactNode;
  items: readonly FeatureItem[];
  className?: string;
  gradientSrc?: string;
};

export function FeaturesGrid({
  eyebrow = "Features",
  headline,
  items,
  className,
  gradientSrc = "/images/background/reacher-gradient.jpg",
}: FeaturesGridProps) {
  return (
    <section className={cn("w-full", className)}>
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#6b6ff9]">
          {eyebrow}
        </p>
        <h3 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          {headline}
        </h3>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ title, description, Icon }) => (
          <div
            key={title}
            className="group rounded-[22px] border border-white/10 bg-black/35 p-5 shadow-[0_20px_60px_rgba(8,10,32,0.55)] backdrop-blur transition hover:-translate-y-0.5 hover:border-white/15"
          >
            <div className="relative aspect-[16/9] overflow-hidden rounded-[18px] border border-white/10 bg-white/5">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `linear-gradient(145deg, rgba(186,176,225,0.72) 0%, rgba(110,102,200,0.66) 48%, rgba(57,60,158,0.9) 100%), url('${gradientSrc}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div className="absolute inset-0 opacity-25 mix-blend-screen">
                <Image
                  src={gradientSrc}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute inset-0 opacity-80">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#7c7bff]/45 blur-2xl" />
                <div className="absolute -left-10 -bottom-10 h-28 w-28 rounded-full bg-white/12 blur-2xl" />
              </div>

              <div className="relative flex h-full items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-black/20 shadow-[0_14px_40px_rgba(0,0,0,0.35)] ring-1 ring-white/10 backdrop-blur">
                  <Icon className="h-8 w-8 text-white/90 drop-shadow-[0_10px_22px_rgba(255,255,255,0.18)]" />
                </div>
              </div>
            </div>

            <h4 className="mt-5 text-base font-semibold text-white">{title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-white/55">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

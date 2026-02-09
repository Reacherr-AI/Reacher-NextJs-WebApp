import "server-only";

import Link from "next/link";
import { Plus } from "lucide-react";

type Props = {
  faqItems: string[];
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
};

export function HaveQuestionsSection({
  faqItems,
  ctaLabel = "Book an intro call",
  ctaHref,
  className,
}: Props) {
  return (
    <section
      className={
        className ??
        "mx-auto mt-20 w-full max-w-275 px-6 text-white sm:px-10"
      }
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col justify-between gap-8">
          <div>
            <h3 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Have questions?
            </h3>
            <p className="mt-8 text-sm text-white/55 sm:text-base">
              Have more questions?
              <br />
              Book a free strategy call.
            </p>
          </div>

          {ctaHref ? (
            <Link
              href={ctaHref}
              className="w-fit rounded-full border border-white/30 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:border-white/60 hover:text-white"
            >
              {ctaLabel}
            </Link>
          ) : (
            <button className="w-fit rounded-full border border-white/30 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:border-white/60 hover:text-white">
              {ctaLabel}
            </button>
          )}
        </div>

        <div className="flex flex-col">
          {faqItems.map((question) => (
            <div
              key={question}
              className="flex items-center justify-between gap-6 border-b border-white/10 py-4"
            >
              <p className="text-sm text-white/70 sm:text-base">{question}</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/70">
                <Plus className="h-4 w-4" />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


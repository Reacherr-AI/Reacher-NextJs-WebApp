import { HaveQuestionsSection } from "@/components/layout/have-questions";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";

const faqItems = [
  "How much time am I actually getting for my money?",
  "How do I communicate feedback/revisions?",
  "When does my month start? Can I pause?",
  "How do I know you won't delay the turnaround time?",
  "I'm unhappy with the work. How do I get a refund?",
  "How will you share your work?",
  "Why wouldn't I just hire a Freelancer?",
  "What do I need to give you to get started?",
  "Is there a limit on file size?",
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto w-full max-w-378 rounded-b-[23.62px] bg-[radial-gradient(1200px_circle_at_50%_15%,rgba(255,255,255,0.10)_0%,rgba(56,66,218,0.18)_28%,rgba(12,14,55,0.55)_55%,rgba(0,0,0,1)_100%)] px-6 pb-24 pt-10 shadow-[0_40px_120px_rgba(6,7,33,0.45)] sm:px-10">
        <SiteNavbar activeLabel="Pricing" />

        <section className="mx-auto mt-20 max-w-5xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            You only pay for what
            <br />
            you use.
          </h1>
          <p className="mt-6 text-sm font-medium text-white/55 sm:text-base">
            Treat Reacherr like your outsourced call center.
          </p>
        </section>

        <section className="mx-auto mt-14 grid w-full max-w-5xl gap-6 lg:grid-cols-2">
          <div className="rounded-[22px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur sm:p-10">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Pay as you go
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/55">
              $0 to start.
              <br />
              Self-Serve
              <br />
              Start instantly.
            </p>

            <div className="mt-10 flex flex-wrap items-end gap-x-2 gap-y-1">
              <span className="text-4xl font-semibold tracking-tight">
                $0.10
              </span>
              <span className="pb-1 text-sm text-white/60">
                / Minute Per Connected Call
              </span>
            </div>

            <button className="mt-6 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black">
              Try This Feature
            </button>

            <ul className="mt-8 list-disc space-y-2 pl-5 text-sm text-white/70">
              <li>Free Analytics</li>
              <li>Upto 50 Concurrent Calls</li>
              <li>100 Calls Limit on Bulk Calls</li>
              <li>$6/Month for a Custom Number</li>
              <li>$10/channel/month for extra concurrency</li>
              <li>1 Bulk Call at a time</li>
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-linear-to-br from-white/10 via-white/5 to-transparent p-8 shadow-[0_30px_90px_rgba(0,0,0,0.55)] sm:p-10">
            <div
              className="absolute inset-0 opacity-100"
              style={{
                backgroundImage:
                  "linear-gradient(145deg, rgba(186,176,225,0.75) 0%, rgba(110,102,200,0.7) 48%, rgba(57,60,158,0.9) 100%), url('/images/background/reacher-gradient.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div
              className="absolute inset-0 opacity-20 mix-blend-screen"
              style={{
                backgroundImage: "url('/images/background/reacher-gradient.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="absolute inset-0 opacity-70">
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#7c7bff]/40 blur-2xl" />
              <div className="absolute bottom-0 left-0 h-20 w-24 rounded-full bg-[#ffffff]/10 blur-2xl" />
            </div>

            <div className="relative">
              <h2 className="text-2xl font-semibold sm:text-3xl">
                Enterprise Plan
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/80">
                For companies with large call volumes
                <br />
                Optional White-Glove Service
                <br />
                Prefer not to DIY? We&apos;ll custom-build and scale your AI
                agent for you
              </p>

              <div className="mt-10 flex flex-wrap items-end gap-x-2 gap-y-1">
                <span className="text-4xl font-semibold tracking-tight">
                  $0.06
                </span>
                <span className="pb-1 text-sm text-white/85">
                  / Minute Per Connected Call
                </span>
              </div>

              <button className="mt-6 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black">
                Try This Feature
              </button>

              <ul className="mt-8 list-disc space-y-2 pl-5 text-sm text-white/90">
                <li>Free Analytics</li>
                <li>Upto 100 Concurrent Calls</li>
                <li>10,000 Calls Limit on Bulk Calls</li>
                <li>$6/Month for a Custom Number</li>
                <li>Priority Support</li>
                <li>Custom Integration</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <HaveQuestionsSection faqItems={faqItems} />
      <SiteFooter />
    </div>
  );
}

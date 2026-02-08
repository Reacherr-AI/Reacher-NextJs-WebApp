import Image from "next/image";
import {
  Facebook,
  Instagram,
  MessageCircle,
  Plus,
  Send,
  Twitter,
} from "lucide-react";
import { Marquee } from "@/components/ui/marquee";

const navLinks = ["Home", "Product", "Solution", "Pricing", "About Us"];
const brandLogos = [
  { name: "Doordash", src: "/images/brands/doordash-logo.svg" },
  { name: "Amazon", src: "/images/brands/amazon-logo.png" },
  { name: "Shopify", src: "/images/brands/shopify-logo.png" },
];

const useCases = [
  { title: "Customer Support", icon: "support" },
  { title: "Receptionist", icon: "mic" },
  { title: "Dispatch Service", icon: "dispatch" },
  { title: "Lead Qualification", icon: "leads", featured: true },
];

const voiceStyles = [
  { name: "Eva", src: "/images/testimonials/testimonial-1.svg" },
  { name: "James", src: "/images/testimonials/testimonial-2.svg" },
  { name: "Adam", src: "/images/testimonials/testimonial-3.svg" },
  { name: "Neptune", src: "/images/testimonials/testimonial-4.svg" },
  { name: "Kate", src: "/images/testimonials/testimonial-5.svg" },
  { name: "Emma", src: "/images/testimonials/testimonial-6.svg" },
  { name: "Jeet", src: "/images/testimonials/testimonial-7.svg" },
  { name: "Lily", src: "/images/testimonials/testimonial-8.svg" },
  { name: "John", src: "/images/testimonials/testimonial-9.svg" },
  { name: "Clara", src: "/images/testimonials/testimonial-10.svg" },
];
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

export default function Home() {
  return (
    <div className="min-h-screen bg-black pb-24">
      <main className="mx-auto flex min-h-[850.5px] w-full max-w-378 flex-col rounded-b-[23.62px] bg-[radial-gradient(1200px_circle_at_75%_78%,rgba(248,248,248,1)_0%,rgba(56,66,218,1)_32%,rgba(12,14,55,1)_60%,rgba(0,0,0,1)_100%)] px-6 pb-24 pt-10 shadow-[0_40px_120px_rgba(6,7,33,0.45)] sm:px-10">
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
                <button
                  key={link}
                  className={`rounded-full px-4 py-2 transition ${link === "Home"
                    ? "bg-white text-black"
                    : "hover:bg-white/10"
                    }`}
                >
                  {link}
                </button>
              ))}
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <button className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black shadow-[0_10px_24px_rgba(255,255,255,0.2)]">
              Login
            </button>
            <button className="rounded-full bg-black/80 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/10">
              Contact Sale
            </button>
          </div>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center text-center text-white">
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
              AI voice agent platform
            </p>
            <h1 className="text-3xl font-semibold leading-tight text-white sm:text-5xl">
              AI Voice Agents That Handle Calls For You
            </h1>
            <p className="mt-4 text-sm font-medium text-white/60 sm:text-base">
              #1 AI Voice Agent Platform for Automating Calls
            </p>
          </div>

          <button className="mt-10 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(16,20,64,0.45)] backdrop-blur transition hover:bg-white/15">
            Try Reacherr
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
              <Image
                src="/icons/spotify-bars.png"
                alt="Audio"
                width={16}
                height={16}
              />
            </span>
          </button>
        </section>
      </main>

      <section className="mx-auto mt-14 flex w-full max-w-275 flex-col items-center px-6 text-center text-white sm:px-10">
        <p
          className="text-[22px] font-normal leading-[140%] text-white/80 sm:text-3xl"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Trusted by{" "}
          <span className="font-bold text-[#6b6ff9]">10,000+</span>{" "}
          customer and brands worldwide
        </p>
        <Marquee
          className="mt-8 w-full max-w-4xl opacity-70"
          duration={28}
          gap="2.5rem"
          pauseOnHover
          fade
        >
          <span className="px-8 text-base font-semibold uppercase tracking-[0.4em] text-white/55">
            Microsoft
          </span>
          {brandLogos.map((brand) => (
            <div
              key={brand.name}
              className="relative h-8 w-28 shrink-0 px-8 sm:h-9 sm:w-32"
            >
              <Image
                src={brand.src}
                alt={brand.name}
                fill
                className="object-contain"
              />
            </div>
          ))}
        </Marquee>
      </section>

      <section className="mx-auto mt-16 w-full max-w-275 px-6 text-white sm:px-10">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#6b6ff9]">
            Use Case
          </p>
          <h2 className="mt-3 text-2xl font-semibold leading-snug sm:text-3xl">
            Reacherr AI turns voice interactions into automated workflows
          </h2>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-[repeat(3,minmax(0,1fr))_1.6fr]">
          {useCases.map((useCase) => (
            <div
              key={useCase.title}
              className={`relative overflow-hidden rounded-[20px] border border-white/10 bg-linear-to-br from-white/10 via-white/5 to-transparent p-5 shadow-[0_18px_40px_rgba(14,16,40,0.45)] ${useCase.featured
                ? "sm:col-span-1 sm:row-span-1 sm:h-50"
                : "h-50"
                }`}
            >
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

              <div className="relative flex h-full flex-col justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  {useCase.icon === "support" && (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M6 9a6 6 0 0 1 12 0v5a3 3 0 0 1-3 3h-3" />
                      <rect x="4" y="10" width="4" height="6" rx="2" />
                      <rect x="16" y="10" width="4" height="6" rx="2" />
                    </svg>
                  )}
                  {useCase.icon === "mic" && (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <rect x="9" y="3" width="6" height="12" rx="3" />
                      <path d="M5 11a7 7 0 0 0 14 0" />
                      <path d="M12 18v3" />
                    </svg>
                  )}
                  {useCase.icon === "dispatch" && (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M4 7h16v10H4z" />
                      <path d="M8 7v10" />
                      <path d="M16 7v10" />
                    </svg>
                  )}
                  {useCase.icon === "leads" && (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <circle cx="9" cy="9" r="3" />
                      <circle cx="17" cy="7" r="2" />
                      <path d="M4 19a5 5 0 0 1 10 0" />
                      <path d="M14 17a4 4 0 0 1 6 0" />
                    </svg>
                  )}
                </div>

                {useCase.featured ? (
                  <div>
                    <h3 className="text-lg font-semibold">Lead Qualification</h3>
                    <p className="mt-2 text-xs leading-relaxed text-white/70">
                      Identify potential clients and screen prospect. Automate
                      outreach for better conversion.
                    </p>
                    <button className="mt-4 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white/80">
                      Learn More
                    </button>
                  </div>
                ) : (
                  <p className="text-xs font-semibold text-white/80">
                    {useCase.title}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 grid w-full max-w-275 gap-10 px-6 text-white sm:grid-cols-[1.1fr_2fr] sm:px-10">
        <div>
          <h3 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Choose from the{" "}
            <span className="text-[#6b6ff9]">voice</span> styles
          </h3>
          <p className="mt-4 text-sm text-white/55 sm:text-base">
            Select from a diverse range of AI voice presenters, from warm
            narrators to energetic.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          {voiceStyles.map((voice) => (
            <div
              key={voice.name}
              className="flex items-center gap-4 rounded-full border border-white/15 bg-black/40 pl-2 px-5 py-1 text-sm text-white/80 shadow-[0_12px_30px_rgba(10,12,30,0.35)]"
            >
              <div className="relative h-10 w-10 overflow-hidden rounded-full bg-white/10 ring-2 ring-white/5">
                <Image
                  src={voice.src}
                  alt={voice.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{voice.name}</p>
                <p className="text-[11px] text-white/50">Soft &amp; Natural</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 w-full max-w-275 px-6 text-white sm:px-10">
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
            <button className="w-fit rounded-full border border-white/30 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:border-white/60 hover:text-white">
              Book an intro call
            </button>
          </div>

          <div className="flex flex-col">
            {faqItems.map((question) => (
              <div
                key={question}
                className="flex items-center justify-between gap-6 border-b border-white/10 py-4"
              >
                <p className="text-sm text-white/70 sm:text-base">
                  {question}
                </p>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/70">
                  <Plus className="h-4 w-4" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto mt-20 w-full max-w-275 px-6 pb-10 text-white sm:px-10">
        <div className="mb-12 mt-4 h-px w-40 bg-white/20" />
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr_1fr]">
          <div className="flex flex-col gap-2 text-lg font-medium text-white/70">
            <span>Products</span>
            <span>Solution</span>
            <span>Resources</span>
            <span>Archive</span>
            <span className="mt-10 text-xs text-white/35">
              © 2023 — Copyright
            </span>
          </div>

          <div className="flex flex-col gap-6 text-sm text-white/55">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                Contact Us
              </p>
              <p className="mt-3 text-sm text-white/70">+1 980 971-24-19</p>
              <p className="text-sm text-white/70">hello@logoipsum.com</p>
            </div>

            <div className="flex items-center gap-3">
              {[
                { name: "facebook", Icon: Facebook },
                { name: "twitter", Icon: Twitter },
                { name: "instagram", Icon: Instagram },
                { name: "send", Icon: Send },
                { name: "message", Icon: MessageCircle },
              ].map(({ name, Icon }) => (
                <span
                  key={name}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70"
                >
                  <Icon className="h-4 w-4" />
                </span>
              ))}
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                Location
              </p>
              <p className="mt-3 text-sm text-white/70">
                1901 Thornridge Cir. Shiloh, Hawaii 81063
              </p>
              <p className="mt-2 text-sm text-white/70">
                10am—6pm
              </p>
              <p className="text-xs text-white/40">/ Everyday</p>
            </div>
            <div className="text-xs text-white/40">Privacy</div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/5 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
            <h4 className="text-lg font-semibold">Start Free Trial</h4>
            <p className="mt-3 text-sm text-white/55">
              See what makes Reacherr AI voice platform unique from how it
              works to what it can do for your team
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black">
                Try for Free
              </button>
              <button className="rounded-full bg-indigo-500 px-4 py-2 text-xs font-semibold text-white">
                Contact Sale
              </button>
            </div>
          </div>
        </div>

      </footer>
    </div>
  );
}

import Image from "next/image";
import {
  ArrowLeftRight,
  BarChart3,
  Globe,
  PhoneCall,
  PlugZap,
  Timer,
} from "lucide-react";
import { Marquee } from "@/components/ui/marquee";
import { FeaturesGrid } from "@/components/ui/features-grid";
import { FeatureCard } from "@/components/layout/feature-card";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { HaveQuestionsSection } from "@/components/layout/have-questions";
import { SiteFooter } from "@/components/layout/site-footer";
import { getAccessToken } from "@/lib/auth/auth-cookies";
// Import the new client component
import { InteractiveUseCases } from "@/components/home/use-cases";
import { ToolsShowcase } from "@/components/home/tools-showcase";
import { CategoryShowcase } from "@/components/home/category-showcase";
import { TestimonialSection } from "@/components/home/testimonial-section";
import { ProSupportSection } from "@/components/home/pro-support";
import { cn } from "@/lib/utils";

const brandLogos = [
  { name: "Doordash", src: "/images/brands/doordash-logo.svg" },
  { name: "Amazon", src: "/images/brands/amazon-logo.png" },
  { name: "Shopify", src: "/images/brands/shopify-logo.png" },
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

const featureItems = [
  {
    title: "Auto Dialer",
    description:
      "High-velocity outbound dialing with smart retries for maximum reach.",
    Icon: PhoneCall,
  },
  {
    title: "Web Calls",
    description:
      "Embed voice calling on your website so visitors can talk instantly.",
    Icon: Globe,
  },
  {
    title: "Lowest Latency",
    description:
      "Sub-second responses tuned for natural conversations at scale.",
    Icon: Timer,
  },
  {
    title: "Enhanced CRM Integrations",
    description:
      "Sync calls, leads, and outcomes to your CRM with clean automation.",
    Icon: PlugZap,
  },
  {
    title: "Seamless Call Transfer",
    description:
      "Hand off to human agents with context preserved, no awkward resets.",
    Icon: ArrowLeftRight,
  },
  {
    title: "Enterprise Call Analysis",
    description:
      "Dispositioning, transcripts, and insights to continuously improve.",
    Icon: BarChart3,
  },
] as const;

export default async function Home() {
  const accessToken = await getAccessToken();
  const isLoggedIn = !!(accessToken && accessToken.trim().length > 0);
  return (
    <div className="min-h-screen bg-black">
      <main className="relative mx-auto flex min-h-screen sm:min-h-[850px] w-full max-w-378 flex-col overflow-hidden rounded-b-[24px] bg-black px-6 pb-24 pt-10 shadow-2xl sm:px-10">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute bottom-[-15%] sm:bottom-[-35%] lg:bottom-[-120%] left-1/2 -translate-x-1/2 flex justify-center">
            <div className="animate-pendulum">
              <div
                className="rounded-full mix-blend-screen blur-[60px] sm:blur-[80px] lg:blur-[100px] h-[450px] w-[750px] sm:h-[1600px] sm:w-[2800px] lg:h-[1600px] lg:w-[2800px]"
                style={{
                  background: "radial-gradient(circle, #FFFFFF 10%, rgb(37,68,243) 30%, rgb(10,13,202) 60%, rgba(0,0,0,0) 80%)",
                }}
              />
            </div>
          </div>
        </div>
        <SiteNavbar activeLabel="Home" showDashboard={isLoggedIn}/>
        <div className="relative z-10 w-full flex flex-col items-center">
          <section className="mt-16 flex flex-col items-center justify-center text-center text-white sm:flex-1">
            <div className="max-w-3xl">
              {/* <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                AI voice agent platform
              </p> */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
                AI Voice Agents That Handle Calls For You
            </h1>
              <p className="mt-6 text-sm font-medium text-white/60 sm:text-base">
                #1 AI Voice Agent Platform for Automating Calls
              </p>
            </div>

            <button className="mt-10 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-6 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur transition hover:bg-white/15">
              Try Reacherr
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black">
                <Image
                  src="/icons/spotify-bars.png"
                  alt="Audio"
                  width={16}
                  height={16}
                />
              </span>
            </button>
          </section>
        </div>
      </main>

      {/* TRUSTED BY SECTION */}
      <section className="mx-auto mt-14 flex w-full max-w-5xl flex-col items-center px-6 text-center text-white sm:px-10">
        <h2 className="text-2xl font-medium tracking-tight text-white/90 sm:text-4xl lg:text-[40px]">
          Trusted by <span className="text-[#6b6ff9]">10,000+</span> creators and <br className="hidden sm:block" />
          brands worldwide
        </h2>
        <Marquee
          className="mt-8 sm:mt-10 w-full opacity-70 hover:opacity-100 transition-opacity duration-500"
          duration={35}
          gap="10rem"
          pauseOnHover
          fade
        >
          {brandLogos.map((brand) => (
            <div
              key={brand.name}
              className="relative h-14 sm:h-20 lg:h-24 w-[160px] sm:w-[220px] lg:w-[260px] flex-shrink-0"
            >
              <Image
                src={brand.src}
                alt={brand.name}
                fill
                className="object-contain opacity-80 hover:opacity-100 transition-all duration-300"
                sizes="(max-width: 640px) 160px,
                      (max-width: 1024px) 220px,
                      260px"
              />
            </div>
          ))}
        </Marquee>
      </section>

      {/* USE CASES COMPONENT */}
      <InteractiveUseCases />

      {/* VOICE STYLES SECTION */}
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

        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-5">
          {voiceStyles.map((voice) => (
            <div
              key={voice.name}
              className="flex items-center gap-3 rounded-full border border-white/10 bg-black/40 p-1.5 pr-4 text-xs text-white/80 shadow-lg backdrop-blur-sm"
            >
              <div className="relative h-8 w-8 sm:h-10 sm:w-10 overflow-hidden rounded-full ring-1 ring-white/10">
                <Image src={voice.src} alt={voice.name} fill className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-white">{voice.name}</p>
                <p className="text-[10px] text-white/40">Soft & Natural</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <CategoryShowcase />
      <FeaturesGrid
        className="mx-auto mt-20 max-w-275 px-6 text-white sm:px-10"
        headline={
          <>
            We offer <span className="text-[#6b6ff9]">best</span> in class
          </>
        }
        items={featureItems}
      />
      <ToolsShowcase />
      <TestimonialSection />
      <HaveQuestionsSection faqItems={faqItems} />
      <ProSupportSection />
      <SiteFooter />
    </div>
  );
}
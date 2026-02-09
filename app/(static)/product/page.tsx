import Link from "next/link";

import { HaveQuestionsSection } from "@/components/layout/have-questions";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { ProductHero } from "@/components/layout/product-hero";

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

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-black">
      <main className="mx-auto w-full max-w-378 rounded-b-[23.62px] bg-[radial-gradient(1200px_circle_at_70%_20%,rgba(248,248,248,0.14)_0%,rgba(56,66,218,0.2)_28%,rgba(12,14,55,0.55)_55%,rgba(0,0,0,1)_100%)] px-6 pb-24 pt-10 shadow-[0_40px_120px_rgba(6,7,33,0.45)] sm:px-10">
        <SiteNavbar
          activeLabel="Product"
          links={[
            { label: "Home", href: "/" },
            { label: "Product", href: "/product" },
            { label: "Solution" },
            { label: "Pricing" },
            { label: "About Us" },
          ]}
          rightSlot={
            <>
              <Link
                href="/sign-in"
                className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black shadow-[0_10px_24px_rgba(255,255,255,0.2)]"
              >
                Login
              </Link>
              <button className="rounded-full bg-black/80 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/10">
                Contact Sale
              </button>
            </>
          }
        />

        <ProductHero
          title="Call Transfer"
          cardTitle={
            <>
              Smarter Call Transfers,
              <br />
              Happier Customers
            </>
          }
          cardDescription={
            <>
              Seamlessly switch calls with AI-powered warm and cold transfers
              that save time, maintain context, and keep customers engaged.
            </>
          }
          primaryCta={{ label: "Try for Free", href: "/sign-up" }}
          secondaryCta={{ label: "Contact Sale" }}
          previewBack={{
            src: "/images/preview/product/call-transfer-2.png",
            alt: "Call transfer configuration preview",
            width: 1200,
            height: 800,
          }}
          previewFront={{
            src: "/images/preview/product/call-transfer-1.png",
            alt: "Call transfer modal preview",
            width: 1200,
            height: 800,
          }}
        />
      </main>

      <HaveQuestionsSection faqItems={faqItems} />
      <SiteFooter />
    </div>
  );
}

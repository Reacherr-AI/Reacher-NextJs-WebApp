# UI Components (Reference)

Reusable UI primitives live in `nextjs_reacherr_frontend/components/ui/`.
Reusable layout-level components live in `nextjs_reacherr_frontend/components/layout/`.

## Marquee

File: `nextjs_reacherr_frontend/components/ui/marquee.tsx`

Use for infinite scrolling rows (logos, badges, etc). Keyframes are in `nextjs_reacherr_frontend/app/globals.css`.

```tsx
import { Marquee } from "@/components/ui/marquee";

<Marquee duration={28} gap="2.5rem" pauseOnHover fade>
  {/* children */}
</Marquee>;
```

## FeaturesGrid

File: `nextjs_reacherr_frontend/components/ui/features-grid.tsx`

Feature cards grid (gradient panel + icon + title + description).

```tsx
import { PhoneCall } from "lucide-react";
import { FeaturesGrid } from "@/components/ui/features-grid";

<FeaturesGrid
  headline={
    <>
      We offer <span className="text-[#6b6ff9]">best</span> in class
    </>
  }
  items={[
    {
      title: "Auto Dialer",
      description: "High-velocity outbound dialing with smart retries.",
      Icon: PhoneCall,
    },
  ]}
/>;
```

## Add New Reusable Components

If we create a new component intended for reuse across pages (or blog posts), add a short entry here (file path + 1-2 lines + tiny snippet if needed).

## SiteNavbar

File: `nextjs_reacherr_frontend/components/layout/site-navbar.tsx`

Server Component navbar used by marketing/auth wrappers.

```tsx
import { SiteNavbar } from "@/components/layout/site-navbar";

<SiteNavbar activeLabel="Home" />;
```

## HaveQuestionsSection

File: `nextjs_reacherr_frontend/components/layout/have-questions.tsx`

FAQ list + “Have questions?” CTA section (Server Component).

```tsx
import { HaveQuestionsSection } from "@/components/layout/have-questions";

<HaveQuestionsSection faqItems={["How much time am I getting?"]} />;
```

## SiteFooter

File: `nextjs_reacherr_frontend/components/layout/site-footer.tsx`

Marketing footer (Server Component).

```tsx
import { SiteFooter } from "@/components/layout/site-footer";

<SiteFooter />;
```

## ProductHero

File: `nextjs_reacherr_frontend/components/layout/product-hero.tsx`

Reusable product hero section (title + value prop card + layered preview images). Server Component.

```tsx
import { ProductHero } from "@/components/layout/product-hero";

<ProductHero
  title="Call Transfer"
  cardTitle={<>Smarter Call Transfers,<br />Happier Customers</>}
  cardDescription={<>Seamlessly switch calls with AI-powered warm and cold transfers.</>}
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
/>;
```

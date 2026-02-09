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

## Design Trick: Gradient + Texture Layering

Used to keep card backgrounds consistent across pages (for example the Use Case cards on `/` and the Enterprise card on `/pricing`).

Pattern:
1. Base panel (`bg-linear-to-br ...`) for subtle depth.
2. Full-bleed gradient + texture image layer (`opacity-100`).
3. Extra texture layer with `mix-blend-screen` for grain.
4. A couple blurred blobs for highlights.

```tsx
<div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-linear-to-br from-white/10 via-white/5 to-transparent p-8">
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

  <div className="relative">{/* content */}</div>
</div>
```

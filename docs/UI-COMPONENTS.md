# UI Components (Reference)

Reusable UI primitives live in `nextjs_reacherr_frontend/components/ui/`.

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

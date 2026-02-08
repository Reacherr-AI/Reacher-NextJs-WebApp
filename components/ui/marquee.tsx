import * as React from "react";

import { cn } from "@/lib/utils";

type MarqueeProps = React.HTMLAttributes<HTMLDivElement> & {
  reverse?: boolean;
  pauseOnHover?: boolean;
  vertical?: boolean;
  repeat?: number;
  duration?: number; // seconds
  gap?: string; // CSS length, e.g. "2.5rem"
  fade?: boolean;
};

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = true,
  vertical = false,
  repeat = 2,
  duration = 30,
  gap = "2rem",
  fade = true,
  children,
  style,
  ...props
}: MarqueeProps) {
  // React.CSSProperties doesn't type custom properties; this keeps it strict elsewhere.
  const cssVars = {
    "--duration": `${duration}s`,
    "--gap": gap,
  } as React.CSSProperties;

  const groupClassName = cn(
    "flex min-w-full shrink-0 items-center justify-around [gap:var(--gap)]",
    vertical && "flex-col",
    vertical
      ? "animate-[marquee-vertical_var(--duration)_linear_infinite]"
      : "animate-[marquee_var(--duration)_linear_infinite]",
    reverse && "[animation-direction:reverse]",
    pauseOnHover && "group-hover:[animation-play-state:paused]"
  );

  const fadeClassName = fade
    ? vertical
      ? "[mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]"
      : "[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
    : "";

  return (
    <div
      {...props}
      className={cn(
        "group flex overflow-hidden [gap:var(--gap)]",
        fadeClassName,
        className
      )}
      style={{ ...cssVars, ...style }}
    >
      {Array.from({ length: Math.max(1, repeat) }).map((_, idx) => (
        <div key={idx} className={groupClassName} aria-hidden={idx !== 0}>
          {children}
        </div>
      ))}
    </div>
  );
}

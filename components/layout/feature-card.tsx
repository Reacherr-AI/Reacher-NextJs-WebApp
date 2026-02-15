import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type FeatureCardProps = {
  title: ReactNode;
  icon?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  featured?: boolean;
  className?: string;
  heightClassName?: string;
  gradientSrc?: string;
};

export function FeatureCard({
  title,
  icon,
  description,
  action,
  featured,
  className,
  heightClassName = "h-72",
  gradientSrc = "/images/background/reacher-gradient.jpg",
}: FeatureCardProps) {
  const isDetailed = Boolean(description || action);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[20px] border border-white/10 bg-linear-to-br from-white/10 via-white/5 to-transparent p-5 shadow-[0_18px_40px_rgba(14,16,40,0.45)]",
        heightClassName,
        featured && "sm:col-span-1 sm:row-span-1",
        className,
      )}
    >
      <div
        className="absolute inset-0 opacity-100"
        style={{
          backgroundImage: `linear-gradient(145deg, rgba(186,176,225,0.75) 0%, rgba(110,102,200,0.7) 48%, rgba(57,60,158,0.9) 100%), url('${gradientSrc}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div
        className="absolute inset-0 opacity-20 mix-blend-screen"
        style={{
          backgroundImage: `url('${gradientSrc}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 opacity-70">
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#7c7bff]/40 blur-2xl" />
        <div className="absolute bottom-0 left-0 h-20 w-24 rounded-full bg-[#ffffff]/10 blur-2xl" />
      </div>

      <div className="relative flex h-full flex-col justify-between">
        {icon ? (
          <div
            className={cn(
              "flex items-center justify-center rounded-xl bg-white/10",
              featured ? "h-14 w-14" : "h-11 w-11",
            )}
          >
            {icon}
          </div>
        ) : (
          <span />
        )}

        {isDetailed ? (
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {description ? (
              <p className="mt-2 text-xs leading-relaxed text-white/70">
                {description}
              </p>
            ) : null}
            {action ? <div className="mt-4">{action}</div> : null}
          </div>
        ) : (
          <p className="text-xs font-semibold text-white/80">{title}</p>
        )}
      </div>
    </div>
  );
}

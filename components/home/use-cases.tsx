"use client";

import { useState } from "react";

const useCases = [
  { 
    title: "Customer Support", 
    icon: "support",
    description: "Automate tier-1 support and triage tickets with AI agents." 
  },
  { 
    title: "Receptionist", 
    icon: "mic",
    description: "Handle inbound calls, bookings, and inquiries 24/7."
  },
  { 
    title: "Dispatch Service", 
    icon: "dispatch",
    description: "Coordinate fleets and drivers with automated voice commands."
  },
  { 
    title: "Lead Qualification", 
    icon: "leads", 
    description: "Identify potential clients and screen prospect. Automate outreach for better conversion."
  },
];

export function InteractiveUseCases() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="mx-auto mt-16 w-full max-w-275 px-6 text-white sm:px-10">
      <div className="max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#6b6ff9]">
          Use Case
        </p>
        <h2 className="mt-3 text-2xl font-semibold leading-snug sm:text-3xl">
          Reacherr AI turns voice interactions into automated workflows
        </h2>
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:flex gap-4 lg:h-[250px]">
        {useCases.map((useCase, index) => {
          const isHovered = hoveredIndex === index;
          // In mobile/tablet grid, we show content differently than the desktop "expansion"
          const isExpanded = isHovered; 

          return (
            <div
              key={useCase.title}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`
                relative overflow-hidden rounded-[24px] border border-white/10 
                shadow-[0_18px_40px_rgba(14,16,40,0.45)] 
                transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer
                ${isExpanded ? 'lg:flex-[2.5]' : 'lg:flex-1'}
                h-[220px] md:h-[240px] lg:h-auto
              `}
            >
              <div className="absolute inset-0 opacity-100 overflow-hidden bg-gradient-to-br from-[#5b50f6] to-[#7a4bf1]" />
              
              <div className="relative flex h-full flex-col justify-between p-6 z-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/10 shadow-inner">
                  {/* Icons remain the same */}
                  {useCase.icon === "support" && (
                    <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9a6 6 0 0 1 12 0v5a3 3 0 0 1-3 3h-3" />
                      <rect x="4" y="10" width="4" height="6" rx="2" />
                      <rect x="16" y="10" width="4" height="6" rx="2" />
                    </svg>
                  )}
                  {useCase.icon === "mic" && (
                    <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="3" width="6" height="12" rx="3" />
                      <path d="M5 11a7 7 0 0 0 14 0" />
                      <path d="M12 18v3" />
                    </svg>
                  )}
                  {useCase.icon === "dispatch" && (
                    <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 7h16v10H4z" />
                      <path d="M8 7v10" />
                      <path d="M16 7v10" />
                    </svg>
                  )}
                  {useCase.icon === "leads" && (
                    <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="9" cy="9" r="3" />
                      <circle cx="17" cy="7" r="2" />
                      <path d="M4 19a5 5 0 0 1 10 0" />
                      <path d="M14 17a4 4 0 0 1 6 0" />
                    </svg>
                  )}
                </div>

                <div className="mt-4">
                  <h3 className="text-xl font-bold text-white whitespace-nowrap tracking-tight">
                    {useCase.title}
                  </h3>
                  <div 
                    className={`
                      overflow-hidden transition-all duration-500 ease-in-out
                      ${/* On tablet/mobile, we can choose to always show description or keep the hover effect */
                        isExpanded ? 'max-h-40 opacity-100 mt-3' : 'md:max-h-40 md:opacity-100 md:mt-3 lg:max-h-0 lg:opacity-0'
                      }
                    `}
                  >
                    <p className="text-sm leading-relaxed text-white/90 font-medium">
                      {useCase.description}
                    </p>
                    <button className="mt-5 rounded-full bg-white/20 border border-white/10 px-5 py-2 text-xs font-bold text-white hover:bg-white/30 transition-colors backdrop-blur-sm">
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
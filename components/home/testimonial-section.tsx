"use client";

import { useState } from "react";
import Image from "next/image";

const testimonialData = [
  {
    id: "mlr",
    partnerName: "ML&R",
    quote: "Software for accounting firms is notoriously outdated, slow, and hard to use. Reacherr is different – it's a more streamlined, cloud-first approach.",
    author: "Kate Williams",
    role: "Partner, Maxwell Locke & Ritter",
    image: "/images/testimonials/testimonial-1.svg", 
    metric: "5X",
    metricLabel: "Business Growth"
  },
  {
    id: "wipfli",
    partnerName: "WIPFLI",
    quote: "The efficiency gains we've seen since integrating Reacherr's voice agents have completely transformed our client intake process.",
    author: "James Chen",
    role: "Director, WIPFLI",
    image: "/images/testimonials/testimonial-2.svg",
    metric: "3.5X",
    metricLabel: "Efficiency Increase"
  },
  {
    id: "berrydunn",
    partnerName: "BerryDunn",
    quote: "Our team can now focus on high-value advisory work while the AI handles the routine scheduling and follow-ups seamlessly.",
    author: "Sarah Miller",
    role: "Consultant, BerryDunn",
    image: "/images/testimonials/testimonial-3.svg",
    metric: "60%",
    metricLabel: "Time Saved"
  },
  {
    id: "warren",
    partnerName: "Warren Averett",
    quote: "A truly modern solution for a legacy industry. The latency is practically non-existent, making conversations feel human.",
    author: "Robert Ross",
    role: "VP, Warren Averett",
    image: "/images/testimonials/testimonial-4.svg",
    metric: "10X",
    metricLabel: "Scale Capacity"
  }
];

export function TestimonialSection() {
  const [activeTab, setActiveTab] = useState(testimonialData[0]);

  return (
    <section className="w-full bg-[#131924] py-16 text-white">
      {/* Centered container for content */}
      <div className="mx-auto max-w-275 px-6 sm:px-10">
        
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Trusted by industry leaders
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-gray-400 max-w-xl opacity-70">
            Reacherr is the modern, award-winning platform that powers many of the largest advisory and audit firms.
          </p>

          {/* Partner Navigation */}
          <div className="mt-10 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 sm:gap-x-12">
            {testimonialData.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item)}
                className={`text-sm sm:text-lg font-bold tracking-[0.15em] transition-all duration-300 ${
                  activeTab.id === item.id 
                  ? "text-white opacity-100 scale-105" 
                  : "text-gray-500 opacity-40 hover:opacity-70"
                }`}
              >
                {item.partnerName}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12 lg:gap-16 items-center min-h-[350px] sm:min-h-[300px] animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Left: Person & Quote */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start text-center md:text-left">
            <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-2xl bg-[#1a202c] grayscale">
              <Image 
                src={activeTab.image} 
                alt={activeTab.author}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-xl sm:text-2xl font-medium leading-relaxed tracking-tight text-gray-100 italic md:not-italic">
                “{activeTab.quote}”
              </p>
              <div className="mt-6">
                <p className="text-sm sm:text-base font-bold text-white">{activeTab.author}</p>
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-500 mt-1">
                  {activeTab.role}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Metric */}
          <div className="flex flex-col items-center lg:items-end lg:text-right border-t border-white/5 pt-8 lg:border-none lg:pt-0">
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="text-7xl sm:text-8xl font-bold tracking-tighter text-white leading-none">
                {activeTab.metric}
              </span>
              {/* Arrow Box - Matches Screenshot 2 exactly */}
              <div className="mt-2 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded bg-[#1e291e] text-[#22c55e]">
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  className="h-3 w-3 sm:h-4 sm:w-4"
                >
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-lg sm:text-xl font-bold text-white tracking-tight">
              {activeTab.metricLabel}
            </p>
            <p className="mt-4 max-w-[260px] text-xs sm:text-sm leading-relaxed text-gray-500">
              Reacherr innovations and efficiencies helped {activeTab.partnerName} grow their practice by {activeTab.metric}.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
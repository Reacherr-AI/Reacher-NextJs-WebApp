"use client";

import Link from "next/link";

export function ProSupportSection() {
  return (
    <section className="relative w-full bg-black py-32 mt-20 overflow-hidden">
      {/* The Radial Glow Effect */}
      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] sm:w-[800px] sm:h-[500px] opacity-60 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 54%, #1d4ed8 10%, #059669 60%, transparent 70%)",
          filter: "blur(15px)",
          transform: "rotate(-10deg)"
        }}
      />

      <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
        <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white mb-6">
          Get pro support.
        </h2>
        <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-10 max-w-lg mx-auto">
          We're here to help. If you need assistance switching from your current solution, 
          have any questions about why Reacherr is right for your business, or want support 
          getting started, please talk to a member of our team.
        </p>
        
        <Link 
          href="/contact"
          className="inline-flex items-center justify-center rounded-lg bg-[#0066FF] px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-blue-600 active:scale-95 shadow-[0_0_20px_rgba(0,102,255,0.3)]"
        >
          Contact sales
        </Link>
      </div>
    </section>
  );
}
"use client";

import { useEffect, useState } from "react";
import { Github, Slack, Sparkles, Command } from "lucide-react";

export function ToolsShowcase() {
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);

  useEffect(() => {
    const timers = [0, 1, 2].map((index) => {
      return setTimeout(() => {
        setVisibleMessages((prev) => [...prev, index]);
      }, 500 + index * 1000);
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section className="mx-auto mt-20 w-full max-w-[1100px] px-6 text-white sm:px-10 mb-20">
      <div className="mb-10">
        <p className="text-sm font-semibold text-[#818cf8]">Features</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Powerful AI voice tools built <br /> for everyone
        </h2>
      </div>

      {/* Reduced Height to 420px and Gap to 4 */}
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] lg:h-[420px]">
        
        {/* --- LEFT CARD: API INTEGRATION --- */}
        <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#0A0A0B] p-6 lg:p-8 flex flex-col">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 h-[300px] w-[300px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 mb-4">
            <h3 className="text-xl font-semibold text-white">API integration</h3>
            <p className="mt-2 text-sm text-gray-400 max-w-sm leading-snug">
              Connect Reacherr with your tools and automate voice workflows.
            </p>
          </div>

          {/* ORBIT CONTAINER - Fills remaining space */}
          <div className="relative flex-1 w-full flex items-end justify-center pb-4">
            {/* The SVG Path - Flatter Curve */}
            <svg className="absolute w-full h-full bottom-0 left-0" viewBox="0 0 600 150" fill="none" preserveAspectRatio="none">
              <path 
                id="orbitPath"
                d="M-100,160 Q300,-50 700,150" 
                stroke="white" 
                strokeOpacity="0.10" 
                strokeWidth="2" 
                strokeDasharray="6 6"
                fill="none"
              />
            </svg>

            {/* Orbiting Icons */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
               {/* Icon 1: Github */}
               <div className="orbit-icon" style={{ animationDelay: '0s' }}>
                  <div className="p-4 rounded-full bg-[#181717] border border-white/10 shadow-xl">
                     <Github className="w-7 h-7 text-white" />
                  </div>
               </div>
               {/* Icon 2: Slack */}
               <div className="orbit-icon" style={{ animationDelay: '-3s' }}>
                  <div className="p-4 rounded-full bg-[#4A154B] border border-white/10 shadow-xl">
                     <Slack className="w-7 h-7 text-white" />
                  </div>
               </div>
               {/* Icon 3: OpenAI */}
               <div className="orbit-icon" style={{ animationDelay: '-6s' }}>
                  <div className="p-5 rounded-full bg-black border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                     <Sparkles className="w-9 h-9 text-white" />
                  </div>
               </div>
               {/* Icon 4: Generic App */}
               <div className="orbit-icon" style={{ animationDelay: '-9s' }}>
                  <div className="p-4 rounded-full bg-[#1A202C] border border-white/10 shadow-xl">
                     <Command className="w-7 h-7 text-blue-400" />
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN --- */}
        <div className="flex flex-col gap-4 h-full">
          
          {/* TOP CARD: Languages */}
          <div className="flex-1 relative overflow-hidden rounded-[24px] border border-white/10 bg-[#0A0A0B] p-6 flex flex-col justify-center">
            <h3 className="text-lg font-semibold text-white leading-tight">
              Engage your Audience in <br /> 30 languages.
            </h3>
            <p className="mt-1 text-[10px] text-gray-500 uppercase tracking-wider font-bold">Voice from around the world</p>
            
            <div className="mt-5 bg-[#121214] rounded-xl p-4 border border-white/5 shadow-inner">
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1c1c1e] rounded-md border border-white/5 text-xs text-white">
                   <span className="text-base">🇮🇳</span> Hindi
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#2E2E32] rounded-md border border-white/20 text-xs text-white shadow-lg">
                   <span className="text-base">🇬🇧</span> UK English
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1c1c1e] rounded-md border border-white/5 text-xs text-white">
                   <span className="text-base">🇪🇸</span> Spanish
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM CARD: Voice Cloning */}
          <div className="flex-1 relative overflow-hidden rounded-[24px] border border-white/10 bg-[#0A0A0B] p-6 flex flex-col justify-center">
            <h3 className="text-lg font-semibold text-white">Voice cloning</h3>
            <p className="mt-1 text-xs text-gray-400 leading-snug">Create a custom voice from audio samples.</p>

            <div className="mt-5 space-y-2">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i}
                  className={`flex items-center gap-3 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    visibleMessages.includes(i) 
                      ? "opacity-100 translate-x-0" 
                      : "opacity-0 -translate-x-4"
                  }`}
                >
                   {/* Compact Audio Bubble */}
                   <div className="flex-1 h-9 bg-[#1c1c1e] rounded-full border border-white/5 flex items-center px-3 gap-1 shadow-sm">
                      <div className="h-4 w-4 rounded-full bg-white text-black flex items-center justify-center mr-1">
                        <svg width="6" height="6" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                      {[...Array(5)].map((_, idx) => (
                        <div key={idx} className="w-0.5 bg-white/40 rounded-full" style={{ height: Math.random() * 8 + 6 + 'px' }} />
                      ))}
                      <div className="ml-auto text-[9px] text-gray-500 font-mono">00:18</div>
                   </div>
                   
                   {/* Avatar */}
                   <div className={`h-8 w-8 shrink-0 rounded-full border border-[#0A0A0B] shadow-sm ${i === 0 ? 'bg-orange-500' : 'bg-gray-700'}`} />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
"use client";

import { useState } from "react";
import {
  Truck,
  Stethoscope,
  BookOpen,
  LineChart,
  Briefcase,
  ShoppingBag,
  Phone,
} from "lucide-react";

const categories = [
  { id: "logistics", label: "Logistics", icon: Truck, color: "text-blue-600" },
  { id: "healthcare", label: "Healthcare", icon: Stethoscope, color: "text-teal-500" },
  { id: "education", label: "Education", icon: BookOpen, color: "text-green-500" },
  { id: "finance", label: "Finance", icon: LineChart, color: "text-gray-600" },
  { id: "hr", label: "Hr & Recruitment", icon: Briefcase, color: "text-purple-600" },
  { id: "ecommerce", label: "Ecommerce", icon: ShoppingBag, color: "text-orange-500" },
];

export function CategoryShowcase() {
  const [activeId, setActiveId] = useState("logistics");
  const activeCategory =
    categories.find((c) => c.id === activeId) || categories[0];

  return (
    <section className="relative mt-15 w-full overflow-hidden bg-gradient-to-br from-[#5b50f6] to-[#7a4bf1] py-10 sm:py-16 lg:py-20">
      <div className="pointer-events-none absolute -top-20 -right-20 h-[280px] w-[280px] sm:h-[500px] sm:w-[500px] rounded-full bg-white/10 blur-[100px] sm:blur-[120px] mix-blend-overlay" />

      <div className="relative z-10 mx-auto max-w-275 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-white mb-8">
              Select a category and <br className="hidden sm:block" />
              talk with your agent.
            </h2>

            <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveId(cat.id)}
                  className={`group flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200
                    ${
                      activeId === cat.id
                        ? "bg-white/20 border-white/40 shadow-md scale-[1.02]"
                        : "bg-white/10 border-white/10 hover:bg-white/15"
                    }
                  `}
                >
                  <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                    <cat.icon className={`h-4 w-4 ${cat.color}`} />
                  </div>

                  <span className="text-sm font-semibold text-white">
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center text-center">
            <div
              className="relative mb-6 flex h-36 w-36 sm:h-40 sm:w-40 items-center justify-center transition-all duration-500"
              key={activeId}
            >
              <div className="absolute inset-0 rounded-full bg-orange-400 opacity-40 blur-2xl" />

              {activeId === "logistics" ? (
                <div className="relative flex h-28 w-28 sm:h-32 sm:w-32 rotate-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-300 to-yellow-500 shadow-2xl transition-transform hover:rotate-6">
                  <Truck className="h-14 w-14 sm:h-16 sm:w-16 text-white/90" />
                </div>
              ) : (
                <div className="flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl">
                  <activeCategory.icon className="h-14 w-14 sm:h-16 sm:w-16 text-white" />
                </div>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Try "{activeCategory.label}" Agents
            </h3>

            <p className="mb-8 text-sm text-white/70">
              Agent call is available for 2 minutes
            </p>

            {/* Responsive Input Section */}
            <div className="flex w-full max-w-md flex-col gap-2 sm:flex-row sm:gap-0 items-stretch sm:items-center rounded-2xl bg-white p-2 shadow-[0_20px_40px_rgba(0,0,0,0.2)]">

              <input
                type="text"
                placeholder="Enter Company Name"
                className="flex-1 bg-transparent px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none min-w-0"
              />

              <button className="flex items-center justify-center gap-2 rounded-full bg-black px-4 py-3 text-xs font-bold text-white transition-colors hover:bg-gray-800">
                <Phone className="h-3.5 w-3.5" />
                Start Call
              </button>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import React, { useState } from "react";
import { ShieldCheck, Cpu, Smartphone, Check } from "lucide-react";
import { IntelligenceMark } from "./IntelligenceMark";

export function GlassSectionComparator() {
  const [activeSplitTab, setActiveSplitTab] = useState<"without" | "with">("with");

  return (
    <section className="relative z-10 w-full max-w-5xl mx-auto px-6 py-28 flex flex-col gap-28">
      {/* Visual Transition: Architectural Light Guide Connecting Sections */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-20 bg-gradient-to-b from-white/80 via-[#8DE8BF]/40 to-transparent pointer-events-none" />

      {/* Optical Glass Split Demonstration: Without Memory vs With Memory */}
      <div className="flex flex-col gap-8 relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 border-b border-white/60 pb-6">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#167A55] flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#167A55]" />
              Interactive Proof
            </span>
            <h2 className="font-display font-semibold text-2xl sm:text-3xl text-[#17191C] tracking-tight">
              Without memory vs With memory
            </h2>
          </div>

          {/* Frosted Glass Comparator Toggle Pill */}
          <div className="inline-flex p-1.5 rounded-full glass-frosted self-start sm:self-auto shadow-xs border border-white/80">
            <button
              onClick={() => setActiveSplitTab("without")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                activeSplitTab === "without"
                  ? "bg-white text-[#17191C] shadow-sm border border-white/90"
                  : "text-[#6F7378] hover:text-[#17191C]"
              }`}
            >
              Without memory
            </button>
            <button
              onClick={() => setActiveSplitTab("with")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                activeSplitTab === "with"
                  ? "bg-[#167A55] text-[#F7F7F5] shadow-sm"
                  : "text-[#6F7378] hover:text-[#17191C]"
              }`}
            >
              With memory
            </button>
          </div>
        </div>

        {/* Translucent Comparator Plates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Plate A: Without Memory (Cold Frosted Acrylic) */}
          <div
            className={`p-7 rounded-[24px] transition-all duration-500 relative overflow-hidden ${
              activeSplitTab === "without"
                ? "glass-frosted border-white/90 shadow-[0_24px_56px_-16px_rgba(23,25,28,0.07)]"
                : "glass-clear opacity-55 hover:opacity-80"
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/50">
              <span className="font-mono text-xs text-[#6F7378]">Without memory</span>
              <span className="text-[10px] text-[#6F7378] font-mono">Standard Chatbot</span>
            </div>
            <div className="mt-6 flex flex-col gap-3.5">
              <div className="self-end rounded-[14px] bg-[#17191C]/90 text-[#F7F7F5] px-4 py-2.5 text-xs shadow-xs">
                What do you know about me?
              </div>
              <div className="self-start rounded-[16px] bg-white/60 backdrop-blur-md border border-white/70 text-[#17191C] p-4 text-xs leading-relaxed max-w-[92%] shadow-xs">
                I don't have access to past conversations. Could you remind me what you're working on?
              </div>
            </div>
          </div>

          {/* Plate B: With Memory (Luminous Optical Glass Plate) */}
          <div
            className={`p-7 rounded-[24px] transition-all duration-500 relative overflow-hidden ${
              activeSplitTab === "with"
                ? "glass-plate border-[#8DE8BF]/70 shadow-[0_28px_60px_-16px_rgba(66,201,138,0.18),0_0_32px_-6px_rgba(200,245,222,0.35)]"
                : "glass-clear opacity-55 hover:opacity-80"
            }`}
          >
            {/* Subsurface Light Pocket */}
            <div
              className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-[40px] pointer-events-none transition-opacity duration-500"
              style={{
                background: "radial-gradient(circle, rgba(66,201,138,0.22) 0%, rgba(200,245,222,0.15) 60%, transparent 80%)",
                opacity: activeSplitTab === "with" ? 1 : 0.2,
              }}
            />

            <div className="flex items-center justify-between pb-4 border-b border-white/60 relative z-[1]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-[#167A55]">With memory</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#167A55]" />
              </div>
              <span className="text-[10px] font-mono text-[#167A55] bg-white/80 px-2.5 py-0.5 rounded-full border border-[#8DE8BF]/50 shadow-xs">
                Walrus Active
              </span>
            </div>

            <div className="mt-6 flex flex-col gap-3.5 relative z-[1]">
              <div className="self-end rounded-[14px] bg-[#17191C]/90 text-[#F7F7F5] px-4 py-2.5 text-xs shadow-xs">
                What do you know about me?
              </div>
              <div className="self-start rounded-[16px] bg-white/75 backdrop-blur-md border border-[#8DE8BF]/40 text-[#17191C] p-4 text-xs leading-relaxed max-w-[95%] flex flex-col gap-2.5 shadow-xs">
                <span className="text-[10px] text-[#167A55] font-mono flex items-center gap-1.5">
                  <IntelligenceMark size={10} active={true} />
                  <span>Remembered 2 things (92% relevance)</span>
                </span>
                <p>
                  You are an astrophysicist studying exoplanets, and you mentioned your go-to ice cream is pistachio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layered Glass Specimen Plates: 3 Core Requirements */}
      <div className="flex flex-col gap-10">
        <div className="border-b border-white/60 pb-5">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#167A55]">
            Core Requirements
          </span>
          <h2 className="font-display font-semibold text-2xl sm:text-3xl text-[#17191C] tracking-tight mt-1.5">
            How Tusk remembers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Specimen Plate 1 */}
          <div className="group flex flex-col gap-4 p-7 rounded-[24px] glass-plate hover:border-white/95 hover:shadow-[0_28px_60px_-16px_rgba(23,25,28,0.08),0_0_24px_-4px_rgba(141,232,191,0.18)] hover:-translate-y-1 transition-all duration-400">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#167A55] font-semibold">01</span>
              <div className="h-8 w-8 rounded-full bg-white/80 border border-[#8DE8BF]/40 flex items-center justify-center text-[#167A55] shadow-xs group-hover:scale-108 transition-transform">
                <Cpu className="h-3.5 w-3.5" />
              </div>
            </div>
            <h3 className="font-display font-semibold text-base text-[#17191C]">
              Across Conversations
            </h3>
            <p className="text-xs text-[#6F7378] leading-relaxed">
              Clear your chat history anytime. Tusk stores facts in Walrus Memory, recalling them seamlessly when you return.
            </p>
          </div>

          {/* Specimen Plate 2 */}
          <div className="group flex flex-col gap-4 p-7 rounded-[24px] glass-plate hover:border-white/95 hover:shadow-[0_28px_60px_-16px_rgba(23,25,28,0.08),0_0_24px_-4px_rgba(141,232,191,0.18)] hover:-translate-y-1 transition-all duration-400">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#167A55] font-semibold">02</span>
              <div className="h-8 w-8 rounded-full bg-white/80 border border-[#8DE8BF]/40 flex items-center justify-center text-[#167A55] shadow-xs group-hover:scale-108 transition-transform">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
            </div>
            <h3 className="font-display font-semibold text-base text-[#17191C]">
              Across Users (Isolated)
            </h3>
            <p className="text-xs text-[#6F7378] leading-relaxed">
              Strict per-user cryptographic namespaces. Alice never sees Bob’s memories, enforced server-side.
            </p>
          </div>

          {/* Specimen Plate 3 */}
          <div className="group flex flex-col gap-4 p-7 rounded-[24px] glass-plate hover:border-white/95 hover:shadow-[0_28px_60px_-16px_rgba(23,25,28,0.08),0_0_24px_-4px_rgba(141,232,191,0.18)] hover:-translate-y-1 transition-all duration-400">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#167A55] font-semibold">03</span>
              <div className="h-8 w-8 rounded-full bg-white/80 border border-[#8DE8BF]/40 flex items-center justify-center text-[#167A55] shadow-xs group-hover:scale-108 transition-transform">
                <Smartphone className="h-3.5 w-3.5" />
              </div>
            </div>
            <h3 className="font-display font-semibold text-base text-[#17191C]">
              Across Devices
            </h3>
            <p className="text-xs text-[#6F7378] leading-relaxed">
              Memory is anchored to your account, not local browser cache. Switch from phone to laptop without missing a beat.
            </p>
          </div>
        </div>

        {/* Translucent Trust Strip */}
        <div className="mt-2 p-4 rounded-full glass-clear flex flex-wrap items-center justify-around gap-4 text-xs font-mono text-[#6F7378] border border-white/60">
          <div className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-[#167A55]" />
            <span>Private and encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-[#167A55]" />
            <span>Yours on every device</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-[#167A55]" />
            <span>Protected from tampering</span>
          </div>
        </div>
      </div>
    </section>
  );
}

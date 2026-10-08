"use client";

import React, { useState } from "react";
import { ShieldCheck, HardDrive, Cpu, Smartphone, Check } from "lucide-react";
import { IntelligenceMark } from "./IntelligenceMark";
import { MagneticButton } from "./MagneticButton";
import { useEnvironment } from "./EnvironmentContext";

export function EditorialPillars() {
  const [activeSplitTab, setActiveSplitTab] = useState<"without" | "with">("with");
  const { triggerRipple } = useEnvironment();

  const handleTabSwitch = (tab: "without" | "with", e: React.MouseEvent) => {
    setActiveSplitTab(tab);
    triggerRipple(e.clientX, e.clientY, "click", 260);
  };

  return (
    <section className="relative z-10 w-full max-w-5xl mx-auto px-6 py-28 flex flex-col gap-24">
      {/* Editorial Split Demonstration: Without Memory vs With Memory */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[rgba(23,25,28,0.08)] pb-5">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#167A55]">
              Interactive Proof
            </span>
            <h2 className="font-display font-semibold text-2xl sm:text-3xl text-[#17191C] tracking-tight">
              Without memory vs With memory
            </h2>
          </div>

          {/* Toggle pill */}
          <div className="inline-flex p-1 rounded-full bg-white/40 backdrop-blur-md border border-[rgba(23,25,28,0.08)] self-start sm:self-auto shadow-xs">
            <MagneticButton magneticRadius={50} magneticPull={0.2}>
              <button
                onClick={(e) => handleTabSwitch("without", e)}
                className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
                  activeSplitTab === "without"
                    ? "bg-[#FAF9F6] text-[#17191C] shadow-sm border border-[rgba(23,25,28,0.06)]"
                    : "text-[#6F7378] hover:text-[#17191C]"
                }`}
              >
                Without memory
              </button>
            </MagneticButton>
            <MagneticButton magneticRadius={50} magneticPull={0.2}>
              <button
                onClick={(e) => handleTabSwitch("with", e)}
                className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
                  activeSplitTab === "with"
                    ? "bg-[#167A55] text-[#F7F7F5] shadow-sm"
                    : "text-[#6F7378] hover:text-[#17191C]"
                }`}
              >
                With memory
              </button>
            </MagneticButton>
          </div>
        </div>

        {/* Split Comparison Frame */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card A: Without Memory */}
          <div
            className={`p-6 sm:p-7 rounded-[20px] backdrop-blur-[12px] bg-white/45 border transition-all duration-300 ${
              activeSplitTab === "without"
                ? "border-[rgba(23,25,28,0.18)] shadow-[0_20px_48px_-12px_rgba(23,25,28,0.08)] ring-1 ring-[rgba(23,25,28,0.06)]"
                : "border-[rgba(23,25,28,0.06)] opacity-60 hover:opacity-85"
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(23,25,28,0.06)]">
              <span className="font-mono text-xs text-[#6F7378]">Without memory</span>
              <span className="text-[10px] text-[#6F7378] font-mono">Standard Chatbot</span>
            </div>
            <div className="mt-5 flex flex-col gap-3">
              <div className="self-end rounded-[12px] bg-[#17191C] text-[#F7F7F5] px-3.5 py-2 text-xs shadow-xs">
                What do you know about me?
              </div>
              <div className="self-start rounded-[12px] bg-white/70 border border-[rgba(23,25,28,0.06)] text-[#17191C] p-3.5 text-xs leading-relaxed max-w-[90%] shadow-xs">
                I don't have access to past conversations. Could you remind me what you're working on?
              </div>
            </div>
          </div>

          {/* Card B: With Memory */}
          <div
            className={`p-6 sm:p-7 rounded-[20px] backdrop-blur-[12px] bg-white/55 border transition-all duration-300 ${
              activeSplitTab === "with"
                ? "border-[#8DE8BF] shadow-[0_24px_56px_-12px_rgba(66,201,138,0.15)] ring-1 ring-[#42C98A]/30"
                : "border-[rgba(23,25,28,0.06)] opacity-60 hover:opacity-85"
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(23,25,28,0.06)]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-[#167A55]">With memory</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#167A55]" />
              </div>
              <span className="text-[10px] font-mono text-[#167A55] bg-[#C8F5DE] px-2 py-0.5 rounded-full border border-[#8DE8BF]/50">
                Walrus Active
              </span>
            </div>
            <div className="mt-5 flex flex-col gap-3">
              <div className="self-end rounded-[12px] bg-[#17191C] text-[#F7F7F5] px-3.5 py-2 text-xs shadow-xs">
                What do you know about me?
              </div>
              <div className="self-start rounded-[12px] bg-white/80 border border-[rgba(22,122,85,0.22)] text-[#17191C] p-3.5 text-xs leading-relaxed max-w-[95%] flex flex-col gap-2 shadow-xs">
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

      {/* Editorial 3 Pillars Breakdown */}
      <div className="flex flex-col gap-10">
        <div className="border-b border-[rgba(23,25,28,0.08)] pb-4">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#167A55]">
            Core Requirements
          </span>
          <h2 className="font-display font-semibold text-2xl sm:text-3xl text-[#17191C] tracking-tight mt-1">
            How Tusk remembers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Pillar 1 */}
          <div className="group flex flex-col gap-3.5 p-6 rounded-[20px] backdrop-blur-[10px] bg-white/45 border border-[rgba(23,25,28,0.07)] shadow-xs hover:border-[rgba(22,122,85,0.25)] hover:shadow-[0_16px_36px_-10px_rgba(23,25,28,0.06)] hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#167A55] font-semibold">01</span>
              <div className="h-7 w-7 rounded-full bg-[#C8F5DE]/60 border border-[#8DE8BF]/40 flex items-center justify-center text-[#167A55] group-hover:scale-110 transition-transform">
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

          {/* Pillar 2 */}
          <div className="group flex flex-col gap-3.5 p-6 rounded-[20px] backdrop-blur-[10px] bg-white/45 border border-[rgba(23,25,28,0.07)] shadow-xs hover:border-[rgba(22,122,85,0.25)] hover:shadow-[0_16px_36px_-10px_rgba(23,25,28,0.06)] hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#167A55] font-semibold">02</span>
              <div className="h-7 w-7 rounded-full bg-[#C8F5DE]/60 border border-[#8DE8BF]/40 flex items-center justify-center text-[#167A55] group-hover:scale-110 transition-transform">
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

          {/* Pillar 3 */}
          <div className="group flex flex-col gap-3.5 p-6 rounded-[20px] backdrop-blur-[10px] bg-white/45 border border-[rgba(23,25,28,0.07)] shadow-xs hover:border-[rgba(22,122,85,0.25)] hover:shadow-[0_16px_36px_-10px_rgba(23,25,28,0.06)] hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#167A55] font-semibold">03</span>
              <div className="h-7 w-7 rounded-full bg-[#C8F5DE]/60 border border-[#8DE8BF]/40 flex items-center justify-center text-[#167A55] group-hover:scale-110 transition-transform">
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

        {/* Existing Trust Strip from blueprint */}
        <div className="mt-4 pt-6 border-t border-[rgba(23,25,28,0.07)] flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#6F7378]">
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

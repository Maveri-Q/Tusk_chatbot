"use client";

import React, { useState, useRef, useEffect } from "react";
import { ShieldCheck, Cpu, Smartphone, Check, Sparkles, SlidersHorizontal } from "lucide-react";
import { IntelligenceMark } from "./IntelligenceMark";
import { InteractiveSpecimenCard } from "./InteractiveSpecimenCard";
import { TuskSymbol } from "@/components/brand/TuskSymbol";

export function GlassSectionComparator() {
  const [activeSplitTab, setActiveSplitTab] = useState<"without" | "slider" | "with">("slider");
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100 percentage
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Mouse & Touch scrub handling for the interactive comparator
  const handlePointerMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const percentage = Math.max(5, Math.min(95, (relativeX / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handlePointerMove(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handlePointerMove(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMoveWindow = (e: MouseEvent) => {
      if (isDragging) {
        handlePointerMove(e.clientX);
      }
    };
    const handleTouchMoveWindow = (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX);
      }
    };

    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMoveWindow);
    window.addEventListener("touchend", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMoveWindow);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMoveWindow);
      window.removeEventListener("touchend", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMoveWindow);
    };
  }, [isDragging]);

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

          {/* Frosted Glass View Mode Pills */}
          <div className="inline-flex p-1.5 rounded-full glass-frosted self-start sm:self-auto shadow-xs border border-white/80">
            <button
              onClick={() => {
                setActiveSplitTab("without");
                setSliderPosition(95);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                activeSplitTab === "without"
                  ? "bg-white text-[#17191C] shadow-sm border border-white/90"
                  : "text-[#6F7378] hover:text-[#17191C]"
              }`}
            >
              Without memory
            </button>
            <button
              onClick={() => {
                setActiveSplitTab("slider");
                setSliderPosition(50);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
                activeSplitTab === "slider"
                  ? "bg-[#17191C] text-[#F7F7F5] shadow-sm"
                  : "text-[#6F7378] hover:text-[#17191C]"
              }`}
            >
              <SlidersHorizontal className="h-3 w-3 text-[#8DE8BF]" />
              <span>Interactive Slider</span>
            </button>
            <button
              onClick={() => {
                setActiveSplitTab("with");
                setSliderPosition(5);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                activeSplitTab === "with"
                  ? "bg-[#167A55] text-[#F7F7F5] shadow-sm"
                  : "text-[#6F7378] hover:text-[#17191C]"
              }`}
            >
              With memory
            </button>
          </div>
        </div>

        {/* 
          Interactive Optical Comparison Chamber
          A tactile interactive split-view that physically transitions between states 
        */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="relative w-full rounded-[28px] glass-plate border border-white/90 overflow-hidden shadow-[0_32px_70px_-20px_rgba(23,25,28,0.08),0_0_36px_-6px_rgba(141,232,191,0.15)] cursor-ew-resize select-none min-h-[340px]"
        >
          {/* Subsurface ambient illumination on the "With Memory" right side */}
          <div
            className="absolute top-0 right-0 w-3/4 h-full pointer-events-none transition-opacity duration-500"
            style={{
              background:
                "radial-gradient(circle at 80% 30%, rgba(66,201,138,0.18) 0%, rgba(200,245,222,0.12) 50%, transparent 80%)",
            }}
          />

          {/* Under-layer: "WITH MEMORY" (Full width beneath the clip) */}
          <div className="absolute inset-0 p-8 sm:p-10 flex flex-col justify-between bg-gradient-to-br from-white/70 via-[#C8F5DE]/15 to-transparent">
            <div className="flex items-center justify-between pb-4 border-b border-[#8DE8BF]/40">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-[#167A55]">
                  With memory
                </span>
                <span className="h-2 w-2 rounded-full bg-[#167A55] animate-pulse" />
              </div>
              <span className="text-[11px] font-mono text-[#167A55] bg-white/90 px-3 py-1 rounded-full border border-[#8DE8BF]/60 shadow-xs flex items-center gap-1.5">
                <TuskSymbol size={12} active={true} />
                <span>Walrus Active • Sealed</span>
              </span>
            </div>

            <div className="my-auto flex flex-col gap-4 max-w-xl ml-auto w-full">
              <div className="self-end rounded-[16px] bg-[#17191C]/92 text-[#F7F7F5] px-4 py-2.5 text-xs shadow-xs">
                What do you know about me?
              </div>
              <div className="self-start rounded-[18px] bg-white/85 backdrop-blur-md border border-[#8DE8BF]/50 text-[#17191C] p-4 text-xs leading-relaxed w-full flex flex-col gap-2.5 shadow-sm">
                <span className="text-[10px] text-[#167A55] font-mono flex items-center gap-1.5">
                  <IntelligenceMark size={12} active={true} />
                  <span>Remembered 2 things (92% relevance)</span>
                </span>
                <p className="font-normal text-[#17191C]">
                  You are an astrophysicist studying exoplanets, and you mentioned your go-to ice cream is pistachio.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-[#167A55]">
              <Sparkles className="h-3.5 w-3.5 text-[#42C98A]" />
              <span>Decentralized Walrus recall active across sessions and devices</span>
            </div>
          </div>

          {/* Over-layer: "WITHOUT MEMORY" (Clipped dynamically by sliderPosition) */}
          <div
            className="absolute inset-0 p-8 sm:p-10 flex flex-col justify-between bg-white/90 backdrop-blur-md border-r border-white/80 transition-[clip-path] duration-75"
            style={{
              clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
            }}
          >
            <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
              <span className="font-mono text-xs text-[#6F7378]">Without memory</span>
              <span className="text-[10px] text-[#6F7378] font-mono bg-black/[0.04] px-2.5 py-0.5 rounded-full">
                Standard Chatbot (Amnesic)
              </span>
            </div>

            <div className="my-auto flex flex-col gap-4 max-w-xl w-full">
              <div className="self-end rounded-[16px] bg-[#17191C]/90 text-[#F7F7F5] px-4 py-2.5 text-xs shadow-xs">
                What do you know about me?
              </div>
              <div className="self-start rounded-[18px] bg-black/[0.03] border border-black/[0.06] text-[#6F7378] p-4 text-xs leading-relaxed w-full shadow-xs">
                I don't have access to past conversations. Could you remind me what you're working on?
              </div>
            </div>

            <div className="text-[11px] font-mono text-[#6F7378]">
              No persistent memory state • Context lost upon refresh
            </div>
          </div>

          {/* Tactile Split Divider Handle (Follows sliderPosition) */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-white pointer-events-none z-20 shadow-[0_0_12px_rgba(23,25,28,0.2)]"
            style={{ left: `${sliderPosition}%` }}
          >
            {/* Center Scrubber Pill */}
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#8DE8BF]/80 shadow-[0_4px_16px_rgba(23,25,28,0.12)] flex items-center gap-1.5 text-[10px] font-mono text-[#17191C] whitespace-nowrap">
              <span className="text-[#167A55] font-bold">◀</span>
              <span className="font-semibold text-[9px] uppercase tracking-wider text-[#167A55]">
                Drag
              </span>
              <span className="text-[#167A55] font-bold">▶</span>
            </div>
          </div>
        </div>

        {/* Sub-label explaining the interactive comparison */}
        <div className="flex items-center justify-between text-xs text-[#6F7378] font-mono px-2">
          <span>← Standard amnesic state</span>
          <span className="text-center text-[11px] text-[#167A55]">
            Drag slider left or right to inspect the material transformation
          </span>
          <span>Tusk persistent recall →</span>
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

        {/* 3D Interactive Specimen Cards with Cursor Physics and Specular Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <InteractiveSpecimenCard
            number="01"
            title="Across Conversations"
            description="Clear your chat history anytime. Tusk stores facts in Walrus Memory, recalling them seamlessly when you return."
            icon={Cpu}
            delayIndex={0}
          />
          <InteractiveSpecimenCard
            number="02"
            title="Across Users (Isolated)"
            description="Strict per-user cryptographic namespaces. Alice never sees Bob’s memories, enforced server-side."
            icon={ShieldCheck}
            delayIndex={1}
          />
          <InteractiveSpecimenCard
            number="03"
            title="Across Devices"
            description="Memory is anchored to your account, not local browser cache. Switch from phone to laptop without missing a beat."
            icon={Smartphone}
            delayIndex={2}
          />
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

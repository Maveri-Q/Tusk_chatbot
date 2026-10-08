"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Shield, Database, Lock, Eye, AlertCircle, ArrowRight } from "lucide-react";
import { TuskSymbol } from "@/components/brand/TuskSymbol";

export function MemoryTransformationStage() {
  const [state, setState] = useState<"without" | "with">("without");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  // Scroll as a controller: As the user scrolls into the viewport, automatically demonstrate the transformation!
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Trigger transformation as user scrolls through the midpoint
      if (rect.top < windowHeight * 0.45 && rect.bottom > windowHeight * 0.2) {
        if (state !== "with") {
          setIsTransitioning(true);
          setTimeout(() => {
            setState("with");
            setIsTransitioning(false);
          }, 350);
        }
      } else if (rect.top > windowHeight * 0.65) {
        if (state !== "without") {
          setState("without");
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [state]);

  const toggleState = (target: "without" | "with") => {
    if (state === target) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setState(target);
      setIsTransitioning(false);
    }, 280);
  };

  return (
    <section
      id="transformation-experience"
      ref={sectionRef}
      className="relative z-10 w-full max-w-5xl mx-auto px-6 py-32 flex flex-col items-center select-none"
    >
      {/* 1. Header with Generous Space */}
      <div className="flex flex-col items-center text-center gap-3 mb-14 max-w-2xl">
        <span className="font-mono text-[11px] uppercase tracking-wider text-[#167A55] flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#167A55]" />
          Interactive Proof
        </span>
        <h2 className="font-display font-semibold text-3xl sm:text-5xl text-[#17191C] tracking-tight">
          Without memory vs With memory
        </h2>
        <p className="text-sm sm:text-base text-[#6F7378] leading-relaxed mt-1">
          Witness the physical transformation from amnesic loss to persistent, decentralized intelligence.
        </p>

        {/* Tactile State Controller Pill */}
        <div className="mt-4 inline-flex p-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/90 shadow-xs">
          <button
            onClick={() => toggleState("without")}
            className={`px-5 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
              state === "without"
                ? "bg-[#17191C] text-[#F7F7F5] shadow-sm"
                : "text-[#6F7378] hover:text-[#17191C]"
            }`}
          >
            01 Standard AI (Amnesia)
          </button>
          <button
            onClick={() => toggleState("with")}
            className={`px-5 py-2 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
              state === "with"
                ? "bg-[#167A55] text-[#F7F7F5] shadow-sm"
                : "text-[#6F7378] hover:text-[#17191C]"
            }`}
          >
            <TuskSymbol size={13} active={state === "with"} />
            <span>02 Tusk (Walrus Active)</span>
          </button>
        </div>
      </div>

      {/* 
        2. The Transformation Chamber
        Physically morphs between amnesic void and luminous Walrus recall
      */}
      <div
        className={`relative w-full max-w-2xl rounded-[36px] border transition-all duration-700 overflow-hidden shadow-[0_32px_80px_-24px_rgba(23,25,28,0.08)] ${
          state === "with"
            ? "bg-white/85 border-[#8DE8BF]/70 shadow-[0_32px_80px_-24px_rgba(66,201,138,0.2),0_0_40px_-8px_rgba(200,245,222,0.35)]"
            : "bg-white/55 border-white/80"
        }`}
      >
        {/* Dynamic Light Field in "With Memory" State */}
        <div
          className="absolute -top-16 -right-16 w-80 h-80 rounded-full blur-[60px] pointer-events-none transition-all duration-700"
          style={{
            background:
              "radial-gradient(circle, rgba(66,201,138,0.24) 0%, rgba(200,245,222,0.18) 50%, transparent 80%)",
            opacity: state === "with" ? 1 : 0,
            transform: state === "with" ? "scale(1)" : "scale(0.6)",
          }}
        />

        {/* Chamber Header Bar */}
        <div
          className={`px-8 py-5 border-b flex items-center justify-between transition-colors duration-500 ${
            state === "with"
              ? "border-[#8DE8BF]/40 bg-[#C8F5DE]/20"
              : "border-black/[0.06] bg-black/[0.02]"
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full transition-colors duration-500 ${
                state === "with" ? "bg-[#167A55] animate-pulse" : "bg-[#6F7378]"
              }`}
            />
            <span
              className={`font-mono text-xs font-semibold tracking-tight transition-colors duration-500 ${
                state === "with" ? "text-[#167A55]" : "text-[#6F7378]"
              }`}
            >
              {state === "with" ? "Tusk Memory Engine Active" : "Ephemeral Chat Session"}
            </span>
          </div>

          <span
            className={`font-mono text-[10px] px-3 py-1 rounded-full border transition-all duration-500 ${
              state === "with"
                ? "bg-white/90 text-[#167A55] border-[#8DE8BF]/60 shadow-xs"
                : "bg-black/[0.04] text-[#6F7378] border-black/[0.06]"
            }`}
          >
            {state === "with" ? "Walrus Mainnet • Sealed" : "Context Window Only"}
          </span>
        </div>

        {/* Dialogue Viewport */}
        <div className="p-8 sm:p-10 flex flex-col gap-6 min-h-[300px] justify-between relative">
          {/* User Message */}
          <div className="self-end max-w-[85%] rounded-[18px] bg-[#17191C] text-[#F7F7F5] px-5 py-3 text-xs leading-relaxed shadow-sm">
            What do you know about me?
          </div>

          {/* Morphing Assistant Response */}
          <div
            className={`self-start max-w-[95%] rounded-[24px] p-6 text-xs leading-relaxed flex flex-col gap-4 border transition-all duration-500 ${
              isTransitioning ? "opacity-30 scale-98" : "opacity-100 scale-100"
            } ${
              state === "with"
                ? "bg-white/95 border-[#8DE8BF]/50 shadow-sm"
                : "bg-white/50 border-black/[0.06] text-[#6F7378]"
            }`}
          >
            {/* Memory Activation Tags (Only in "With Memory") */}
            {state === "with" ? (
              <div className="flex flex-col gap-2.5 animate-in fade-in-50 duration-500">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-[#167A55] bg-[#C8F5DE]/60 border border-[#8DE8BF]/60 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                    <Sparkles className="h-3 w-3 text-[#167A55]" />
                    <span>Remembered 2 things (92% relevance)</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#6F7378] hidden sm:inline">
                    Decentralized Walrus Blob
                  </span>
                </div>

                <p className="font-normal text-[#17191C] text-sm leading-relaxed pt-1">
                  You are an astrophysicist studying exoplanets, and you mentioned your go-to ice cream is pistachio.
                </p>

                {/* Subsurface telemetry */}
                <div className="pt-3 border-t border-[#8DE8BF]/30 flex flex-wrap items-center justify-between text-[10px] font-mono text-[#167A55] gap-2">
                  <span>Namespace: personal:astronomy</span>
                  <span>SEAL Encrypted • Decentralized</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#6F7378]">
                  <AlertCircle className="h-3 w-3" />
                  <span>No long-term memory attached</span>
                </div>

                <p className="font-normal text-[#6F7378] text-sm leading-relaxed">
                  I don't have access to past conversations. Could you remind me what you're working on?
                </p>

                <div className="pt-3 border-t border-black/[0.05] text-[10px] font-mono text-[#6F7378]">
                  Lost upon browser refresh or session termination
                </div>
              </div>
            )}
          </div>

          {/* Bottom Narrative Caption */}
          <div className="flex items-center justify-between pt-4 border-t border-black/[0.05] text-xs font-mono text-[#6F7378]">
            <span>
              {state === "with"
                ? "✓ Context permanently secured across sessions"
                : "✕ Amnesic: Knowledge wiped after each chat"}
            </span>

            <button
              onClick={() => toggleState(state === "without" ? "with" : "without")}
              className="hover:text-[#167A55] flex items-center gap-1 underline text-[11px]"
            >
              <span>{state === "without" ? "Activate Walrus Memory →" : "See Amnesic Loss →"}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

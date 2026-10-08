"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LivingAtmosphere } from "@/components/landing/LivingAtmosphere";
import { InteractiveGrainField } from "@/components/landing/InteractiveGrainField";
import { TuskSymbol } from "@/components/brand/TuskSymbol";
import { TuskLoadingExperience } from "@/components/landing/TuskLoadingExperience";
import { InteractiveHeroSystem } from "@/components/landing/InteractiveHeroSystem";
import { MemoryTransformationStage } from "@/components/landing/MemoryTransformationStage";
import { SpatialPillarsExperience } from "@/components/landing/SpatialPillarsExperience";
import { ContinuousConvergence } from "@/components/landing/ContinuousConvergence";

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {/* 1. Cinematic Tusk System Loading Experience */}
      {isLoading && (
        <TuskLoadingExperience onComplete={() => setIsLoading(false)} />
      )}

      {/* 2. Living Digital Environment */}
      <main className="min-h-screen bg-[#F7F7F5] text-[#17191C] flex flex-col justify-between selection:bg-[#C8F5DE] selection:text-[#167A55] relative overflow-hidden">
        {/* Living Canvas Atmosphere: Physics-damped liquid light & cursor energy */}
        <LivingAtmosphere />

        {/* Interactive Tactile Grain Field: Reacts to cursor movement with dynamic swirl turbulence */}
        <InteractiveGrainField />

        {/* Minimal Navigation Bar */}
        <header className="relative h-24 px-6 sm:px-12 flex items-center justify-between z-30 max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-3 group cursor-pointer transition-transform duration-300 hover:scale-102">
            <TuskSymbol
              size={26}
              active={true}
              className="transition-transform duration-300 group-hover:rotate-6"
            />
            <span className="font-display font-bold text-[#17191C] text-xl tracking-tight">
              TUSK
            </span>
          </div>

          <Link href="/chat">
            <button className="group inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium text-[#17191C] bg-white/70 hover:bg-white backdrop-blur-md shadow-xs active:scale-95 transition-all duration-300 border border-white/80 hover:border-[#8DE8BF]/60">
              <span>Open Chat</span>
              <ArrowRight className="h-3 w-3 text-[#167A55] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </Link>
        </header>

        {/* STAGE 1: Alive Spatial Hero & Interactive Chatbot System */}
        <InteractiveHeroSystem />

        {/* SECTION TRANSITION 1: Optical Guide */}
        <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-[#8DE8BF]/50 to-transparent mx-auto z-10" />

        {/* STAGE 2: Memory Transformation Stage (Replacing Drag Slider) */}
        <MemoryTransformationStage />

        {/* SECTION TRANSITION 2: Optical Guide */}
        <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-[#8DE8BF]/50 to-transparent mx-auto z-10" />

        {/* STAGE 3: "How Tusk Remembers" as Live Interactive Demonstration */}
        <SpatialPillarsExperience />

        {/* STAGE 4: Continuous Convergence & Expansive Call to Action */}
        <ContinuousConvergence />
      </main>
    </>
  );
}

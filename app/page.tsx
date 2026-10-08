"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EnvironmentProvider } from "@/components/landing/EnvironmentContext";
import { IntelligenceField } from "@/components/landing/IntelligenceField";
import { InteractionLens } from "@/components/landing/InteractionLens";
import { IntelligenceMark } from "@/components/landing/IntelligenceMark";
import { InteractiveChatbotObject } from "@/components/landing/InteractiveChatbotObject";
import { EditorialPillars } from "@/components/landing/EditorialPillars";
import { MagneticButton } from "@/components/landing/MagneticButton";

function LandingContent() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-[#F7F7F5] text-[#17191C] flex flex-col justify-between selection:bg-[#C8F5DE] selection:text-[#167A55] relative overflow-hidden">
      {/* Background Depth Layer 1: Atmospheric Haze & Subtle Light Field */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-40 transition-transform duration-75"
        style={{
          transform: `translate3d(0, ${scrollY * 0.12}px, 0)`,
          background:
            "radial-gradient(circle 800px at 50% 35%, rgba(200,245,222,0.18) 0%, rgba(141,232,191,0.06) 45%, transparent 75%)",
        }}
      />

      {/* Background Depth Layer 2: Microscopic Canvas Intelligence Field with Physics Engine */}
      <IntelligenceField chatbotAnchorId="chatbot-hero-anchor" />

      {/* Secondary Gravitational Interaction Lens (Follows cursor smoothly) */}
      <InteractionLens />

      {/* Minimal Editorial Navigation */}
      <nav className="relative h-20 px-6 sm:px-12 flex items-center justify-between z-20 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <IntelligenceMark size={22} active={false} />
          <span className="font-display font-bold text-[#17191C] text-lg tracking-tight">
            TUSK
          </span>
        </div>

        <MagneticButton magneticRadius={70} magneticPull={0.25}>
          <Link href="/chat">
            <button className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium text-[#17191C] bg-white/70 backdrop-blur-md border border-[rgba(23,25,28,0.09)] hover:border-[rgba(22,122,85,0.3)] shadow-xs hover:shadow-sm active:scale-95 transition-all">
              <span>Open Chat</span>
              <ArrowRight className="h-3 w-3 text-[#167A55]" />
            </button>
          </Link>
        </MagneticButton>
      </nav>

      {/* Hero Section with Negative Space & Chatbot Center of Gravity */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-6 pt-12 pb-20 max-w-5xl mx-auto z-10 w-full">
        {/* Track Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/60 backdrop-blur-md border border-[rgba(23,25,28,0.08)] text-[11px] font-mono text-[#167A55] mb-8 shadow-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-[#167A55]" />
          <span>Built for Walrus Session 8: Chatbots That Remember</span>
        </div>

        {/* Headline (Existing Project Copy) */}
        <h1 className="font-display font-semibold text-4xl sm:text-6xl text-[#17191C] tracking-tight max-w-3xl leading-[1.12]">
          A chatbot that <span className="text-[#167A55]">actually remembers</span> you.
        </h1>

        {/* Subhead (Existing Project Copy) */}
        <p className="text-sm sm:text-base text-[#6F7378] mt-6 max-w-xl leading-relaxed">
          Encrypted with Seal. Stored on decentralized Walrus storage. Yours across conversations, accounts, and every device.
        </p>

        {/* Action Controls with Magnetic Physics */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 mb-16">
          <MagneticButton magneticRadius={90} magneticPull={0.28}>
            <Link href="/chat">
              <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#17191C] text-[#F7F7F5] text-xs font-semibold hover:bg-[#167A55] active:scale-95 shadow-sm hover:shadow-md transition-all">
                <span>Start chatting</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#8DE8BF]" />
              </button>
            </Link>
          </MagneticButton>

          <MagneticButton magneticRadius={70} magneticPull={0.22}>
            <a href="#how-it-works">
              <button className="px-5 py-2.5 rounded-full text-xs font-medium text-[#6F7378] hover:text-[#17191C] bg-white/40 hover:bg-white/70 backdrop-blur-sm border border-transparent hover:border-[rgba(23,25,28,0.06)] transition-all">
                See how it works
              </button>
            </a>
          </MagneticButton>
        </div>

        {/* Central Visual Focus: The Physical Chatbot Object */}
        <div className="w-full flex justify-center">
          <InteractiveChatbotObject />
        </div>
      </section>

      {/* Editorial Breakdown & Proof Sections */}
      <div id="how-it-works">
        <EditorialPillars />
      </div>

      {/* Minimal Footer */}
      <footer className="relative py-8 border-t border-[rgba(23,25,28,0.06)] text-center text-xs font-mono text-[#6F7378] z-10 max-w-5xl mx-auto w-full px-6">
        <p>Tusk • Powered by Mysten Labs Walrus Memory & Google Gemini</p>
      </footer>
    </main>
  );
}

export default function LandingPage() {
  return (
    <EnvironmentProvider>
      <LandingContent />
    </EnvironmentProvider>
  );
}

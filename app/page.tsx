"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GlassAtmosphere } from "@/components/landing/GlassAtmosphere";
import { IntelligenceMark } from "@/components/landing/IntelligenceMark";
import { TranslucentChatbotInstrument } from "@/components/landing/TranslucentChatbotInstrument";
import { GlassSectionComparator } from "@/components/landing/GlassSectionComparator";

export default function LandingPage() {
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
      {/* Immersive Translucent Atmosphere & Optical Depth Engine */}
      <GlassAtmosphere />

      {/* Frosted Architectural Navigation Bar */}
      <nav className="relative h-20 px-6 sm:px-12 flex items-center justify-between z-20 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <IntelligenceMark size={22} active={false} />
          <span className="font-display font-bold text-[#17191C] text-lg tracking-tight">
            TUSK
          </span>
        </div>

        <Link href="/chat">
          <button className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium text-[#17191C] glass-pill hover:bg-white/90 shadow-xs active:scale-95 transition-all">
            <span>Open Chat</span>
            <ArrowRight className="h-3 w-3 text-[#167A55]" />
          </button>
        </Link>
      </nav>

      {/* Hero Section: Chatbot Embedded Inside the Translucent System */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-6 pt-12 pb-20 max-w-5xl mx-auto z-10 w-full">
        {/* Track Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-pill text-[11px] font-mono text-[#167A55] mb-8 shadow-xs">
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

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 mt-8 mb-16">
          <Link href="/chat">
            <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#17191C] text-[#F7F7F5] text-xs font-semibold hover:bg-[#167A55] active:scale-95 shadow-sm hover:shadow-md transition-all">
              <span>Start chatting</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#8DE8BF]" />
            </button>
          </Link>

          <a href="#how-it-works">
            <button className="px-5 py-2.5 rounded-full text-xs font-medium text-[#6F7378] hover:text-[#17191C] glass-pill hover:bg-white/80 transition-all">
              See how it works
            </button>
          </a>
        </div>

        {/* Central Visual Focus: The Translucent Chatbot Instrument */}
        <div className="w-full flex justify-center">
          <TranslucentChatbotInstrument />
        </div>
      </section>

      {/* Continuous Section Transition into Glass Comparator & Core Requirements */}
      <div id="how-it-works">
        <GlassSectionComparator />
      </div>

      {/* Minimal Frosted Glass Footer */}
      <footer className="relative py-8 border-t border-white/60 text-center text-xs font-mono text-[#6F7378] z-10 max-w-5xl mx-auto w-full px-6">
        <p>Tusk • Powered by Mysten Labs Walrus Memory & Google Gemini</p>
      </footer>
    </main>
  );
}

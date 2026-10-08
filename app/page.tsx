"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { GlassAtmosphere } from "@/components/landing/GlassAtmosphere";
import { TranslucentChatbotInstrument } from "@/components/landing/TranslucentChatbotInstrument";
import { GlassSectionComparator } from "@/components/landing/GlassSectionComparator";
import { TuskSymbol } from "@/components/brand/TuskSymbol";
import { TuskLoadingExperience } from "@/components/landing/TuskLoadingExperience";

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <>
      {/* Cinematic Tusk System Loading Experience */}
      {isLoading && (
        <TuskLoadingExperience onComplete={() => setIsLoading(false)} />
      )}

      <main className="min-h-screen bg-[#F7F7F5] text-[#17191C] flex flex-col justify-between selection:bg-[#C8F5DE] selection:text-[#167A55] relative overflow-hidden">
        {/* Immersive Translucent Atmosphere & Optical Depth Engine */}
        <GlassAtmosphere />

        {/* Frosted Architectural Navigation Bar */}
        <nav className="relative h-20 px-6 sm:px-12 flex items-center justify-between z-20 max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-2.5 group cursor-pointer transition-transform duration-300 hover:scale-102">
            <TuskSymbol size={24} active={true} className="transition-transform duration-300 group-hover:rotate-6" />
            <span className="font-display font-bold text-[#17191C] text-lg tracking-tight">
              TUSK
            </span>
          </div>

          <Link href="/chat">
            <button className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium text-[#17191C] glass-pill hover:bg-white/95 shadow-xs active:scale-95 transition-all duration-300 border border-white/80 hover:border-[#8DE8BF]/60">
              <span>Open Chat</span>
              <ArrowRight className="h-3 w-3 text-[#167A55] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </Link>
        </nav>

        {/* Hero Section: Chatbot Embedded Inside the Translucent System */}
        <section className="relative flex-1 flex flex-col items-center justify-center text-center px-6 pt-12 pb-20 max-w-5xl mx-auto z-10 w-full">
          {/* Track Badge with Subtle Cursor Parallax */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-pill text-[11px] font-mono text-[#167A55] mb-8 shadow-xs border border-white/80 transition-transform duration-500"
            style={{
              transform: `translate3d(${mousePos.x * 4}px, ${mousePos.y * 4}px, 0)`,
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#167A55] animate-pulse" />
            <span>Built for Walrus Session 8: Chatbots That Remember</span>
          </div>

          {/* Headline (Existing Project Copy) with Optical Parallax */}
          <h1
            className="font-display font-semibold text-4xl sm:text-6xl text-[#17191C] tracking-tight max-w-3xl leading-[1.12] transition-transform duration-700 ease-out"
            style={{
              transform: `translate3d(${mousePos.x * 6}px, ${mousePos.y * 6}px, 0)`,
            }}
          >
            A chatbot that <span className="text-[#167A55]">actually remembers</span> you.
          </h1>

          {/* Subhead (Existing Project Copy) */}
          <p
            className="text-sm sm:text-base text-[#6F7378] mt-6 max-w-xl leading-relaxed transition-transform duration-700 ease-out"
            style={{
              transform: `translate3d(${mousePos.x * 3}px, ${mousePos.y * 3}px, 0)`,
            }}
          >
            Encrypted with Seal. Stored on decentralized Walrus storage. Yours across conversations, accounts, and every device.
          </p>

          {/* Action Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 mt-8 mb-16">
            <Link href="/chat">
              <button
                className="group relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#17191C] text-[#F7F7F5] text-xs font-semibold hover:bg-[#167A55] active:scale-95 shadow-sm hover:shadow-lg hover:shadow-[#167A55]/20 transition-all duration-300"
                style={{
                  transform: `translate3d(${mousePos.x * 2}px, ${mousePos.y * 2}px, 0)`,
                }}
              >
                <span>Start chatting</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#8DE8BF] group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>

            <a href="#how-it-works">
              <button
                className="px-5 py-2.5 rounded-full text-xs font-medium text-[#6F7378] hover:text-[#17191C] glass-pill hover:bg-white/85 transition-all duration-300 border border-white/70"
                style={{
                  transform: `translate3d(${-mousePos.x * 2}px, ${-mousePos.y * 2}px, 0)`,
                }}
              >
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

        {/* Minimal Frosted Glass Footer with Abstract Tusk Symbol */}
        <footer className="relative py-8 border-t border-white/60 text-center text-xs font-mono text-[#6F7378] z-10 max-w-5xl mx-auto w-full px-6 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-[#167A55]">
            <TuskSymbol size={16} variant="solid" active={false} />
            <span className="font-display font-semibold text-xs tracking-tight text-[#17191C]">TUSK</span>
          </div>
          <p>Tusk • Powered by Mysten Labs Walrus Memory & Google Gemini</p>
        </footer>
      </main>
    </>
  );
}

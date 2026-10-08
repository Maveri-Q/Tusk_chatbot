"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { TuskSymbol } from "@/components/brand/TuskSymbol";

export function ContinuousConvergence() {
  const [btnHover, setBtnHover] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  return (
    <section className="relative z-10 w-full max-w-4xl mx-auto px-6 py-32 flex flex-col items-center text-center select-none">
      {/* Light convergence guide connecting into this final stage */}
      <div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-[#8DE8BF]/60 to-transparent mb-12" />

      {/* Persistent Tusk Symbol: Center of the Living System */}
      <div className="relative mb-8 group cursor-pointer">
        <div className="absolute inset-0 rounded-full blur-xl bg-[#8DE8BF]/30 transition-all duration-500 group-hover:scale-150 group-hover:bg-[#42C98A]/40" />
        <TuskSymbol
          size={56}
          active={true}
          className="relative transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      {/* Spacious, Confident Call to Action */}
      <h2 className="font-display font-semibold text-3xl sm:text-5xl md:text-6xl text-[#17191C] tracking-tight max-w-2xl leading-[1.12]">
        Ready for an AI that <span className="text-[#167A55]">never forgets</span>?
      </h2>

      <p className="text-base sm:text-lg text-[#6F7378] mt-6 max-w-xl leading-relaxed">
        Experience decentralized memory powered by Mysten Labs Walrus. Your facts, encrypted, sealed, and always yours.
      </p>

      {/* Magnetic Primary CTA Button */}
      <div className="mt-10 mb-20">
        <Link href="/chat">
          <button
            ref={btnRef}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
            className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#17191C] text-[#F7F7F5] text-sm font-semibold hover:bg-[#167A55] active:scale-95 shadow-md hover:shadow-2xl hover:shadow-[#167A55]/25 transition-all duration-300"
          >
            <span>Start chatting with Tusk</span>
            <ArrowRight className="h-4 w-4 text-[#8DE8BF] group-hover:translate-x-1.5 transition-transform" />
          </button>
        </Link>
      </div>

      {/* Clean, Refined Footer */}
      <footer className="w-full pt-8 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#6F7378] gap-4">
        <div className="flex items-center gap-2 text-[#17191C]">
          <TuskSymbol size={16} active={false} />
          <span className="font-display font-bold tracking-tight">TUSK</span>
        </div>
        <p>Built for Walrus Session 8: Chatbots That Remember • Powered by Sui, Walrus & Google Gemini</p>
      </footer>
    </section>
  );
}

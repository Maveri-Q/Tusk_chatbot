"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IntelligenceField } from "@/components/landing/IntelligenceField";
import { IntelligenceMark } from "@/components/landing/IntelligenceMark";
import { InteractiveChatbotObject } from "@/components/landing/InteractiveChatbotObject";
import { EditorialPillars } from "@/components/landing/EditorialPillars";

export default function LandingPage() {
  const [isTyping, setIsTyping] = useState(false);
  const [sendSignalTime, setSendSignalTime] = useState(0);

  return (
    <main className="min-h-screen bg-[#F7F7F5] text-[#17191C] flex flex-col justify-between selection:bg-[#C8F5DE] selection:text-[#167A55] relative overflow-hidden">
      {/* Microscopic Particle Intelligence Field (Canvas with Spring Physics & Mouse Memory) */}
      <IntelligenceField
        chatbotAnchorId="chatbot-hero-anchor"
        isTyping={isTyping}
        sendSignalTimestamp={sendSignalTime}
      />

      {/* Minimal Editorial Navigation */}
      <nav className="relative h-20 px-6 sm:px-12 flex items-center justify-between z-20 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <IntelligenceMark size={22} active={false} />
          <span className="font-display font-bold text-[#17191C] text-lg tracking-tight">
            TUSK
          </span>
        </div>

        <Link href="/chat">
          <button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-[#17191C] bg-[#FAF9F6] border border-[rgba(23,25,28,0.09)] hover:border-[rgba(23,25,28,0.22)] shadow-sm hover:shadow active:scale-98 transition-all">
            <span>Open Chat</span>
            <ArrowRight className="h-3 w-3 text-[#167A55]" />
          </button>
        </Link>
      </nav>

      {/* Hero Section with Negative Space & Chatbot Center of Gravity */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-6 pt-12 pb-20 max-w-5xl mx-auto z-10 w-full">
        {/* Track Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF9F6] border border-[rgba(23,25,28,0.08)] text-[11px] font-mono text-[#167A55] mb-8 shadow-sm">
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

        {/* Action Controls (Existing Project Copy) */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 mb-16">
          <Link href="/chat">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#17191C] text-[#F7F7F5] text-xs font-semibold hover:bg-[#167A55] active:scale-98 shadow-sm hover:shadow transition-all">
              <span>Start chatting</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#8DE8BF]" />
            </button>
          </Link>
          <a href="#how-it-works">
            <button className="px-5 py-2.5 rounded-full text-xs font-medium text-[#6F7378] hover:text-[#17191C] transition-colors">
              See how it works
            </button>
          </a>
        </div>

        {/* Central Visual Focus: The Physical Chatbot Object */}
        <div className="w-full flex justify-center">
          <InteractiveChatbotObject
            onTypingStateChange={setIsTyping}
            onSendSignal={() => setSendSignalTime(Date.now())}
          />
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

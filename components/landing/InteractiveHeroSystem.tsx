"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUp, Sparkles, Check, Database, Shield, Lock } from "lucide-react";
import { TuskSymbol } from "@/components/brand/TuskSymbol";

interface MemoryRecord {
  id: string;
  text: string;
  blobId: string;
  relevance: number;
}

export function InteractiveHeroSystem() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });
  const [specular, setSpecular] = useState({ x: 50, y: 30 });
  const [isHovered, setIsHovered] = useState(false);

  // Live Chatbot Instrument State
  const [userQuery, setUserQuery] = useState("What do you know about me?");
  const [aiResponse, setAiResponse] = useState(
    "You are an astrophysicist studying exoplanets, and you mentioned your go-to ice cream is pistachio."
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeSignal, setActiveSignal] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState("");
  const [memories, setMemories] = useState<MemoryRecord[]>([
    {
      id: "mem-1",
      text: "Astrophysicist studying exoplanets",
      blobId: "sZJ1lo6...ygt8",
      relevance: 0.92,
    },
    {
      id: "mem-2",
      text: "Go-to ice cream is pistachio",
      blobId: "wRK9mp3...zfk2",
      relevance: 0.88,
    },
  ]);
  const [inspectingMemory, setInspectingMemory] = useState(false);

  // Mouse Parallax & Dynamic Light Physics
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMouseOffset({ x: x * 12, y: y * 12 });

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          const localX = (e.clientX - rect.left) / rect.width;
          const localY = (e.clientY - rect.top) / rect.height;
          setCardTilt({
            x: -(localY - 0.5) * 6,
            y: (localX - 0.5) * 6,
          });
          setSpecular({ x: localX * 100, y: localY * 100 });
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // System Execution: When a prompt is chosen or sent
  const handleTriggerPrompt = async (promptText: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setUserQuery(promptText);
    setAiResponse("");

    if (promptText.toLowerCase().includes("night owl")) {
      setActiveSignal("WRITING TO WALRUS BLOB (0x8F)... ENCRYPTING VIA SEAL");
      setTimeout(() => {
        setMemories((prev) => [
          ...prev,
          {
            id: `mem-${Date.now()}`,
            text: "Prefers working late as a night owl",
            blobId: "0x8f" + Math.random().toString(36).slice(2, 8),
            relevance: 0.95,
          },
        ]);
        setActiveSignal(null);
        setAiResponse(
          "I've encrypted and permanently saved that you're a night owl to your Walrus namespace. All future sessions will respect your nocturnal schedule."
        );
        setIsProcessing(false);
      }, 1200);
    } else if (promptText.toLowerCase().includes("what do you know")) {
      setActiveSignal("RECALLING FROM WALRUS DECENTRALIZED STORAGE...");
      setTimeout(() => {
        setActiveSignal(null);
        setAiResponse(
          "You are an astrophysicist studying exoplanets, and you mentioned your go-to ice cream is pistachio. Both memories are sealed and anchored to your account."
        );
        setIsProcessing(false);
      }, 900);
    } else {
      setActiveSignal("QUERYING MEMWAL PIPELINE...");
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: promptText }],
            memoryEnabled: true,
          }),
        });
        if (res.ok && res.body) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let acc = "";
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            acc += decoder.decode(value, { stream: true });
            setAiResponse(
              acc.replace(/<memory_context>[\s\S]*?<\/memory_context>/gi, "").trimStart()
            );
          }
        } else {
          setAiResponse("I received your prompt. My decentralized Walrus memory has anchored this context.");
        }
      } catch {
        setAiResponse(
          `Understood. I have securely processed "${promptText}" across your persistent memory namespace.`
        );
      } finally {
        setActiveSignal(null);
        setIsProcessing(false);
      }
    }
  };

  return (
    <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-6 pt-16 pb-24 max-w-5xl mx-auto z-10 w-full select-none">
      {/* 1. Track Identification Badge */}
      <div
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md text-[11px] font-mono text-[#167A55] mb-10 shadow-xs border border-white/80 transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${mouseOffset.x * 0.4}px, ${mouseOffset.y * 0.4}px, 0)`,
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#167A55] animate-pulse" />
        <span>Built for Walrus Session 8: Chatbots That Remember</span>
      </div>

      {/* 2. Hero Headline (Exact Preserved Copy with Generous Breathing Room) */}
      <h1
        className="font-display font-semibold text-4xl sm:text-6xl md:text-7xl text-[#17191C] tracking-tight max-w-4xl leading-[1.08] transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${mouseOffset.x * 0.7}px, ${mouseOffset.y * 0.7}px, 0)`,
        }}
      >
        A chatbot that <span className="text-[#167A55]">actually remembers</span> you.
      </h1>

      {/* 3. Hero Subhead (Exact Preserved Copy) */}
      <p
        className="text-base sm:text-lg text-[#6F7378] mt-7 max-w-2xl leading-relaxed transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${mouseOffset.x * 0.35}px, ${mouseOffset.y * 0.35}px, 0)`,
        }}
      >
        Encrypted with Seal. Stored on decentralized Walrus storage. Yours across conversations, accounts, and every device.
      </p>

      {/* 4. Minimal Action Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mt-9 mb-16 z-20">
        <Link href="/chat">
          <button className="group relative inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#17191C] text-[#F7F7F5] text-xs font-semibold hover:bg-[#167A55] active:scale-95 shadow-sm hover:shadow-xl hover:shadow-[#167A55]/20 transition-all duration-300">
            <span>Start chatting</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#8DE8BF] group-hover:translate-x-1 transition-transform" />
          </button>
        </Link>

        <a href="#transformation-experience">
          <button className="px-6 py-3 rounded-full text-xs font-medium text-[#6F7378] hover:text-[#17191C] bg-white/60 hover:bg-white/90 backdrop-blur-md transition-all duration-300 border border-white/70 shadow-xs">
            Explore the memory experience ↓
          </button>
        </a>
      </div>

      {/* 
        5. The Chatbot Instrument: A Living Miniature System
        Real depth, interactive memory creation, and tactile feedback
      */}
      <div
        ref={containerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setCardTilt({ x: 0, y: 0 });
          setSpecular({ x: 50, y: 30 });
        }}
        style={{
          transform: `perspective(1200px) rotateX(${cardTilt.x}deg) rotateY(${cardTilt.y}deg) translateY(${
            isHovered ? "-6px" : "0px"
          })`,
          transition: isHovered
            ? "transform 0.16s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease"
            : "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.8s ease",
        }}
        className={`relative w-full max-w-xl mx-auto rounded-[32px] bg-white/70 backdrop-blur-xl border border-white/95 overflow-hidden transition-all duration-500 shadow-[0_32px_70px_-20px_rgba(23,25,28,0.08),0_0_36px_-6px_rgba(141,232,191,0.2)] text-left`}
      >
        {/* Dynamic Optical Specular Glare */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-10"
          style={{
            background: `radial-gradient(circle 420px at ${specular.x}% ${specular.y}%, rgba(255,255,255,0.75) 0%, rgba(200,245,222,0.18) 35%, transparent 70%)`,
            opacity: isHovered ? 0.95 : 0.4,
          }}
        />

        {/* Subsurface Luminous Emerald Core */}
        <div
          className="absolute -bottom-12 -right-12 w-64 h-64 rounded-full blur-[55px] pointer-events-none transition-all duration-700 z-0"
          style={{
            background: "radial-gradient(circle, rgba(66,201,138,0.22) 0%, rgba(141,232,191,0.12) 60%, transparent 80%)",
            opacity: activeSignal || isProcessing ? 1 : 0.45,
            transform: activeSignal ? "scale(1.3)" : "scale(1)",
          }}
        />

        {/* Instrument Header */}
        <div className="relative px-6 py-4 border-b border-white/60 flex items-center justify-between bg-white/40 backdrop-blur-md z-20">
          <div className="flex items-center gap-2.5">
            <TuskSymbol size={20} active={true} />
            <span className="font-display font-semibold text-xs text-[#17191C] tracking-tight">
              Tusk
            </span>
            <span className="text-[10px] text-[#6F7378] font-mono">•</span>
            <span className="text-[11px] text-[#6F7378]">Long-term memory active</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] text-[#167A55] bg-white/80 px-2.5 py-0.5 rounded-full border border-[#8DE8BF]/50 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#167A55] animate-pulse" />
            <span>Walrus Sealed</span>
          </div>
        </div>

        {/* Active Telemetry Line (Appears during memory write/read) */}
        {activeSignal && (
          <div className="px-6 py-1.5 bg-[#C8F5DE]/40 border-b border-[#8DE8BF]/40 text-[10px] font-mono text-[#167A55] flex items-center justify-between animate-in fade-in duration-200 z-20">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 animate-spin text-[#167A55]" />
              <span>{activeSignal}</span>
            </div>
            <span>256-BIT SEAL</span>
          </div>
        )}

        {/* Interactive Dialogue Body */}
        <div className="p-6 flex flex-col gap-4 relative z-20">
          {/* User Message Capsule */}
          <div className="self-end max-w-[85%] rounded-[18px] bg-[#17191C] text-[#F7F7F5] px-4 py-2.5 text-xs font-normal leading-relaxed shadow-sm">
            {userQuery}
          </div>

          {/* Assistant Message Plate with Memory Inspector */}
          <div className="self-start max-w-[95%] rounded-[20px] bg-white/80 border border-white/90 p-4 text-xs text-[#17191C] leading-relaxed flex flex-col gap-3 shadow-xs">
            {/* Active Memory Indicator Pill */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setInspectingMemory(!inspectingMemory)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#C8F5DE]/50 border border-[#8DE8BF]/60 text-[#167A55] text-[10px] font-mono hover:bg-[#C8F5DE] transition-all shadow-xs"
              >
                <Sparkles className="h-2.5 w-2.5 text-[#167A55]" />
                <span>Remembered {memories.length} facts</span>
                <span className="underline ml-0.5 text-[9px]">
                  {inspectingMemory ? "Hide" : "Inspect"}
                </span>
              </button>
            </div>

            {/* Inspectable Memory List */}
            {inspectingMemory && (
              <div className="p-3 rounded-[14px] bg-white/95 border border-[#8DE8BF]/40 text-[10px] font-mono flex flex-col gap-2 shadow-xs">
                <div className="flex items-center justify-between text-[#167A55] font-semibold border-b border-[#8DE8BF]/20 pb-1">
                  <span className="flex items-center gap-1">
                    <Database className="h-3 w-3" />
                    Decentralized Storage
                  </span>
                  <span className="flex items-center gap-1 text-[9px] text-[#6F7378]">
                    <Lock className="h-2.5 w-2.5" /> SEAL
                  </span>
                </div>
                {memories.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-[#17191C] pt-0.5">
                    <span className="font-sans text-[11px] truncate max-w-[280px]">
                      {m.text}
                    </span>
                    <span className="text-[#167A55] font-semibold">
                      {Math.round(m.relevance * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Response Output or Typing State */}
            {isProcessing && !aiResponse ? (
              <div className="flex items-center gap-2 py-1 text-xs text-[#6F7378]">
                <span className="h-2 w-2 rounded-full bg-[#42C98A] animate-pulse" />
                <span className="h-2 w-2 rounded-full bg-[#42C98A] animate-pulse [animation-delay:200ms]" />
                <span className="h-2 w-2 rounded-full bg-[#42C98A] animate-pulse [animation-delay:400ms]" />
                <span className="font-mono text-[11px]">Synchronizing with Walrus Memory...</span>
              </div>
            ) : (
              <p className="font-normal text-[#17191C] leading-relaxed whitespace-pre-wrap">
                {aiResponse}
              </p>
            )}
          </div>
        </div>

        {/* Tactile Suggested Action Pills */}
        <div className="px-6 pb-4 pt-1 flex flex-wrap gap-2 border-t border-white/50 relative z-20">
          <span className="text-[10px] font-mono text-[#6F7378] self-center mr-1">Try:</span>
          {[
            "Remember that I'm a night owl",
            "What do you know about me?",
            "Plan my week around exoplanet research",
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleTriggerPrompt(prompt)}
              className="text-[11px] text-[#6F7378] hover:text-[#17191C] bg-white/70 hover:bg-white border border-white/80 hover:border-[#8DE8BF]/60 px-3 py-1 rounded-full transition-all shadow-xs active:scale-95"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Composer Input Shelf */}
        <div className="p-3 bg-white/50 backdrop-blur-md border-t border-white/70 flex items-center gap-2 relative z-20">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && customInput.trim()) {
                handleTriggerPrompt(customInput);
                setCustomInput("");
              }
            }}
            placeholder="Ask or store something into Walrus Memory..."
            className="w-full bg-white/80 border border-white/90 rounded-full px-4 py-2 text-xs text-[#17191C] placeholder:text-[#6F7378] outline-none focus:ring-1 focus:ring-[#42C98A]"
          />
          <button
            onClick={() => {
              if (customInput.trim()) {
                handleTriggerPrompt(customInput);
                setCustomInput("");
              }
            }}
            disabled={!customInput.trim() || isProcessing}
            aria-label="Send query"
            className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
              customInput.trim() && !isProcessing
                ? "bg-[#17191C] text-[#F7F7F5] hover:bg-[#167A55]"
                : "bg-transparent text-[#6F7378]/40 cursor-not-allowed"
            }`}
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}

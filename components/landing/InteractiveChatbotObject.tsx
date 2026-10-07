"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowUp, ArrowRight, ShieldCheck, Check, Copy } from "lucide-react";
import { IntelligenceMark } from "./IntelligenceMark";
import { Switch } from "@/components/ui/switch";

interface InteractiveChatbotObjectProps {
  onTypingStateChange?: (typing: boolean) => void;
  onSendSignal?: () => void;
}

export function InteractiveChatbotObject({
  onTypingStateChange,
  onSendSignal,
}: InteractiveChatbotObjectProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [copiedBlob, setCopiedBlob] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Existing prompt & response from the blueprint
  const [chatState, setChatState] = useState<"initial" | "answered">("initial");

  // Subtle 3D tilt tracking with spring damping
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Maximum tilt: ~8 degrees
    const tiltX = -(mouseY / (rect.height / 2)) * 7.5;
    const tiltY = (mouseX / (rect.width / 2)) * 7.5;

    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const handleInputChange = (val: string) => {
    setInputValue(val);
    if (onTypingStateChange) {
      onTypingStateChange(val.length > 0);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim() || isSending) return;
    setIsSending(true);
    if (onSendSignal) onSendSignal();

    setTimeout(() => {
      setChatState("answered");
      setIsSending(false);
      setInputValue("");
      if (onTypingStateChange) onTypingStateChange(false);
    }, 450);
  };

  const copyBlob = () => {
    navigator.clipboard.writeText("sZJ1lo6-0HODV5C4tLxWWRXtzb5xNX50c18R62pygt8");
    setCopiedBlob(true);
    setTimeout(() => setCopiedBlob(false), 2000);
  };

  return (
    <div
      id="chatbot-hero-anchor"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${
          isHovered ? "-4px" : "0px"
        })`,
        transition: isHovered
          ? "transform 0.14s ease-out, box-shadow 0.3s ease-out"
          : "transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.6s ease-out",
      }}
      className={`relative w-full max-w-xl mx-auto rounded-[20px] bg-[#FAF9F6] border border-[rgba(23,25,28,0.08)] shadow-[0_24px_56px_-16px_rgba(23,25,28,0.08),0_2px_8px_-1px_rgba(23,25,28,0.04)] overflow-hidden transition-all duration-300 z-10 ${
        isHovered ? "border-[rgba(22,122,85,0.22)] shadow-[0_32px_68px_-18px_rgba(23,25,28,0.12)]" : ""
      }`}
    >
      {/* Fine interior surface grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Top Mineral Header */}
      <div className="relative px-5 py-3.5 border-b border-[rgba(23,25,28,0.06)] flex items-center justify-between bg-[#FDFCFA]/90">
        <div className="flex items-center gap-2.5">
          <IntelligenceMark active={isHovered || isSending} size={18} />
          <span className="font-display font-semibold text-xs tracking-tight text-[#17191C]">
            Tusk
          </span>
          <span className="text-[10px] text-[#6F7378] font-mono">•</span>
          <span className="text-[11px] text-[#6F7378]">
            Long-term memory active
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono text-[#167A55] bg-[#C8F5DE]/50 border border-[#8DE8BF]/40">
            <span className="h-1.5 w-1.5 rounded-full bg-[#167A55]" />
            Walrus Mainnet
          </span>
        </div>
      </div>

      {/* Interactive Dialogue Demonstration */}
      <div className="relative p-5 sm:p-6 flex flex-col gap-4 min-h-[260px] justify-between">
        <div className="flex flex-col gap-3.5">
          {/* User message */}
          <div className="self-end max-w-[85%] rounded-[12px] bg-[#17191C] text-[#F7F7F5] px-3.5 py-2.5 text-xs font-normal leading-relaxed shadow-sm">
            What do you know about me?
          </div>

          {/* Assistant message with authentic Walrus memory context */}
          <div className="self-start max-w-[92%] rounded-[12px] bg-[#F0EFEA] border border-[rgba(23,25,28,0.06)] p-3.5 text-xs text-[#17191C] leading-relaxed flex flex-col gap-2.5">
            {/* Recalled memory drawer */}
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#C8F5DE]/70 border border-[#8DE8BF]/50 text-[#167A55] text-[10px] font-mono hover:bg-[#C8F5DE] transition-colors w-fit"
              >
                <IntelligenceMark size={11} active={false} />
                <span>Remembered 2 things</span>
                <span className="text-[9px] underline">
                  {showDetails ? "Hide Details" : "Details"}
                </span>
              </button>

              {showDetails && (
                <div className="mt-1 p-2 rounded bg-[#FAF9F6] border border-[rgba(23,25,28,0.06)] text-[10px] flex flex-col gap-1.5 font-mono animate-in fade-in-0 duration-150">
                  <div className="flex items-center justify-between text-[#6F7378]">
                    <span>The user is an astrophysicist studying exoplanets.</span>
                    <span className="text-[#167A55] font-semibold">92%</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-[#6F7378] pt-1 border-t border-[rgba(23,25,28,0.05)]">
                    <span className="truncate max-w-[200px]">Blob: sZJ1lo6...ygt8</span>
                    <button
                      onClick={copyBlob}
                      className="hover:text-[#17191C] flex items-center gap-1"
                    >
                      {copiedBlob ? <Check className="h-2.5 w-2.5 text-[#167A55]" /> : <Copy className="h-2.5 w-2.5" />}
                      <span>{copiedBlob ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <p className="font-normal text-[#17191C]">
              You are an astrophysicist studying exoplanets, and you mentioned your go-to ice cream is pistachio.
            </p>
          </div>
        </div>

        {/* Existing Starter Prompt Chips */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[rgba(23,25,28,0.05)]">
          {[
            "Remember that I'm a night owl",
            "What do you know about me?",
            "Plan my week",
            "Help me write a message",
          ].map((promptText) => (
            <button
              key={promptText}
              onClick={() => handleInputChange(promptText)}
              className="text-[11px] text-[#6F7378] hover:text-[#17191C] bg-[#F5F4EE] hover:bg-[#EAE8E0] px-2.5 py-1 rounded-full border border-[rgba(23,25,28,0.06)] transition-all text-left"
            >
              {promptText}
            </button>
          ))}
        </div>
      </div>

      {/* Composer Input Area */}
      <div className="relative p-3 bg-[#F2F1ED] border-t border-[rgba(23,25,28,0.07)] flex flex-col gap-2">
        <div className="relative flex items-center bg-[#FAF9F6] border border-[rgba(23,25,28,0.09)] rounded-[12px] px-3.5 py-2 focus-within:border-[#42C98A] focus-within:ring-1 focus-within:ring-[#42C98A]/30 transition-all">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask Tusk anything, or share something to remember..."
            className="w-full bg-transparent text-xs text-[#17191C] placeholder:text-[#6F7378] outline-none"
          />

          {/* Geometric Send Control */}
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            aria-label="Send signal"
            className={`ml-2 h-7 w-7 rounded-[8px] flex items-center justify-center transition-all ${
              inputValue.trim()
                ? "bg-[#17191C] text-[#F7F7F5] hover:bg-[#167A55] active:scale-95"
                : "bg-transparent text-[#6F7378]/40 cursor-not-allowed"
            }`}
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Quiet Bottom Controls */}
        <div className="flex items-center justify-between px-1 text-[11px] text-[#6F7378]">
          <div className="flex items-center gap-2">
            <Switch
              id="hero-memory-toggle"
              checked={memoryEnabled}
              onCheckedChange={setMemoryEnabled}
              className="scale-75 origin-left"
            />
            <label
              htmlFor="hero-memory-toggle"
              className="cursor-pointer text-[10px] font-mono tracking-tight text-[#17191C]"
            >
              Remember me
            </label>
          </div>

          <Link
            href="/chat"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#167A55] hover:underline"
          >
            <span>Open Full Workspace</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowUp, ArrowRight, Check, Copy } from "lucide-react";
import { IntelligenceMark } from "./IntelligenceMark";
import { Switch } from "@/components/ui/switch";
import { useEnvironment } from "./EnvironmentContext";
import { MagneticButton } from "./MagneticButton";

export function InteractiveChatbotObject() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [specular, setSpecular] = useState({ x: 50, y: 30 });
  const [edgeAngle, setEdgeAngle] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [copiedBlob, setCopiedBlob] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [chatState, setChatState] = useState<"initial" | "answered">("initial");

  const {
    setCursorMode,
    triggerRipple,
    updateGlassBounds,
    setIsTyping,
    setInputFocused,
  } = useEnvironment();

  // Sync glass bounding box to environment for canvas refraction
  const syncBounds = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    updateGlassBounds({
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
      tiltX: tilt.x,
      tiltY: tilt.y,
      isHovered,
    });
  }, [tilt, isHovered, updateGlassBounds]);

  useEffect(() => {
    syncBounds();
    window.addEventListener("scroll", syncBounds, { passive: true });
    window.addEventListener("resize", syncBounds);
    return () => {
      window.removeEventListener("scroll", syncBounds);
      window.removeEventListener("resize", syncBounds);
    };
  }, [syncBounds]);

  // Dynamic 3D tilt, specular reflection, and edge lighting tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Maximum tilt: ~9.5 degrees
    const tiltX = -(mouseY / (rect.height / 2)) * 9.5;
    const tiltY = (mouseX / (rect.width / 2)) * 9.5;

    // Specular light position in percentage
    const specX = ((e.clientX - rect.left) / rect.width) * 100;
    const specY = ((e.clientY - rect.top) / rect.height) * 100;

    // Angle of cursor from center for dynamic edge lighting
    const angleDeg = (Math.atan2(mouseY, mouseX) * 180) / Math.PI;

    setTilt({ x: tiltX, y: tiltY });
    setSpecular({ x: specX, y: specY });
    setEdgeAngle(angleDeg);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setCursorMode("glass");
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setSpecular({ x: 50, y: 30 });
    setCursorMode("default");
    setIsTyping(false);
    setInputFocused(false);
  };

  const handleInputChange = (val: string) => {
    setInputValue(val);
    setIsTyping(val.length > 0);
  };

  const handleSend = () => {
    if (!inputValue.trim() || isSending) return;
    setIsSending(true);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // Trigger compressive outward shockwave from send origin
      triggerRipple(rect.left + rect.width / 2, rect.top + rect.height * 0.85, "send", 520);
    }

    setTimeout(() => {
      setChatState("answered");
      setIsSending(false);
      setInputValue("");
      setIsTyping(false);
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
        transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${
          isHovered ? "-6px" : "0px"
        })`,
        transition: isHovered
          ? "transform 0.12s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease-out"
          : "transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.65s ease-out",
      }}
      className={`relative w-full max-w-xl mx-auto rounded-[22px] backdrop-blur-[14px] bg-[#FAF9F6]/60 border border-[rgba(23,25,28,0.09)] shadow-[0_28px_64px_-16px_rgba(23,25,28,0.08),0_2px_12px_-1px_rgba(23,25,28,0.03)] overflow-hidden transition-all duration-300 z-10 ${
        isHovered
          ? "border-[rgba(22,122,85,0.28)] shadow-[0_38px_84px_-20px_rgba(23,25,28,0.12),0_0_36px_-6px_rgba(66,201,138,0.15)]"
          : ""
      }`}
    >
      {/* Dynamic Specular Light Reflection Layer */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-[1]"
        style={{
          background: `radial-gradient(circle 380px at ${specular.x}% ${specular.y}%, rgba(255,255,255,0.75) 0%, rgba(200,245,222,0.15) 30%, transparent 70%)`,
          opacity: isHovered ? 0.9 : 0.35,
        }}
      />

      {/* Dynamic Directional Edge Lighting Ring */}
      <div
        className="absolute inset-0 rounded-[22px] pointer-events-none transition-opacity duration-300 z-[2]"
        style={{
          padding: "1px",
          background: `conic-gradient(from ${edgeAngle}deg at 50% 50%, rgba(66,201,138,0.4) 0deg, rgba(141,232,191,0.15) 60deg, transparent 120deg, transparent 240deg, rgba(66,201,138,0.4) 360deg)`,
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          opacity: isHovered ? 1 : 0.35,
        }}
      />

      {/* Subtle Internal Mineral Noise Layer */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-multiply z-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Top Mineral Header */}
      <div className="relative px-5 py-3.5 border-b border-[rgba(23,25,28,0.06)] flex items-center justify-between bg-white/40 backdrop-blur-sm z-[3]">
        <div className="flex items-center gap-2.5">
          <IntelligenceMark active={isHovered || isSending} isTyping={inputValue.length > 0} size={18} />
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
      <div className="relative p-5 sm:p-6 flex flex-col gap-4 min-h-[260px] justify-between z-[3]">
        <div className="flex flex-col gap-3.5">
          {/* User message */}
          <div className="self-end max-w-[85%] rounded-[14px] bg-[#17191C]/95 text-[#F7F7F5] px-4 py-2.5 text-xs font-normal leading-relaxed shadow-sm">
            What do you know about me?
          </div>

          {/* Assistant message with authentic Walrus memory context */}
          <div className="self-start max-w-[92%] rounded-[14px] bg-white/65 backdrop-blur-md border border-[rgba(23,25,28,0.06)] p-3.5 text-xs text-[#17191C] leading-relaxed flex flex-col gap-2.5 shadow-sm">
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
                <div className="mt-1 p-2 rounded-[10px] bg-white/80 border border-[rgba(23,25,28,0.06)] text-[10px] flex flex-col gap-1.5 font-mono animate-in fade-in-0 duration-150">
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

        {/* Starter Prompt Chips */}
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
              className="text-[11px] text-[#6F7378] hover:text-[#17191C] bg-white/50 hover:bg-white/80 px-2.5 py-1 rounded-full border border-[rgba(23,25,28,0.06)] transition-all text-left shadow-xs hover:border-[rgba(23,25,28,0.14)]"
            >
              {promptText}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Inner Glass Composer Shelf */}
      <div className="relative p-3 bg-white/35 backdrop-blur-md border-t border-[rgba(23,25,28,0.07)] flex flex-col gap-2 z-[3]">
        <div className="relative flex items-center bg-white/80 border border-[rgba(23,25,28,0.09)] rounded-[14px] px-3.5 py-2 focus-within:border-[#42C98A] focus-within:ring-2 focus-within:ring-[#42C98A]/25 transition-all shadow-xs">
          <input
            type="text"
            value={inputValue}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask Tusk anything, or share something to remember..."
            className="w-full bg-transparent text-xs text-[#17191C] placeholder:text-[#6F7378] outline-none"
          />

          {/* Magnetic Send Control */}
          <MagneticButton
            cursorMode="send"
            magneticRadius={50}
            magneticPull={0.35}
            onClick={handleSend}
            className="ml-2"
          >
            <button
              disabled={!inputValue.trim() || isSending}
              aria-label="Send signal"
              className={`h-7 w-7 rounded-[8px] flex items-center justify-center transition-all ${
                inputValue.trim()
                  ? "bg-[#17191C] text-[#F7F7F5] hover:bg-[#167A55] active:scale-95 shadow-sm"
                  : "bg-transparent text-[#6F7378]/40 cursor-not-allowed"
              }`}
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </MagneticButton>
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

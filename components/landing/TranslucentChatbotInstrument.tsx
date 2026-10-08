"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowUp, ArrowRight, Check, Copy, Sparkles, Database, Shield } from "lucide-react";
import { IntelligenceMark } from "./IntelligenceMark";
import { TuskSymbol } from "@/components/brand/TuskSymbol";
import { Switch } from "@/components/ui/switch";

interface RecalledItem {
  text: string;
  relevance: number;
  blob_id: string;
}

export function TranslucentChatbotInstrument() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [specular, setSpecular] = useState({ x: 50, y: 25 });
  const [isHovered, setIsHovered] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [copiedBlob, setCopiedBlob] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [memoryPulse, setMemoryPulse] = useState(false);

  // Live dialogue state
  const [userMessage, setUserMessage] = useState("What do you know about me?");
  const [assistantMessage, setAssistantMessage] = useState(
    "You are an astrophysicist studying exoplanets, and you mentioned your go-to ice cream is pistachio."
  );
  const [recalledMemories, setRecalledMemories] = useState<RecalledItem[]>([
    {
      text: "The user is an astrophysicist studying exoplanets.",
      relevance: 0.92,
      blob_id: "sZJ1lo6-0HODV5C4tLxWWRXtzb5xNX50c18R62pygt8",
    },
    {
      text: "The user's favorite go-to ice cream is pistachio.",
      relevance: 0.88,
      blob_id: "wRK9mp3-4LKP2A1bVdYYUzra8a1zLM92b29Q51xzfk2",
    },
  ]);

  // Optical cursor reaction: light passes across the translucent material
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Gentle restrained 3D tilt
    const tiltX = -(mouseY / (rect.height / 2)) * 3.2;
    const tiltY = (mouseX / (rect.width / 2)) * 3.2;

    // Specular light position in percentage
    const specX = ((e.clientX - rect.left) / rect.width) * 100;
    const specY = ((e.clientY - rect.top) / rect.height) * 100;

    setTilt({ x: tiltX, y: tiltY });
    setSpecular({ x: specX, y: specY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setSpecular({ x: 50, y: 25 });
  };

  const handleSendQuery = async (queryToSend?: string) => {
    const text = (queryToSend || inputValue).trim();
    if (!text || isSending) return;

    setUserMessage(text);
    setAssistantMessage("");
    setIsSending(true);
    setInputValue("");

    // Trigger visual memory activation pulse
    if (memoryEnabled) {
      setMemoryPulse(true);
      setTimeout(() => setMemoryPulse(false), 1200);
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: text }],
          memoryEnabled,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      // Check for recalled memories in headers
      const memoryHeader = response.headers.get("x-recalled-memories");
      if (memoryHeader) {
        try {
          const parsed = JSON.parse(decodeURIComponent(memoryHeader));
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRecalledMemories(
              parsed.map((item: any) => ({
                text: item.text,
                relevance: item.relevance || 0.88,
                blob_id: item.blob_id || "sZJ1lo6...ygt8",
              }))
            );
          }
        } catch (_) {}
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        const cleanContent = accumulated
          .replace(/<memory_context>[\s\S]*?<\/memory_context>/gi, "")
          .trimStart();
        setAssistantMessage(cleanContent);
      }

      if (!accumulated.trim()) {
        setAssistantMessage(
          "⚠️ Model stream returned 0 tokens. Please verify your Google Gemini API key and quota."
        );
      }
    } catch (err: any) {
      console.error("Landing chatbot request error:", err);
      // Fallback graceful simulation if offline
      if (text.toLowerCase().includes("ice cream")) {
        setAssistantMessage("Your favorite ice cream is pistachio, remembered from our earlier conversation.");
      } else if (text.toLowerCase().includes("night owl")) {
        setAssistantMessage("I've securely stored that you're a night owl into decentralized Walrus storage. I'll tailor our sessions accordingly.");
      } else {
        setAssistantMessage(
          "I'm ready. You can test asking what I remember about you or store a new memory."
        );
      }
    } finally {
      setIsSending(false);
    }
  };

  const copyBlob = (blobId: string) => {
    navigator.clipboard.writeText(blobId);
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
        transform: `perspective(1400px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${
          isHovered ? "-4px" : "0px"
        })`,
        transition: isHovered
          ? "transform 0.16s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease-out"
          : "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.8s ease-out",
      }}
      className={`relative w-full max-w-xl mx-auto rounded-[28px] glass-plate overflow-hidden transition-all duration-500 z-10 ${
        isHovered
          ? "border-white/95 shadow-[0_36px_72px_-18px_rgba(23,25,28,0.09),0_0_42px_-6px_rgba(141,232,191,0.25)]"
          : "shadow-[0_24px_50px_-20px_rgba(23,25,28,0.06)]"
      }`}
    >
      {/* Dynamic Optical Glass Specular Highlight */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500 z-[1]"
        style={{
          background: `radial-gradient(circle 440px at ${specular.x}% ${specular.y}%, rgba(255,255,255,0.75) 0%, rgba(200,245,222,0.2) 34%, transparent 70%)`,
          opacity: isHovered ? 0.95 : 0.45,
        }}
      />

      {/* Trapped Subsurface Emerald Light */}
      <div
        className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full blur-[50px] pointer-events-none transition-all duration-700 z-0"
        style={{
          background: memoryEnabled
            ? "radial-gradient(circle, rgba(66,201,138,0.25) 0%, rgba(141,232,191,0.15) 60%, transparent 80%)"
            : "radial-gradient(circle, rgba(111,115,120,0.12) 0%, transparent 70%)",
          opacity: isHovered || isInputFocused || memoryPulse ? 0.9 : 0.4,
          transform: memoryPulse ? "scale(1.2)" : "scale(1)",
        }}
      />

      {/* Top Architectural Header Strip */}
      <div className="relative px-6 py-4 border-b border-white/60 flex items-center justify-between bg-white/50 backdrop-blur-md z-[2]">
        <div className="flex items-center gap-2.5">
          <TuskSymbol size={20} active={memoryEnabled} />
          <span className="font-display font-semibold text-xs tracking-tight text-[#17191C]">
            Tusk
          </span>
          <span className="text-[10px] text-[#6F7378] font-mono">•</span>
          <span className="text-[11px] text-[#6F7378]">
            {memoryEnabled ? "Long-term memory active" : "Ephemeral session"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {memoryEnabled ? (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-[#167A55] bg-white/80 border border-[#8DE8BF]/50 shadow-xs transition-all ${
                memoryPulse ? "ring-2 ring-[#42C98A]/50 bg-[#C8F5DE]/50" : ""
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#167A55] animate-pulse" />
              Walrus Mainnet
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-[#6F7378] bg-black/[0.04]">
              Amnesic
            </span>
          )}
        </div>
      </div>

      {/* Interactive Dialogue Demonstration */}
      <div className="relative p-6 flex flex-col gap-5 min-h-[280px] justify-between z-[2]">
        <div className="flex flex-col gap-4">
          {/* User message capsule: Inverted dark optical glass */}
          <div className="self-end max-w-[85%] rounded-[16px] bg-[#17191C]/92 backdrop-blur-md text-[#F7F7F5] px-4 py-2.5 text-xs font-normal leading-relaxed shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_4px_14px_-2px_rgba(23,25,28,0.1)] transition-all">
            {userMessage}
          </div>

          {/* Assistant message plate: Frosted translucent material */}
          <div className="self-start max-w-[95%] rounded-[18px] glass-frosted p-4 text-xs text-[#17191C] leading-relaxed flex flex-col gap-3 shadow-xs border border-white/80">
            {/* Recalled memory drawer pill */}
            {memoryEnabled && recalledMemories.length > 0 && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/85 border border-[#8DE8BF]/60 text-[#167A55] text-[10px] font-mono hover:bg-[#C8F5DE]/50 transition-all w-fit shadow-xs ${
                    memoryPulse ? "scale-105 border-[#42C98A]" : ""
                  }`}
                >
                  <Sparkles className="h-2.5 w-2.5 text-[#167A55]" />
                  <span>
                    Remembered {recalledMemories.length} thing{recalledMemories.length > 1 ? "s" : ""}
                  </span>
                  <span className="text-[9px] underline ml-1">
                    {showDetails ? "Hide Details" : "Inspect"}
                  </span>
                </button>

                {/* Expanded Encrypted Memory Details Drawer */}
                {showDetails && (
                  <div className="mt-1 p-3.5 rounded-[14px] bg-white/95 border border-[#8DE8BF]/40 text-[10px] flex flex-col gap-2.5 font-mono shadow-xs animate-in fade-in-0 duration-200">
                    <div className="flex items-center justify-between text-[#167A55] font-semibold border-b border-[#8DE8BF]/20 pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Database className="h-3 w-3" />
                        <span>Decentralized Walrus Records</span>
                      </div>
                      <span className="text-[9px] text-[#6F7378] flex items-center gap-1">
                        <Shield className="h-2.5 w-2.5 text-[#167A55]" />
                        Sealed
                      </span>
                    </div>

                    {recalledMemories.map((mem, idx) => (
                      <div key={idx} className="flex flex-col gap-1 border-b border-black/[0.04] last:border-b-0 pb-1.5 last:pb-0">
                        <div className="flex items-center justify-between text-[#17191C]">
                          <span className="font-sans text-[11px]">{mem.text}</span>
                          <span className="text-[#167A55] font-semibold">
                            {Math.round(mem.relevance * 100)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-[#6F7378]">
                          <span className="truncate max-w-[200px]">
                            Blob: {mem.blob_id.slice(0, 8)}...{mem.blob_id.slice(-4)}
                          </span>
                          <button
                            onClick={() => copyBlob(mem.blob_id)}
                            className="hover:text-[#17191C] flex items-center gap-1 font-sans"
                          >
                            {copiedBlob ? <Check className="h-2.5 w-2.5 text-[#167A55]" /> : <Copy className="h-2.5 w-2.5" />}
                            <span>{copiedBlob ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!assistantMessage && isSending ? (
              <div className="flex items-center gap-1.5 py-1 text-xs text-[#6F7378]">
                <span className="inline-block h-2 w-2 rounded-full bg-[#42C98A] animate-pulse" />
                <span className="inline-block h-2 w-2 rounded-full bg-[#42C98A] animate-pulse [animation-delay:200ms]" />
                <span className="inline-block h-2 w-2 rounded-full bg-[#42C98A] animate-pulse [animation-delay:400ms]" />
                <span className="ml-1 font-mono text-[11px]">
                  {memoryEnabled ? "Accessing Walrus memory..." : "Generating response..."}
                </span>
              </div>
            ) : (
              <p className="font-normal text-[#17191C] whitespace-pre-wrap leading-relaxed">
                {assistantMessage}
              </p>
            )}
          </div>
        </div>

        {/* Starter Prompt Chips */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/50">
          {[
            "Remember that I'm a night owl",
            "What do you know about me?",
            "Plan my week",
            "Help me write a message",
          ].map((promptText) => (
            <button
              key={promptText}
              onClick={() => {
                setInputValue(promptText);
                handleSendQuery(promptText);
              }}
              className="text-[11px] text-[#6F7378] hover:text-[#17191C] glass-pill hover:bg-white/90 px-3 py-1 rounded-full transition-all text-left shadow-xs hover:border-[#8DE8BF]/60 active:scale-98"
            >
              {promptText}
            </button>
          ))}
        </div>
      </div>

      {/* Recessed Frosted Glass Composer Shelf */}
      <div className="relative p-3.5 bg-white/50 backdrop-blur-md border-t border-white/70 flex flex-col gap-2.5 z-[2]">
        <div className="relative flex items-center bg-white/85 border border-white/90 rounded-[16px] px-4 py-2.5 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_2px_8px_-2px_rgba(23,25,28,0.03)] focus-within:border-[#42C98A]/60 focus-within:ring-2 focus-within:ring-[#42C98A]/20 transition-all">
          <input
            type="text"
            value={inputValue}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendQuery()}
            placeholder="Ask Tusk anything, or share something to remember..."
            className="w-full bg-transparent text-xs text-[#17191C] placeholder:text-[#6F7378] outline-none"
          />

          <button
            onClick={() => handleSendQuery()}
            disabled={!inputValue.trim() || isSending}
            aria-label="Send signal"
            className={`ml-2 h-7 w-7 rounded-[9px] flex items-center justify-center transition-all ${
              inputValue.trim() && !isSending
                ? "bg-[#17191C] text-[#F7F7F5] hover:bg-[#167A55] active:scale-95 shadow-sm"
                : "bg-transparent text-[#6F7378]/35 cursor-not-allowed"
            }`}
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Bottom Controls */}
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

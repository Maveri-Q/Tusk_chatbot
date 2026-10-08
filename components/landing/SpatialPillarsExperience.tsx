"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  ShieldCheck,
  Smartphone,
  Laptop,
  Check,
  ArrowRight,
  Sparkles,
  Lock,
  RefreshCw,
  Trash2,
  ShieldAlert,
} from "lucide-react";
import { TuskSymbol } from "@/components/brand/TuskSymbol";

export function SpatialPillarsExperience() {
  const [activePillar, setActivePillar] = useState<1 | 2 | 3>(1);
  const [animatingPillar, setAnimatingPillar] = useState(false);

  // Pillar 1 Simulation State: Chat session wiped & restored from Walrus
  const [p1SessionId, setP1SessionId] = useState(1);
  const [p1Cleared, setP1Cleared] = useState(false);

  // Pillar 2 Simulation State: Boundary test
  const [p2AttemptedLeak, setP2AttemptedLeak] = useState(false);

  // Pillar 3 Simulation State: Device sync progress
  const [p3Synced, setP3Synced] = useState(true);

  const switchPillar = (num: 1 | 2 | 3) => {
    if (activePillar === num) return;
    setAnimatingPillar(true);
    setTimeout(() => {
      setActivePillar(num);
      setAnimatingPillar(false);
    }, 200);
  };

  // Pillar 1 Interactive Demo: Simulate clearing chat and opening new one
  const handleP1NewChat = () => {
    setP1Cleared(true);
    setTimeout(() => {
      setP1SessionId((prev) => prev + 1);
      setP1Cleared(false);
    }, 600);
  };

  // Pillar 2 Interactive Demo: Attempt unauthorized cross-user memory leak
  const handleP2TestLeak = () => {
    setP2AttemptedLeak(true);
    setTimeout(() => setP2AttemptedLeak(false), 2400);
  };

  // Pillar 3 Interactive Demo: Stream memory between phone and laptop
  const handleP3Sync = () => {
    setP3Synced(false);
    setTimeout(() => setP3Synced(true), 900);
  };

  return (
    <section className="relative z-10 w-full max-w-5xl mx-auto px-6 py-32 flex flex-col items-center select-none">
      {/* 1. Spacious Section Header */}
      <div className="flex flex-col items-center text-center gap-3 mb-14 max-w-2xl">
        <span className="font-mono text-[11px] uppercase tracking-wider text-[#167A55]">
          Core Requirements
        </span>
        <h2 className="font-display font-semibold text-3xl sm:text-5xl text-[#17191C] tracking-tight">
          How Tusk remembers
        </h2>
        <p className="text-sm sm:text-base text-[#6F7378] leading-relaxed">
          Select each architectural concept to interact with a live demonstration of how memory persists, isolates, and synchronizes.
        </p>

        {/* Tactile Pillar Selector Pills */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full max-w-xl">
          {[
            { id: 1, num: "01", title: "Across Conversations", icon: Cpu },
            { id: 2, num: "02", title: "Across Users (Isolated)", icon: ShieldCheck },
            { id: 3, num: "03", title: "Across Devices", icon: Smartphone },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => switchPillar(item.id as 1 | 2 | 3)}
              className={`px-4 py-3 rounded-[20px] text-xs font-medium transition-all duration-300 flex items-center justify-between border shadow-xs ${
                activePillar === item.id
                  ? "bg-[#17191C] text-[#F7F7F5] border-[#17191C] shadow-md scale-102"
                  : "bg-white/70 text-[#6F7378] hover:text-[#17191C] border-white/80 hover:bg-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-[#42C98A] font-semibold">
                  {item.num}
                </span>
                <span className="font-display font-medium text-left truncate">{item.title}</span>
              </div>
              <item.icon className="h-3.5 w-3.5 shrink-0 opacity-70" />
            </button>
          ))}
        </div>
      </div>

      {/* 
        2. The Interactive Demonstration Stage
        Actively proves the selected concept with live visual movement
      */}
      <div
        className={`relative w-full max-w-3xl rounded-[36px] bg-white/80 backdrop-blur-xl border border-white/95 p-8 sm:p-12 shadow-[0_32px_80px_-24px_rgba(23,25,28,0.08)] transition-all duration-400 min-h-[420px] flex flex-col justify-between ${
          animatingPillar ? "opacity-30 scale-99" : "opacity-100 scale-100"
        }`}
      >
        {/* ================= PILLAR 1: ACROSS CONVERSATIONS ================= */}
        {activePillar === 1 && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/[0.06] pb-5">
              <div>
                <span className="font-mono text-xs text-[#167A55] font-semibold">01</span>
                <h3 className="font-display font-semibold text-2xl text-[#17191C]">
                  Across Conversations
                </h3>
              </div>
              <button
                onClick={handleP1NewChat}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#167A55] text-[#F7F7F5] text-xs font-medium hover:bg-[#167A55]/90 transition-all shadow-xs active:scale-95 self-start sm:self-auto"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Simulate New Chat (Wipe Session)</span>
              </button>
            </div>

            <p className="text-sm text-[#6F7378] leading-relaxed max-w-xl">
              Clear your chat history anytime. Tusk stores facts in Walrus Memory, recalling them seamlessly when you return.
            </p>

            {/* Interactive Visual Stage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3">
              {/* Box A: The Active / Discarded Chat Session */}
              <div
                className={`p-5 rounded-[22px] border transition-all duration-500 ${
                  p1Cleared
                    ? "bg-black/[0.02] border-black/[0.05] opacity-30"
                    : "bg-white/90 border-white/90 shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono text-[#6F7378] pb-3 border-b border-black/[0.05]">
                  <span>Chat Session #{p1SessionId}</span>
                  <span className="text-[10px] text-[#167A55]">Local Window</span>
                </div>
                <div className="mt-4 flex flex-col gap-2 text-xs">
                  <div className="p-2.5 rounded-[12px] bg-black/[0.04] text-[#17191C]">
                    "I'm an astrophysicist researching exoplanets."
                  </div>
                  <div className="text-[11px] text-[#6F7378]">
                    {p1Cleared ? "Clearing conversation buffer..." : "Session active"}
                  </div>
                </div>
              </div>

              {/* Box B: Decentralized Walrus Anchor (Never Deleted) */}
              <div className="p-5 rounded-[22px] bg-[#C8F5DE]/30 border border-[#8DE8BF]/60 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-[#167A55] pb-3 border-b border-[#8DE8BF]/30">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <TuskSymbol size={13} active={true} />
                      Walrus Memory Storage
                    </span>
                    <span className="text-[10px]">Anchored</span>
                  </div>
                  <div className="mt-4 p-3 rounded-[14px] bg-white/95 border border-[#8DE8BF]/40 text-xs text-[#17191C] flex flex-col gap-1 shadow-xs">
                    <span className="font-mono text-[10px] text-[#167A55] font-semibold">
                      ✦ PERSISTENT BLOB #0x8F
                    </span>
                    <p className="text-[11px]">User is an astrophysicist studying exoplanets</p>
                  </div>
                </div>
                <div className="mt-4 text-[10px] font-mono text-[#167A55] flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-[#167A55]" />
                  <span>Survives session deletions & history wipes</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= PILLAR 2: ACROSS USERS (ISOLATED) ================= */}
        {activePillar === 2 && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/[0.06] pb-5">
              <div>
                <span className="font-mono text-xs text-[#167A55] font-semibold">02</span>
                <h3 className="font-display font-semibold text-2xl text-[#17191C]">
                  Across Users (Isolated)
                </h3>
              </div>
              <button
                onClick={handleP2TestLeak}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#17191C] text-[#F7F7F5] text-xs font-medium hover:bg-[#167A55] transition-all shadow-xs active:scale-95 self-start sm:self-auto"
              >
                <ShieldAlert className="h-3 w-3 text-[#8DE8BF]" />
                <span>Test Namespace Penetration</span>
              </button>
            </div>

            <p className="text-sm text-[#6F7378] leading-relaxed max-w-xl">
              Strict per-user cryptographic namespaces. Alice never sees Bob’s memories, enforced server-side.
            </p>

            {/* Interactive Visual Stage: Dual Cryptographic Zones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3 relative">
              {/* Alice's Sealed Cryptographic Realm */}
              <div className="p-5 rounded-[22px] bg-white/90 border border-white/90 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-mono text-[#167A55] pb-2 border-b border-black/[0.05]">
                  <span>Namespace: alice:default</span>
                  <span className="text-[10px]">SEAL 0xAA1</span>
                </div>
                <div className="p-3 rounded-[12px] bg-[#C8F5DE]/30 text-xs text-[#17191C]">
                  "Alice's secret research notes"
                </div>
                <span className="text-[10px] font-mono text-[#6F7378]">Encrypted with Alice's key</span>
              </div>

              {/* Bob's Sealed Cryptographic Realm */}
              <div className="p-5 rounded-[22px] bg-white/90 border border-white/90 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-mono text-[#6F7378] pb-2 border-b border-black/[0.05]">
                  <span>Namespace: bob:default</span>
                  <span className="text-[10px]">SEAL 0xBB2</span>
                </div>
                <div className="p-3 rounded-[12px] bg-black/[0.03] text-[#17191C]">
                  "Bob's personal preferences"
                </div>
                <span className="text-[10px] font-mono text-[#6F7378]">Encrypted with Bob's key</span>
              </div>

              {/* Firewall Barrier status banner */}
              {p2AttemptedLeak && (
                <div className="sm:col-span-2 p-3 rounded-[16px] bg-[#17191C] text-[#F7F7F5] text-xs font-mono flex items-center justify-between animate-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5 text-[#42C98A]" />
                    <span>Cross-User Query Blocked: Namespace Isolation Active</span>
                  </div>
                  <span className="text-[10px] text-[#8DE8BF]">ZERO LEAKAGE</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= PILLAR 3: ACROSS DEVICES ================= */}
        {activePillar === 3 && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/[0.06] pb-5">
              <div>
                <span className="font-mono text-xs text-[#167A55] font-semibold">03</span>
                <h3 className="font-display font-semibold text-2xl text-[#17191C]">
                  Across Devices
                </h3>
              </div>
              <button
                onClick={handleP3Sync}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#167A55] text-[#F7F7F5] text-xs font-medium hover:bg-[#167A55]/90 transition-all shadow-xs active:scale-95 self-start sm:self-auto"
              >
                <RefreshCw className={`h-3 w-3 ${!p3Synced ? "animate-spin" : ""}`} />
                <span>Simulate Phone → Laptop Sync</span>
              </button>
            </div>

            <p className="text-sm text-[#6F7378] leading-relaxed max-w-xl">
              Memory is anchored to your account, not local browser cache. Switch from phone to laptop without missing a beat.
            </p>

            {/* Interactive Visual Stage: Cross-Device Stream */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3 relative">
              {/* Device 1: Mobile Phone */}
              <div className="p-5 rounded-[22px] bg-white/90 border border-white/90 shadow-xs flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-mono text-[#167A55] pb-2 border-b border-black/[0.05]">
                  <Smartphone className="h-4 w-4" />
                  <span>Mobile Client (iOS / Android)</span>
                </div>
                <div className="p-3 rounded-[12px] bg-[#C8F5DE]/30 text-xs text-[#17191C]">
                  "Remember that I'm a night owl"
                </div>
                <span className="text-[10px] font-mono text-[#6F7378]">Dispatched to Walrus</span>
              </div>

              {/* Device 2: Desktop Laptop */}
              <div className="p-5 rounded-[22px] bg-white/90 border border-white/90 shadow-xs flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-mono text-[#167A55] pb-2 border-b border-black/[0.05]">
                  <Laptop className="h-4 w-4" />
                  <span>Desktop Client (macOS / Windows)</span>
                </div>
                <div
                  className={`p-3 rounded-[12px] text-xs transition-all duration-500 ${
                    p3Synced
                      ? "bg-[#C8F5DE]/50 text-[#17191C] border border-[#8DE8BF]/50"
                      : "bg-black/[0.02] text-[#6F7378]"
                  }`}
                >
                  {p3Synced ? "✦ Recalled: User is a night owl" : "Synchronizing..."}
                </div>
                <span className="text-[10px] font-mono text-[#167A55]">0ms Cookie-Free Recall</span>
              </div>
            </div>
          </div>
        )}

        {/* Translucent Trust Strip */}
        <div className="mt-8 pt-5 border-t border-black/[0.06] flex flex-wrap items-center justify-around gap-4 text-xs font-mono text-[#6F7378]">
          <div className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-[#167A55]" />
            <span>Private and encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-[#167A55]" />
            <span>Yours on every device</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-[#167A55]" />
            <span>Protected from tampering</span>
          </div>
        </div>
      </div>
    </section>
  );
}

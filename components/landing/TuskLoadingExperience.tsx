"use client";

import React, { useEffect, useState, useRef } from "react";
import { TuskSymbol } from "@/components/brand/TuskSymbol";

interface TuskLoadingExperienceProps {
  onComplete: () => void;
}

export function TuskLoadingExperience({ onComplete }: TuskLoadingExperienceProps) {
  // Phase 1 through 8
  const [phase, setPhase] = useState<number>(1);
  const [tracerProgress, setTracerProgress] = useState<number>(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDuckingOut, setIsDuckingOut] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Mouse interaction on the loading screen: gentle parallax & light steering
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Sequenced cinematic system initialization
  useEffect(() => {
    // Check if user already saw the cinematic loading in this session
    const hasLoaded = typeof window !== "undefined" && sessionStorage.getItem("tusk_intro_played");
    if (hasLoaded) {
      // Rapid version for return visitors
      setPhase(8);
      setIsDuckingOut(true);
      const timer = setTimeout(() => onComplete(), 300);
      return () => clearTimeout(timer);
    }

    const t1 = setTimeout(() => {
      setPhase(2);
      // Animate stroke tracer
      let start = performance.now();
      const animTracer = (now: number) => {
        const elapsed = (now - start) / 450; // 450ms trace
        if (elapsed < 1) {
          setTracerProgress(elapsed);
          requestAnimationFrame(animTracer);
        } else {
          setTracerProgress(1);
        }
      };
      requestAnimationFrame(animTracer);
    }, 250);

    const t2 = setTimeout(() => setPhase(3), 650);
    const t3 = setTimeout(() => setPhase(4), 1050);
    const t4 = setTimeout(() => setPhase(5), 1450);
    const t5 = setTimeout(() => setPhase(6), 1800);
    const t6 = setTimeout(() => setPhase(7), 2100);
    const t7 = setTimeout(() => {
      setPhase(8);
      setIsDuckingOut(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("tusk_intro_played", "true");
      }
    }, 2450);

    const t8 = setTimeout(() => {
      onComplete();
    }, 3100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
      clearTimeout(t8);
    };
  }, [onComplete]);

  // Click or keypress allows instant fast-forward into phase 8
  const handleSkip = () => {
    if (phase < 8) {
      setPhase(8);
      setIsDuckingOut(true);
      setTimeout(() => onComplete(), 500);
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#F7F7F5] select-none cursor-pointer transition-opacity duration-700 ${
        isDuckingOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-label="Tusk system initializing"
    >
      {/* Background Soft Atmospheric Glow following cursor */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[90px] pointer-events-none transition-transform duration-700 ease-out"
        style={{
          background:
            "radial-gradient(circle, rgba(66,201,138,0.2) 0%, rgba(200,245,222,0.12) 50%, transparent 75%)",
          transform: `translate3d(${mousePos.x * 24}px, ${mousePos.y * 24}px, 0)`,
          opacity: phase >= 2 ? 0.9 : 0.3,
        }}
      />

      {/* Center Orchestration System */}
      <div
        className="relative flex flex-col items-center justify-center transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${mousePos.x * 12}px, ${mousePos.y * 12}px, 0)`,
        }}
      >
        {/* Orbital System Container */}
        <div className="relative w-80 h-80 flex items-center justify-center">
          {/* Phase 3 & 4: Orbital Rings & Geometric Guides */}
          {phase >= 3 && (
            <>
              {/* Outer Delicate Orbital Ring */}
              <div
                className="absolute inset-0 rounded-full border border-[#167A55]/15 transition-all duration-1000 animate-spin"
                style={{
                  animationDuration: "36s",
                  transform: `scale(${phase >= 5 ? 1 : 0.85}) rotate(${mousePos.x * 10}deg)`,
                  opacity: phase >= 4 ? 0.75 : 0.3,
                }}
              />

              {/* Middle Dashed Ring */}
              <div
                className="absolute inset-8 rounded-full border border-dashed border-[#42C98A]/25 transition-all duration-700 animate-spin"
                style={{
                  animationDuration: "24s",
                  animationDirection: "reverse",
                  opacity: phase >= 4 ? 0.8 : 0.2,
                }}
              />

              {/* Inner Optical Reticle Ring */}
              <div
                className="absolute inset-16 rounded-full border border-white/80 shadow-[0_0_15px_rgba(141,232,191,0.2)] transition-opacity duration-500"
                style={{ opacity: phase >= 5 ? 0.9 : 0.4 }}
              />
            </>
          )}

          {/* Phase 3 & 5: Orbiting Memory Nodes */}
          {phase >= 3 && (
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-700"
              style={{ opacity: phase >= 4 ? 1 : 0.4 }}
            >
              {/* Node 1: Top-Right */}
              <div
                className="absolute top-10 right-14 flex items-center gap-1.5 transition-transform duration-500"
                style={{
                  transform: `translate3d(${mousePos.x * -6}px, ${mousePos.y * -6}px, 0)`,
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#167A55] shadow-[0_0_8px_#42C98A]" />
                <span className="font-mono text-[9px] text-[#167A55]/80 tracking-wider">
                  MEMWAL::SYNC
                </span>
              </div>

              {/* Node 2: Bottom-Left */}
              <div
                className="absolute bottom-12 left-12 flex items-center gap-1.5 transition-transform duration-500"
                style={{
                  transform: `translate3d(${mousePos.x * 8}px, ${mousePos.y * 8}px, 0)`,
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#42C98A] shadow-[0_0_8px_#8DE8BF]" />
                <span className="font-mono text-[9px] text-[#6F7378] tracking-wider">
                  SEAL::ENCRYPT
                </span>
              </div>

              {/* Node 3: Center-Right */}
              {phase >= 5 && (
                <div
                  className="absolute top-1/2 -right-2 -translate-y-1/2 flex items-center gap-1.5 transition-transform duration-500"
                  style={{
                    transform: `translate3d(${mousePos.x * -4}px, 0, 0)`,
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8DE8BF]" />
                  <span className="font-mono text-[9px] text-[#167A55]/70 tracking-wider">
                    WALRUS::ACTIVE
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Central Stable Tusk Symbol (Does NOT spin; stays as the authoritative core) */}
          <div
            className={`relative z-10 transition-all duration-700 flex items-center justify-center ${
              phase === 1
                ? "opacity-30 scale-95"
                : phase >= 6
                ? "opacity-100 scale-100 drop-shadow-[0_8px_24px_rgba(66,201,138,0.28)]"
                : "opacity-85 scale-100"
            }`}
            style={{
              transform: `perspective(600px) rotateX(${mousePos.y * -8}deg) rotateY(${mousePos.x * 8}deg)`,
            }}
          >
            <TuskSymbol
              size={96}
              variant={phase <= 2 ? "outline" : "solid"}
              active={phase >= 6}
              tracerProgress={tracerProgress}
            />
          </div>
        </div>

        {/* Phase Indicators / Status Feed */}
        <div className="mt-8 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#167A55] tracking-wider uppercase">
            <span
              className={`h-1.5 w-1.5 rounded-full bg-[#167A55] ${
                phase >= 6 ? "animate-pulse" : ""
              }`}
            />
            <span>
              {phase < 3
                ? "Calibrating Neural Coordinates"
                : phase < 5
                ? "Initializing Decentralized Memory Grid"
                : phase < 7
                ? "Walrus Protocol Online"
                : "Tusk Memory Engine Ready"}
            </span>
          </div>

          <span className="font-mono text-[10px] text-[#6F7378] tracking-widest uppercase">
            {phase < 7 ? "Click anywhere to enter" : "Entering Experience"}
          </span>
        </div>
      </div>
    </div>
  );
}

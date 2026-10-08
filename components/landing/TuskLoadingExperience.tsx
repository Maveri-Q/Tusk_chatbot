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

  // Mouse interaction: subtle parallax & light steering
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
    const hasLoaded = typeof window !== "undefined" && sessionStorage.getItem("tusk_intro_played");
    if (hasLoaded) {
      setPhase(8);
      setIsDuckingOut(true);
      const timer = setTimeout(() => onComplete(), 250);
      return () => clearTimeout(timer);
    }

    const t1 = setTimeout(() => {
      setPhase(2);
      let start = performance.now();
      const animTracer = (now: number) => {
        const elapsed = (now - start) / 450;
        if (elapsed < 1) {
          setTracerProgress(elapsed);
          requestAnimationFrame(animTracer);
        } else {
          setTracerProgress(1);
        }
      };
      requestAnimationFrame(animTracer);
    }, 250);

    const t2 = setTimeout(() => setPhase(3), 600);
    const t3 = setTimeout(() => setPhase(4), 950);
    const t4 = setTimeout(() => setPhase(5), 1350);
    const t5 = setTimeout(() => setPhase(6), 1700);
    const t6 = setTimeout(() => setPhase(7), 2000);
    const t7 = setTimeout(() => {
      setPhase(8);
      setIsDuckingOut(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("tusk_intro_played", "true");
      }
    }, 2350);

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

  // Click or keypress allows instant fast-forward
  const handleSkip = () => {
    if (phase < 8) {
      setPhase(8);
      setIsDuckingOut(true);
      setTimeout(() => onComplete(), 450);
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#F7F7F5] select-none cursor-pointer transition-all duration-1000 ease-in-out ${
        isDuckingOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-label="Tusk system initializing"
    >
      {/* Background Atmosphere: Expands outwards into the Hero atmosphere */}
      <div
        className={`absolute w-[700px] h-[700px] rounded-full blur-[100px] pointer-events-none transition-all duration-1000 ease-out ${
          isDuckingOut ? "scale-[2.4] opacity-80" : "scale-100 opacity-90"
        }`}
        style={{
          background:
            "radial-gradient(circle, rgba(66,201,138,0.24) 0%, rgba(200,245,222,0.14) 50%, transparent 75%)",
          transform: `translate3d(${mousePos.x * 24}px, ${mousePos.y * 24}px, 0)`,
        }}
      />

      {/* Center Orchestration System: Morphs towards the top navigation on exit */}
      <div
        className={`relative flex flex-col items-center justify-center transition-all duration-1000 ease-in-out ${
          isDuckingOut
            ? "-translate-y-[40vh] -translate-x-[36vw] scale-[0.28] opacity-0"
            : "translate-y-0 translate-x-0 scale-100 opacity-100"
        }`}
        style={{
          transform: !isDuckingOut
            ? `translate3d(${mousePos.x * 12}px, ${mousePos.y * 12}px, 0)`
            : undefined,
        }}
      >
        {/* Orbital System Container */}
        <div className="relative w-80 h-80 flex items-center justify-center">
          {/* Orbital Rings expand and dissolve into space */}
          {phase >= 3 && (
            <>
              {/* Outer Delicate Orbital Ring */}
              <div
                className={`absolute inset-0 rounded-full border border-[#167A55]/20 transition-all duration-1000 animate-spin ${
                  isDuckingOut ? "scale-[1.8] opacity-0" : "scale-100 opacity-75"
                }`}
                style={{
                  animationDuration: "36s",
                }}
              />

              {/* Middle Dashed Ring */}
              <div
                className={`absolute inset-8 rounded-full border border-dashed border-[#42C98A]/30 transition-all duration-700 animate-spin ${
                  isDuckingOut ? "scale-[1.5] opacity-0" : "scale-100 opacity-80"
                }`}
                style={{
                  animationDuration: "24s",
                  animationDirection: "reverse",
                }}
              />

              {/* Inner Optical Reticle Ring */}
              <div
                className={`absolute inset-16 rounded-full border border-white/90 shadow-[0_0_15px_rgba(141,232,191,0.25)] transition-opacity duration-500 ${
                  isDuckingOut ? "opacity-0" : "opacity-90"
                }`}
              />
            </>
          )}

          {/* Floating Memory Nodes */}
          {phase >= 3 && !isDuckingOut && (
            <div className="absolute inset-0 pointer-events-none transition-opacity duration-700">
              <div className="absolute top-10 right-14 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#167A55] shadow-[0_0_8px_#42C98A]" />
                <span className="font-mono text-[9px] text-[#167A55]/80 tracking-wider">
                  MEMWAL::SYNC
                </span>
              </div>
              <div className="absolute bottom-12 left-12 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#42C98A] shadow-[0_0_8px_#8DE8BF]" />
                <span className="font-mono text-[9px] text-[#6F7378] tracking-wider">
                  SEAL::ENCRYPT
                </span>
              </div>
              {phase >= 5 && (
                <div className="absolute top-1/2 -right-2 -translate-y-1/2 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8DE8BF]" />
                  <span className="font-mono text-[9px] text-[#167A55]/70 tracking-wider">
                    WALRUS::ACTIVE
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Central Stable Tusk Symbol */}
          <div
            className={`relative z-10 transition-all duration-700 flex items-center justify-center ${
              phase === 1
                ? "opacity-30 scale-95"
                : phase >= 6
                ? "opacity-100 scale-100 drop-shadow-[0_8px_24px_rgba(66,201,138,0.3)]"
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

        {/* Status Feed */}
        {!isDuckingOut && (
          <div className="mt-8 flex flex-col items-center gap-2 text-center animate-in fade-in duration-300">
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
        )}
      </div>
    </div>
  );
}

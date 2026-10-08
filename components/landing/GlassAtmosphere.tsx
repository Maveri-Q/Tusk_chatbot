"use client";

import React, { useEffect, useRef, useState } from "react";

export function GlassAtmosphere() {
  const [mouseShift, setMouseShift] = useState({ x: 0, y: 0 });
  const targetShift = useRef({ x: 0, y: 0 });
  const currentShift = useRef({ x: 0, y: 0 });
  const animFrame = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const xRatio = (e.clientX / window.innerWidth - 0.5) * 2;
      const yRatio = (e.clientY / window.innerHeight - 0.5) * 2;
      // Fluid target position
      targetShift.current = { x: xRatio * 22, y: yRatio * 22 };
    };

    // Smooth physics-based dampening loop (60fps silky liquid inertia)
    const updatePhysics = () => {
      currentShift.current.x += (targetShift.current.x - currentShift.current.x) * 0.06;
      currentShift.current.y += (targetShift.current.y - currentShift.current.y) * 0.06;
      setMouseShift({
        x: currentShift.current.x,
        y: currentShift.current.y,
      });
      animFrame.current = requestAnimationFrame(updatePhysics);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    animFrame.current = requestAnimationFrame(updatePhysics);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* SVG Optical Refraction & Dispersion Filters */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="glass-distortion" x="-15%" y="-15%" width="130%" height="130%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.018"
              numOctaves="2"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="8"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
          </filter>
        </defs>
      </svg>

      {/* Layer 1: Warm Off-White Ambient Lighting */}
      <div className="absolute inset-0 bg-[#F7F7F5]" />

      {/* Layer 2: Subsurface Emerald Liquid Membranes with Fluid Dampening */}
      {/* Primary Membrane A (Pale Mint & Soft Emerald Light) */}
      <div
        className="absolute w-[640px] h-[600px] rounded-full blur-[76px] opacity-35 mix-blend-multiply transition-transform duration-300 ease-out"
        style={{
          top: "10%",
          left: "20%",
          background:
            "radial-gradient(circle at 45% 45%, #8DE8BF 0%, #C8F5DE 40%, rgba(66,201,138,0.16) 70%, transparent 85%)",
          transform: `translate3d(${mouseShift.x * 1.1}px, ${mouseShift.y * 1.1}px, 0)`,
        }}
      />

      {/* Primary Membrane B (Deep Restrained Emerald Energy Pocket) */}
      <div
        className="absolute w-[520px] h-[540px] rounded-full blur-[90px] opacity-25 mix-blend-multiply transition-transform duration-300 ease-out"
        style={{
          top: "26%",
          right: "16%",
          background:
            "radial-gradient(circle at 55% 55%, rgba(22,122,85,0.32) 0%, rgba(66,201,138,0.18) 50%, transparent 80%)",
          transform: `translate3d(${-mouseShift.x * 0.8}px, ${-mouseShift.y * 0.8}px, 0)`,
        }}
      />

      {/* Continuous Light Stream Linking Section Transitions */}
      <div
        className="absolute w-[460px] h-[1400px] blur-[115px] opacity-16 mix-blend-multiply transition-transform duration-500 ease-out"
        style={{
          top: "38%",
          left: "30%",
          background:
            "linear-gradient(180deg, #C8F5DE 0%, rgba(66,201,138,0.22) 45%, rgba(141,232,191,0.14) 80%, transparent 100%)",
          transform: `translate3d(${mouseShift.x * 0.4}px, 0, 0)`,
        }}
      />

      {/* Layer 3: Architectural Glass Plane Geometry */}
      <div
        className="absolute top-[-8%] left-[7%] w-[86%] h-[75%] rounded-[48px] border border-white/50 opacity-40 transition-transform duration-500 ease-out"
        style={{
          background:
            "linear-gradient(140deg, rgba(255,255,255,0.45) 0%, rgba(247,247,245,0.1) 60%, rgba(200,245,222,0.06) 100%)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          boxShadow: "inset 0 1.5px 2px 0 rgba(255,255,255,0.8), 0 32px 72px -24px rgba(23,25,28,0.04)",
          transform: `translate3d(${mouseShift.x * 0.3}px, ${mouseShift.y * 0.3}px, 0) rotate(-1.5deg)`,
        }}
      />

      <div
        className="absolute top-[46%] right-[4%] w-[44%] h-[60%] rounded-[36px] border border-white/40 opacity-30 transition-transform duration-500 ease-out"
        style={{
          background:
            "linear-gradient(220deg, rgba(255,255,255,0.5) 0%, rgba(200,245,222,0.08) 50%, transparent 90%)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: "inset 0 1px 1px 0 rgba(255,255,255,0.7), 0 20px 48px -16px rgba(23,25,28,0.03)",
          transform: `translate3d(${-mouseShift.x * 0.25}px, ${-mouseShift.y * 0.25}px, 0) rotate(2deg)`,
        }}
      />

      {/* Layer 4: Microscopic Inclusions (Trapped Mineral Particles inside the glass) */}
      <svg className="absolute inset-0 w-full h-full opacity-30" aria-hidden="true">
        {[
          { cx: "24%", cy: "18%", r: 1.2, o: 0.4 },
          { cx: "78%", cy: "22%", r: 1.6, o: 0.35 },
          { cx: "42%", cy: "36%", r: 0.9, o: 0.5 },
          { cx: "65%", cy: "44%", r: 1.4, o: 0.3 },
          { cx: "18%", cy: "62%", r: 1.1, o: 0.45 },
          { cx: "85%", cy: "70%", r: 1.5, o: 0.25 },
          { cx: "32%", cy: "84%", r: 1.0, o: 0.4 },
          { cx: "58%", cy: "92%", r: 1.3, o: 0.35 },
        ].map((pt, idx) => (
          <circle
            key={idx}
            cx={pt.cx}
            cy={pt.cy}
            r={pt.r}
            fill="#167A55"
            opacity={pt.o}
          />
        ))}
      </svg>
    </div>
  );
}

"use client";

import React, { useEffect, useRef, useState } from "react";

export function GlassAtmosphere() {
  const [mouseShift, setMouseShift] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Subtle supporting mouse influence: shifts internal light falloff softly
    const handleMouseMove = (e: MouseEvent) => {
      const xRatio = (e.clientX / window.innerWidth - 0.5) * 2;
      const yRatio = (e.clientY / window.innerHeight - 0.5) * 2;
      setMouseShift({ x: xRatio * 18, y: yRatio * 18 });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* SVG Optical Refraction & Dispersion Filters */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          {/* Subtle optical glass displacement filter */}
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
              scale="9"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
          </filter>

          {/* Subsurface chromatic light scattering */}
          <filter id="subsurface-scatter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="40" result="blurred" />
            <feColorMatrix
              in="blurred"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
            />
          </filter>
        </defs>
      </svg>

      {/* Layer 1: Warm Off-White Ambient Lighting */}
      <div className="absolute inset-0 bg-[#F7F7F5]" />

      {/* Layer 2: Subsurface Emerald Liquid Membranes (Slowly Morphing Behind Glass) */}
      {/* Primary Membrane A (Pale Mint & Soft Emerald Light) */}
      <div
        className="absolute w-[620px] h-[580px] rounded-full blur-[72px] opacity-35 mix-blend-multiply animate-membrane-slow transition-transform duration-1000 ease-out"
        style={{
          top: "12%",
          left: "22%",
          background:
            "radial-gradient(circle at 45% 45%, #8DE8BF 0%, #C8F5DE 40%, rgba(66,201,138,0.15) 70%, transparent 85%)",
          transform: `translate3d(${mouseShift.x * 0.8}px, ${mouseShift.y * 0.8}px, 0)`,
        }}
      />

      {/* Primary Membrane B (Deep Restrained Emerald Energy Pocket) */}
      <div
        className="absolute w-[500px] h-[520px] rounded-full blur-[88px] opacity-25 mix-blend-multiply animate-membrane-medium transition-transform duration-1000 ease-out"
        style={{
          top: "28%",
          right: "18%",
          background:
            "radial-gradient(circle at 55% 55%, rgba(22,122,85,0.3) 0%, rgba(66,201,138,0.18) 50%, transparent 80%)",
          transform: `translate3d(${-mouseShift.x * 0.6}px, ${-mouseShift.y * 0.6}px, 0)`,
        }}
      />

      {/* Continuous Light Stream Linking Section Transitions */}
      <div
        className="absolute w-[440px] h-[1400px] blur-[110px] opacity-15 mix-blend-multiply transition-transform duration-700"
        style={{
          top: "40%",
          left: "32%",
          background:
            "linear-gradient(180deg, #C8F5DE 0%, rgba(66,201,138,0.25) 45%, rgba(141,232,191,0.15) 80%, transparent 100%)",
          transform: `translate3d(${mouseShift.x * 0.3}px, 0, 0)`,
        }}
      />

      {/* Layer 3: Refracted Glass Plane Geometry (Subtle Architectural Shapes) */}
      {/* Background Architectural Sheet 1: Large Diagonal Translucent Slab */}
      <div
        className="absolute top-[-10%] left-[8%] w-[84%] h-[75%] rounded-[48px] border border-white/50 opacity-40 transition-transform duration-700 ease-out"
        style={{
          background:
            "linear-gradient(140deg, rgba(255,255,255,0.45) 0%, rgba(247,247,245,0.1) 60%, rgba(200,245,222,0.06) 100%)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          boxShadow: "inset 0 1.5px 2px 0 rgba(255,255,255,0.8), 0 32px 72px -24px rgba(23,25,28,0.04)",
          transform: `translate3d(${mouseShift.x * 0.25}px, ${mouseShift.y * 0.25}px, 0) rotate(-1.5deg)`,
        }}
      />

      {/* Background Architectural Sheet 2: Floating Translucent Prism */}
      <div
        className="absolute top-[48%] right-[5%] w-[42%] h-[60%] rounded-[36px] border border-white/40 opacity-30 transition-transform duration-700 ease-out"
        style={{
          background:
            "linear-gradient(220deg, rgba(255,255,255,0.5) 0%, rgba(200,245,222,0.08) 50%, transparent 90%)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: "inset 0 1px 1px 0 rgba(255,255,255,0.7), 0 20px 48px -16px rgba(23,25,28,0.03)",
          transform: `translate3d(${-mouseShift.x * 0.2}px, ${-mouseShift.y * 0.2}px, 0) rotate(2deg)`,
        }}
      />

      {/* Layer 4: Microscopic Inclusions (Trapped Mineral Dust inside the glass) */}
      <svg className="absolute inset-0 w-full h-full opacity-35" aria-hidden="true">
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

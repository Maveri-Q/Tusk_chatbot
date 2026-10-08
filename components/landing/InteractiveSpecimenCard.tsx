"use client";

import React, { useRef, useState } from "react";
import { LucideIcon } from "lucide-react";

interface InteractiveSpecimenCardProps {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
  delayIndex?: number;
}

export function InteractiveSpecimenCard({
  number,
  title,
  description,
  icon: Icon,
  delayIndex = 0,
}: InteractiveSpecimenCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [specular, setSpecular] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Specular light coordinates (0% to 100%)
    setSpecular({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });

    // 3D tilt calculation (restrained to ~5 degrees max)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = -((y - centerY) / centerY) * 5;
    const rotateY = ((x - centerX) / centerX) * 5;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
    setSpecular({ x: 50, y: 50 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateY(${
          isHovered ? "-6px" : "0px"
        })`,
        transition: isHovered
          ? "transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease"
          : "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.7s ease",
      }}
      className={`group relative flex flex-col gap-4 p-7 rounded-[26px] glass-plate overflow-hidden cursor-default transition-all duration-400 select-none ${
        isHovered
          ? "border-white/95 shadow-[0_28px_60px_-16px_rgba(23,25,28,0.08),0_0_28px_-4px_rgba(141,232,191,0.22)]"
          : "hover:border-white/90"
      }`}
    >
      {/* Specular Glare Layer (Follows cursor over the glass surface) */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-0"
        style={{
          background: `radial-gradient(circle 280px at ${specular.x}% ${specular.y}%, rgba(255,255,255,0.7) 0%, rgba(200,245,222,0.15) 40%, transparent 80%)`,
          opacity: isHovered ? 0.9 : 0.25,
        }}
      />

      {/* Internal Subsurface Emerald Glow */}
      <div
        className="absolute -bottom-8 -right-8 w-36 h-36 rounded-full blur-[32px] pointer-events-none transition-opacity duration-500 z-0"
        style={{
          background: "radial-gradient(circle, rgba(66,201,138,0.2) 0%, rgba(200,245,222,0.1) 60%, transparent 80%)",
          opacity: isHovered ? 0.9 : 0.3,
        }}
      />

      {/* Header: Number & Floating Responsive Icon */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="font-mono text-xs text-[#167A55] font-semibold tracking-wider">
          {number}
        </span>
        <div
          className={`h-9 w-9 rounded-full bg-white/80 border border-[#8DE8BF]/40 flex items-center justify-center text-[#167A55] shadow-xs transition-all duration-300 ${
            isHovered ? "scale-110 shadow-sm border-[#167A55]/40 text-[#167A55] rotate-3" : ""
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      {/* Title */}
      <h3 className="relative z-10 font-display font-semibold text-base text-[#17191C] tracking-tight">
        {title}
      </h3>

      {/* Description */}
      <p className="relative z-10 text-xs text-[#6F7378] leading-relaxed">
        {description}
      </p>

      {/* Delicate Bottom Edge Highlight */}
      <div
        className="absolute bottom-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#8DE8BF]/40 to-transparent transition-opacity duration-500"
        style={{ opacity: isHovered ? 1 : 0.2 }}
      />
    </div>
  );
}

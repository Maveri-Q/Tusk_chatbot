"use client";

import React from "react";

interface TuskSymbolProps {
  size?: number;
  className?: string;
  variant?: "solid" | "glow" | "outline" | "minimal";
  active?: boolean;
  tracerProgress?: number; // 0 to 1 for loading tracing line
}

/**
 * TUSK Minimal Abstract Brand Symbol
 * 
 * An elegant, modern, curved geometric form inspired by the walrus tusk.
 * Pure abstract technology mark — minimal, confident, and recognizable.
 */
export function TuskSymbol({
  size = 32,
  className = "",
  variant = "solid",
  active = false,
  tracerProgress = 1,
}: TuskSymbolProps) {
  // Precision SVG path for the abstract tusk mark
  // Clean sweeping outer curve tapering to a sharp, refined tip, with an elegant inner curve
  const tuskPath = "M 32,84 C 36,85 43,83 48,79 C 61,68 70,48 68,18 C 67.6,13 65.8,10 64.2,10 C 63.2,10 61.5,14 57.5,25 C 49,46 39.5,66 31.5,79 C 30.5,81 30.8,83.6 32,84 Z";

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          {/* Emerald Gradient for Brand Mark */}
          <linearGradient id="tusk-grad-brand" x1="68" y1="10" x2="32" y2="84" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#42C98A" />
            <stop offset="45%" stopColor="#167A55" />
            <stop offset="100%" stopColor="#17191C" />
          </linearGradient>

          {/* Luminous Glow Gradient */}
          <linearGradient id="tusk-grad-glow" x1="68" y1="10" x2="32" y2="84" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8DE8BF" />
            <stop offset="50%" stopColor="#42C98A" />
            <stop offset="100%" stopColor="#167A55" />
          </linearGradient>

          {/* Soft Filter Glow */}
          <filter id="tusk-soft-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Subsurface Blur Glow if active */}
        {(active || variant === "glow") && (
          <path
            d={tuskPath}
            fill="url(#tusk-grad-glow)"
            opacity={0.4}
            filter="url(#tusk-soft-glow)"
          />
        )}

        {/* Outline / Tracing Stroke (Used during loading sequence) */}
        {variant === "outline" ? (
          <path
            d={tuskPath}
            stroke="url(#tusk-grad-glow)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="240"
            strokeDashoffset={240 * (1 - tracerProgress)}
            fill="none"
            className="transition-all duration-300"
          />
        ) : variant === "minimal" ? (
          /* Single Monochromatic Mark */
          <path
            d={tuskPath}
            fill="currentColor"
          />
        ) : (
          /* Standard Luminous Solid Brand Mark */
          <>
            <path
              d={tuskPath}
              fill="url(#tusk-grad-brand)"
            />
            {/* Specular Highlight Rim */}
            <path
              d="M 64.2,10 C 65.8,10 67.6,13 68,18 C 70,48 61,68 48,79"
              stroke="#C8F5DE"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity={0.7}
            />
          </>
        )}
      </svg>
    </div>
  );
}

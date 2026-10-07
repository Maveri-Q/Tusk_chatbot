"use client";

import React from "react";

interface IntelligenceMarkProps {
  className?: string;
  size?: number;
  active?: boolean;
}

export function IntelligenceMark({
  className = "",
  size = 20,
  active = false,
}: IntelligenceMarkProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-transform duration-700 ease-out ${
          active ? "rotate-45 scale-105" : "rotate-0 scale-100"
        }`}
      >
        {/* Invisible center with 6 precise orbital micro-nodes */}
        <circle
          cx="12"
          cy="4.5"
          r="1.25"
          fill="#167A55"
          className="transition-all duration-500"
          opacity={active ? 0.95 : 0.75}
        />
        <circle
          cx="18.5"
          cy="8.5"
          r="1.1"
          fill="#42C98A"
          className="transition-all duration-500"
          opacity={active ? 0.9 : 0.6}
        />
        <circle
          cx="18.5"
          cy="15.5"
          r="1.25"
          fill="#167A55"
          className="transition-all duration-500"
          opacity={active ? 0.95 : 0.7}
        />
        <circle
          cx="12"
          cy="19.5"
          r="1.1"
          fill="#8DE8BF"
          className="transition-all duration-500"
          opacity={active ? 0.85 : 0.55}
        />
        <circle
          cx="5.5"
          cy="15.5"
          r="1.25"
          fill="#42C98A"
          className="transition-all duration-500"
          opacity={active ? 0.95 : 0.7}
        />
        <circle
          cx="5.5"
          cy="8.5"
          r="1.1"
          fill="#167A55"
          className="transition-all duration-500"
          opacity={active ? 0.9 : 0.6}
        />
        {/* Microscopic focal pivot */}
        <circle
          cx="12"
          cy="12"
          r="0.85"
          fill="#167A55"
          opacity={active ? 0.9 : 0.4}
        />
      </svg>
    </div>
  );
}

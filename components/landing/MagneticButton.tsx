"use client";

import React, { useRef, useState, useEffect } from "react";
import { useEnvironment } from "./EnvironmentContext";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  magneticRadius?: number;
  magneticPull?: number;
  cursorMode?: "button" | "send";
}

export function MagneticButton({
  children,
  className = "",
  onClick,
  magneticRadius = 85,
  magneticPull = 0.28,
  cursorMode = "button",
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const { setCursorMode, setAttractor, clearAttractor, triggerRipple } = useEnvironment();

  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.hypot(dx, dy);

      if (dist < magneticRadius) {
        // Magnetic pull toward mouse
        const pullFactor = (1 - dist / magneticRadius) * magneticPull;
        const moveX = dx * pullFactor;
        const moveY = dy * pullFactor;
        setTransform({ x: moveX, y: moveY });
        setIsHovered(true);
        setCursorMode(cursorMode);
        setAttractor(centerX, centerY, 0.8, 140);
      } else if (isHovered) {
        setTransform({ x: 0, y: 0 });
        setIsHovered(false);
        setCursorMode("default");
        clearAttractor();
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [magneticRadius, magneticPull, isHovered, cursorMode, setCursorMode, setAttractor, clearAttractor]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      triggerRipple(rect.left + rect.width / 2, rect.top + rect.height / 2, "button", 300);
    }
    if (onClick) onClick(e);
  };

  return (
    <div
      ref={buttonRef}
      onClick={handleClick}
      style={{
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition: isHovered
          ? "transform 0.12s cubic-bezier(0.2, 0.8, 0.2, 1)"
          : "transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      }}
      className={`inline-block ${className}`}
    >
      {children}
    </div>
  );
}

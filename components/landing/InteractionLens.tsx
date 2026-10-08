"use client";

import React, { useEffect, useRef } from "react";
import { useEnvironment } from "./EnvironmentContext";

export function InteractionLens() {
  const lensRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const { stateRef } = useEnvironment();

  useEffect(() => {
    // Only run on non-touch devices with fine pointers
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    let animId: number;
    let currX = -100;
    let currY = -100;
    let currScale = 1;
    let currOpacity = 0;

    const render = () => {
      const mouse = stateRef.current.mouse;
      const mode = stateRef.current.cursorMode;
      const isDown = mouse.isDown;

      if (!mouse.isHovering || mouse.targetX < -50) {
        currOpacity += (0 - currOpacity) * 0.1;
      } else {
        currOpacity += (1 - currOpacity) * 0.15;
      }

      // Smooth spring follow with velocity inertia
      const spring = mode === "button" ? 0.32 : 0.22;
      currX += (mouse.targetX - currX) * spring;
      currY += (mouse.targetY - currY) * spring;

      // Dynamic scale based on speed & mode
      let targetScale = 1.0;
      if (mode === "button") targetScale = 0.75;
      else if (mode === "send") targetScale = 0.85;
      else if (mode === "glass") targetScale = 1.15;
      else if (mode === "particles") targetScale = 1.25;

      // Stretch slightly with velocity
      const speed = Math.hypot(mouse.vx, mouse.vy);
      targetScale += Math.min(speed * 0.15, 0.35);

      if (isDown) targetScale *= 0.88;

      currScale += (targetScale - currScale) * 0.18;

      if (lensRef.current) {
        lensRef.current.style.transform = `translate3d(${currX}px, ${currY}px, 0) scale(${currScale})`;
        lensRef.current.style.opacity = `${currOpacity}`;

        // Contextual styling via classes/dataset
        lensRef.current.dataset.mode = mode;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [stateRef]);

  return (
    <div
      ref={lensRef}
      className="pointer-events-none fixed top-0 left-0 -ml-10 -mt-10 w-20 h-20 rounded-full z-[100] transition-opacity duration-300 will-change-transform flex items-center justify-center opacity-0 group"
      style={{ backfaceVisibility: "hidden" }}
    >
      {/* Outer subtle optical refraction ring */}
      <div
        ref={ringRef}
        className="absolute inset-0 rounded-full border border-[rgba(66,201,138,0.22)] bg-[radial-gradient(circle_at_center,rgba(200,245,222,0.12)_0%,rgba(66,201,138,0.03)_50%,transparent_75%)] backdrop-contrast-[1.04] backdrop-brightness-[1.01] transition-all duration-200"
      />

      {/* Dynamic secondary aura indicator */}
      <div className="absolute inset-2 rounded-full border border-[rgba(23,25,28,0.06)] opacity-60" />

      {/* Micro-gravitational core mark */}
      <div
        ref={dotRef}
        className="w-1.5 h-1.5 rounded-full bg-[#167A55]/40 transition-all duration-150"
      />
    </div>
  );
}

"use client";

import React, { useEffect, useRef } from "react";

interface IntelligenceMarkProps {
  size?: number;
  active?: boolean;
  isTyping?: boolean;
  className?: string;
}

export function IntelligenceMark({
  size = 24,
  active = false,
  isTyping = false,
  className = "",
}: IntelligenceMarkProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const centerX = size / 2;
    const centerY = size / 2;
    const centerRadius = size * 0.12;

    // 3 orbital satellite nodes with varied phases and radiuses
    const nodes = [
      { radius: size * 0.32, angle: 0, speed: 0.024, size: size * 0.09, r: 66, g: 201, b: 138 },
      { radius: size * 0.42, angle: Math.PI * 0.7, speed: -0.018, size: size * 0.08, r: 141, g: 232, b: 191 },
      { radius: size * 0.24, angle: Math.PI * 1.4, speed: 0.032, size: size * 0.07, r: 22, g: 122, b: 185 },
    ];

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min(now - lastTime, 40);
      lastTime = now;

      ctx.clearRect(0, 0, size, size);

      // Speed multiplier based on system activity
      const speedMult = active ? 2.4 : isTyping ? 1.9 : 1.0;

      // 1. Draw central deep emerald nucleus
      const corePulse = Math.sin(now * 0.003) * 0.15 + 1.0;
      ctx.fillStyle = "rgba(22, 122, 85, 0.9)";
      ctx.beginPath();
      ctx.arc(centerX, centerY, centerRadius * (active ? 1.25 : corePulse), 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw subtle gravitational field ring
      ctx.strokeStyle = active
        ? "rgba(66, 201, 138, 0.45)"
        : "rgba(23, 25, 28, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, size * 0.36, 0, Math.PI * 2);
      ctx.stroke();

      // 3. Draw orbiting particle nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.angle += n.speed * (dt / 16) * speedMult;

        const nx = centerX + Math.cos(n.angle) * n.radius;
        const ny = centerY + Math.sin(n.angle) * n.radius;

        // Draw node
        ctx.fillStyle = `rgba(${n.r}, ${n.g}, ${n.b}, ${active ? 0.95 : 0.75})`;
        ctx.beginPath();
        ctx.arc(nx, ny, n.size, 0, Math.PI * 2);
        ctx.fill();

        // Faint orbital tether to nucleus
        if (active || isTyping) {
          ctx.strokeStyle = `rgba(${n.r}, ${n.g}, ${n.b}, 0.22)`;
          ctx.lineWidth = 0.75;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(nx, ny);
          ctx.stroke();
        }
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [size, active, isTyping]);

  return (
    <div
      className={`inline-flex items-center justify-center select-none relative ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block pointer-events-none" />
    </div>
  );
}

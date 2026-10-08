"use client";

import React, { useEffect, useRef } from "react";

interface GrainParticle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  colorType: "grain" | "emerald";
  wanderAngle: number;
  wanderSpeed: number;
}

/**
 * InteractiveGrainField
 * 
 * An authentic tactile micro-grain & fluid particle field.
 * Reacts dynamically to mouse movement with swirl turbulence, curl forces,
 * and velocity-dependent dispersal, similar to the Antigravity interactive grain experience.
 */
export function InteractiveGrainField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse tracking with velocity & speed
    const mouse = {
      x: -9999,
      y: -9999,
      lastX: -9999,
      lastY: -9999,
      vx: 0,
      vy: 0,
      speed: 0,
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const curX = e.clientX;
      const curY = e.clientY;

      if (mouse.lastX !== -9999) {
        mouse.vx = curX - mouse.lastX;
        mouse.vy = curY - mouse.lastY;
        mouse.speed = Math.hypot(mouse.vx, mouse.vy);
      }

      mouse.x = curX;
      mouse.y = curY;
      mouse.lastX = curX;
      mouse.lastY = curY;
    };

    const handleMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
      mouse.vx = 0;
      mouse.vy = 0;
      mouse.speed = 0;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    // Generate balanced density of micro-grain particles
    let particles: GrainParticle[] = [];

    const initParticles = () => {
      // Density: ~1 particle per 1400 sq px (~700 - 900 on 1080p desktop)
      const count = Math.min(1100, Math.max(450, Math.floor((width * height) / 1500)));
      particles = [];

      for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const isEmerald = Math.random() < 0.22; // 22% subtle emerald specs

        particles.push({
          x,
          y,
          originX: x,
          originY: y,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: Math.random() < 0.75 ? Math.random() * 0.7 + 0.6 : Math.random() * 1.1 + 0.9,
          baseAlpha: Math.random() * 0.22 + 0.08,
          alpha: Math.random() * 0.22 + 0.08,
          colorType: isEmerald ? "emerald" : "grain",
          wanderAngle: Math.random() * Math.PI * 2,
          wanderSpeed: (Math.random() - 0.5) * 0.02,
        });
      }
    };

    initParticles();

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min(now - lastTime, 40);
      lastTime = now;

      // Mouse speed decay
      mouse.vx *= 0.88;
      mouse.vy *= 0.88;
      mouse.speed *= 0.88;

      ctx.clearRect(0, 0, width, height);

      const influenceRadius = Math.min(220, Math.max(140, 140 + mouse.speed * 2.5));

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 1. Natural Organic Brownian Drift
        p.wanderAngle += p.wanderSpeed;
        p.vx += Math.cos(p.wanderAngle) * 0.035;
        p.vy += Math.sin(p.wanderAngle) * 0.035;

        // 2. Interactive Cursor Turbulence & Swirl Wake
        if (mouse.x !== -9999) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < influenceRadius && dist > 0) {
            const factor = 1 - dist / influenceRadius; // 1 at center, 0 at boundary
            const normX = dx / dist;
            const normY = dy / dist;

            // Direct repulsion (grains push away from cursor path)
            const repelForce = factor * (1.8 + mouse.speed * 0.08);
            p.vx += normX * repelForce;
            p.vy += normY * repelForce;

            // Tangential curl force (vortex swirl around moving pointer)
            const curlDir = mouse.vx * normY - mouse.vy * normX > 0 ? 1 : -1;
            const swirlForce = factor * (0.8 + mouse.speed * 0.05);
            p.vx += -normY * swirlForce * curlDir;
            p.vy += normX * swirlForce * curlDir;

            // Illuminate particles caught in the cursor's energy wake
            p.alpha = Math.min(0.65, p.baseAlpha + factor * 0.45);
          } else {
            // Smooth fade back to base opacity
            p.alpha += (p.baseAlpha - p.alpha) * 0.04;
          }
        } else {
          p.alpha += (p.baseAlpha - p.alpha) * 0.04;
        }

        // 3. Physical Friction / Drag
        p.vx *= 0.93;
        p.vy *= 0.93;

        // 4. Update Position
        p.x += p.vx;
        p.y += p.vy;

        // 5. Screen Boundary Wrapping
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // 6. Draw Microscopic Grain Spec
        if (p.colorType === "emerald") {
          ctx.fillStyle = `rgba(22, 122, 85, ${p.alpha})`;
        } else {
          ctx.fillStyle = `rgba(23, 25, 28, ${p.alpha})`;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-10 overflow-hidden select-none"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full mix-blend-multiply opacity-90"
      />
    </div>
  );
}

"use client";

import React, { useEffect, useRef } from "react";

/**
 * LivingAtmosphere
 * 
 * An Active Theory-grade living spatial atmosphere for Tusk.
 * Soft warm off-white canvas with liquid emerald membranes, responsive to cursor
 * energy and scroll velocity. Does not compete with content; creates breathing room.
 */
export function LivingAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates with silky inertia
    const mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2, vx: 0, vy: 0 };
    // Scroll tracking
    let scrollY = window.scrollY;
    let scrollVelocity = 0;
    let lastScrollY = window.scrollY;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      scrollVelocity = (currentScroll - lastScrollY) * 0.5;
      lastScrollY = currentScroll;
      scrollY = currentScroll;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Floating ambient light blobs
    const membranes = [
      {
        baseX: 0.25,
        baseY: 0.28,
        radius: 360,
        color: "rgba(141, 232, 191, 0.16)",
        speedX: 0.0008,
        speedY: 0.0006,
        phase: 0,
      },
      {
        baseX: 0.75,
        baseY: 0.42,
        radius: 420,
        color: "rgba(66, 201, 138, 0.11)",
        speedX: -0.0006,
        speedY: 0.0009,
        phase: Math.PI * 0.5,
      },
      {
        baseX: 0.45,
        baseY: 0.78,
        radius: 380,
        color: "rgba(200, 245, 222, 0.14)",
        speedX: 0.0007,
        speedY: -0.0007,
        phase: Math.PI,
      },
    ];

    // Subtle ambient particle coordinates (subtle trapped dust)
    const particles = Array.from({ length: 22 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 1.5 + 0.8,
      opacity: Math.random() * 0.25 + 0.08,
    }));

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min(now - lastTime, 40);
      lastTime = now;

      // Mouse spring inertia
      mouse.vx = (mouse.targetX - mouse.x) * 0.045;
      mouse.vy = (mouse.targetY - mouse.y) * 0.045;
      mouse.x += mouse.vx;
      mouse.y += mouse.vy;

      // Decay scroll velocity
      scrollVelocity *= 0.92;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Liquid Emerald Light Membranes
      membranes.forEach((m, idx) => {
        const time = now * 0.001;
        const driftX = Math.sin(time * m.speedX * 1000 + m.phase) * 60;
        const driftY = Math.cos(time * m.speedY * 1000 + m.phase) * 50;

        // Subtle mouse pull & scroll displacement
        const pullX = (mouse.x - width / 2) * 0.05 * (idx + 1);
        const pullY = (mouse.y - height / 2) * 0.05 * (idx + 1) + scrollVelocity * 1.5;

        const cx = width * m.baseX + driftX + pullX;
        const cy = height * m.baseY + driftY + pullY;

        const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, m.radius);
        radGrad.addColorStop(0, m.color);
        radGrad.addColorStop(0.5, m.color.replace(/[\d\.]+\)$/, "0.05)"));
        radGrad.addColorStop(1, "rgba(247, 247, 245, 0)");

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, m.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Cursor Energy Aura (Soft Point of Illumination)
      const cursorGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 220);
      cursorGlow.addColorStop(0, "rgba(200, 245, 222, 0.12)");
      cursorGlow.addColorStop(0.6, "rgba(141, 232, 191, 0.04)");
      cursorGlow.addColorStop(1, "rgba(247, 247, 245, 0)");
      ctx.fillStyle = cursorGlow;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 220, 0, Math.PI * 2);
      ctx.fill();

      // 3. Subtle Atmospheric Data Particles (Part gently around cursor)
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy - scrollVelocity * 0.2;

        // Wrap edges
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Repel gently from cursor
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 140 && dist > 0) {
          const force = (1 - dist / 140) * 1.8;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }

        ctx.fillStyle = `rgba(22, 122, 85, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Background Substrate */}
      <div className="absolute inset-0 bg-[#F7F7F5]" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}

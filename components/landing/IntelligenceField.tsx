"use client";

import React, { useEffect, useRef, useCallback } from "react";

interface IntelligenceFieldProps {
  chatbotAnchorId?: string;
  isTyping?: boolean;
  sendSignalTimestamp?: number;
}

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  r: number;
  g: number;
  b: number;
  phase: number;
  speed: number;
}

interface MouseTrailPoint {
  x: number;
  y: number;
  timestamp: number;
  strength: number;
}

export function IntelligenceField({
  chatbotAnchorId = "chatbot-hero-anchor",
  isTyping = false,
  sendSignalTimestamp = 0,
}: IntelligenceFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Mouse physical force tracking
  const mouseRef = useRef({
    x: -9999,
    y: -9999,
    targetX: -9999,
    targetY: -9999,
    vx: 0,
    vy: 0,
    lastTime: performance.now(),
    isHovering: false,
  });

  // Recent movement memory trail
  const trailRef = useRef<MouseTrailPoint[]>([]);

  // Send signal wave expansion tracking
  const signalWavesRef = useRef<Array<{ x: number; y: number; radius: number; maxRadius: number; strength: number }>>([]);

  useEffect(() => {
    if (sendSignalTimestamp > 0) {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const anchorEl = document.getElementById(chatbotAnchorId);
        let originX = rect.width / 2;
        let originY = rect.height / 2;
        if (anchorEl) {
          const aRect = anchorEl.getBoundingClientRect();
          originX = aRect.left - rect.left + aRect.width / 2;
          originY = aRect.top - rect.top + aRect.height * 0.85;
        }
        signalWavesRef.current.push({
          x: originX,
          y: originY,
          radius: 10,
          maxRadius: Math.max(rect.width, rect.height) * 0.75,
          strength: 1.0,
        });
      }
    }
  }, [sendSignalTimestamp, chatbotAnchorId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 320 : 850;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Color palette: Soft Emerald (#42C98A), Light Mint (#8DE8BF), Deep Emerald (#167A55)
    const emeraldRGB = [66, 201, 138];
    const mintRGB = [141, 232, 191];
    const deepRGB = [22, 122, 85];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      initParticles();
    };

    const getCenterOfGravity = () => {
      const anchor = document.getElementById(chatbotAnchorId);
      if (anchor) {
        const aRect = anchor.getBoundingClientRect();
        const cRect = canvas.getBoundingClientRect();
        return {
          x: aRect.left - cRect.left + aRect.width / 2,
          y: aRect.top - cRect.top + aRect.height / 2,
          width: aRect.width,
          height: aRect.height,
        };
      }
      return { x: width / 2, y: height * 0.48, width: 420, height: 380 };
    };

    const initParticles = () => {
      particles = [];
      const cog = getCenterOfGravity();

      for (let i = 0; i < particleCount; i++) {
        // Distribute with organic density biased toward the chatbot center of gravity
        const angle = Math.random() * Math.PI * 2;
        // Non-linear bias: 55% clustered near chatbot, 45% gently diffusing outward
        const isCluster = Math.random() < 0.58;
        const dist = isCluster
          ? (Math.random() * 0.65 + 0.1) * Math.max(cog.width, cog.height) * 0.95
          : Math.random() * Math.max(width, height) * 0.68;

        const x = cog.x + Math.cos(angle) * dist * (1 + (Math.random() - 0.5) * 0.35);
        const y = cog.y + Math.sin(angle) * dist * (1 + (Math.random() - 0.5) * 0.35);

        // Calculate proximity ratio to center (0 = at center, 1 = outer edge)
        const dCenter = Math.hypot(x - cog.x, y - cog.y);
        const normDist = Math.min(dCenter / (Math.max(width, height) * 0.5), 1);

        // Emerald intensity: closer = deeper emerald; farther = lighter mint
        let color = mintRGB;
        if (normDist < 0.28) {
          color = Math.random() < 0.6 ? deepRGB : emeraldRGB;
        } else if (normDist < 0.6) {
          color = Math.random() < 0.5 ? emeraldRGB : mintRGB;
        }

        // Microscopic radii: 0.7px to 1.7px
        const radius = 0.75 + Math.random() * 0.95;
        // Base alpha: subtle, quiet (0.08 to 0.42)
        const baseAlpha = (1 - normDist * 0.75) * (0.12 + Math.random() * 0.28);

        particles.push({
          x,
          y,
          originX: x,
          originY: y,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          radius,
          baseAlpha,
          alpha: baseAlpha,
          r: color[0],
          g: color[1],
          b: color[2],
          phase: Math.random() * Math.PI * 2,
          speed: 0.0006 + Math.random() * 0.0008,
        });
      }
    };

    // Mouse movement listener
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const newX = e.clientX - rect.left;
      const newY = e.clientY - rect.top;
      const now = performance.now();
      const dt = Math.max(now - mouseRef.current.lastTime, 16);

      // Track velocity with damping
      const rawVx = (newX - mouseRef.current.x) / dt;
      const rawVy = (newY - mouseRef.current.y) / dt;
      mouseRef.current.vx = mouseRef.current.vx * 0.7 + rawVx * 0.3;
      mouseRef.current.vy = mouseRef.current.vy * 0.7 + rawVy * 0.3;

      mouseRef.current.targetX = newX;
      mouseRef.current.targetY = newY;
      mouseRef.current.lastTime = now;
      mouseRef.current.isHovering = true;

      // Add point to memory trail (capped at 25 points)
      trailRef.current.push({
        x: newX,
        y: newY,
        timestamp: now,
        strength: Math.min(Math.hypot(rawVx, rawVy) * 1.5 + 0.3, 1.4),
      });
      if (trailRef.current.length > 25) {
        trailRef.current.shift();
      }
    };

    const onMouseLeave = () => {
      mouseRef.current.isHovering = false;
      mouseRef.current.targetX = -9999;
      mouseRef.current.targetY = -9999;
      mouseRef.current.vx = 0;
      mouseRef.current.vy = 0;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    resize();

    // Render loop
    let lastFrame = performance.now();

    const render = (now: number) => {
      if (document.hidden) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation (spring physics with inertia)
      if (mouseRef.current.isHovering) {
        mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.12;
        mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.12;
        // Decay velocity
        mouseRef.current.vx *= 0.94;
        mouseRef.current.vy *= 0.94;
      }

      // Expire mouse memory trail points older than 1800ms
      trailRef.current = trailRef.current.filter((pt) => now - pt.timestamp < 1800);

      // AI Breathing factor (slow sine wave between -0.06 and +0.06)
      const breathing = Math.sin(now * 0.00075) * 0.08;
      // Typing activation multiplier (gently increases density and alignment)
      const typingBoost = isTyping ? 1.25 : 1.0;

      // Update signal waves (from send interaction)
      for (let i = signalWavesRef.current.length - 1; i >= 0; i--) {
        const wave = signalWavesRef.current[i];
        wave.radius += 5.5;
        wave.strength = Math.max(0, 1 - wave.radius / wave.maxRadius);
        if (wave.radius >= wave.maxRadius) {
          signalWavesRef.current.splice(i, 1);
        }
      }

      const mouseSpeed = Math.hypot(mouseRef.current.vx, mouseRef.current.vy);
      const forceRadius = Math.min(140 + mouseSpeed * 90, 220);

      // Render & update each microscopic particle
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          // Subtle natural drift
          p.phase += p.speed;
          const driftX = Math.cos(p.phase) * 0.35;
          const driftY = Math.sin(p.phase * 1.3) * 0.35;

          // Mouse physical force interaction
          let forceX = 0;
          let forceY = 0;

          if (mouseRef.current.isHovering) {
            const dx = p.x - mouseRef.current.x;
            const dy = p.y - mouseRef.current.y;
            const dist = Math.hypot(dx, dy);

            if (dist < forceRadius && dist > 1) {
              const norm = 1 - dist / forceRadius;
              // Gentle displacement along velocity vector plus slight radial bend
              const push = norm * norm * (1.2 + mouseSpeed * 1.8);
              forceX += (dx / dist) * push * 0.85 + mouseRef.current.vx * norm * 0.6;
              forceY += (dy / dist) * push * 0.85 + mouseRef.current.vy * norm * 0.6;
            }
          }

          // Mouse memory trail disturbance
          for (let t = 0; t < trailRef.current.length; t++) {
            const pt = trailRef.current[t];
            const ageRatio = 1 - (now - pt.timestamp) / 1800;
            const dpt = Math.hypot(p.x - pt.x, p.y - pt.y);
            if (dpt < 65) {
              const push = (1 - dpt / 65) * 0.45 * ageRatio * pt.strength;
              forceX += (Math.random() - 0.5) * push;
              forceY += (Math.random() - 0.5) * push;
            }
          }

          // Outward disturbance wave from send trigger
          for (let w = 0; w < signalWavesRef.current.length; w++) {
            const wave = signalWavesRef.current[w];
            const dw = Math.hypot(p.x - wave.x, p.y - wave.y);
            const distFromCrest = Math.abs(dw - wave.radius);
            if (distFromCrest < 35 && dw > 0) {
              const crestFactor = (1 - distFromCrest / 35) * wave.strength * 2.2;
              forceX += ((p.x - wave.x) / dw) * crestFactor;
              forceY += ((p.y - wave.y) / dw) * crestFactor;
            }
          }

          // Spring return to origin with damping
          const springK = 0.018;
          const damping = 0.88;

          p.vx = (p.vx + (p.originX - p.x) * springK + forceX + driftX) * damping;
          p.vy = (p.vy + (p.originY - p.y) * springK + forceY + driftY) * damping;

          p.x += p.vx;
          p.y += p.vy;
        }

        // Modulate alpha with breathing and interaction lens
        let currentAlpha = p.baseAlpha * (1 + breathing) * typingBoost;

        // Cursor Lens: sharpen/clarify particles within lens radius (85px)
        if (mouseRef.current.isHovering) {
          const dMouse = Math.hypot(p.x - mouseRef.current.x, p.y - mouseRef.current.y);
          if (dMouse < 90) {
            const lensBonus = (1 - dMouse / 90) * 0.35;
            currentAlpha = Math.min(currentAlpha + lensBonus, 0.75);
          }
        }

        // Draw particle
        ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${Math.max(0.02, currentAlpha)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [chatbotAnchorId, isTyping]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}

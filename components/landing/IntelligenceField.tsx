"use client";

import React, { useEffect, useRef } from "react";
import { useEnvironment, RippleTrigger } from "./EnvironmentContext";

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  mass: number;
  radius: number;
  baseAlpha: number;
  r: number;
  g: number;
  b: number;
  phase: number;
  driftSpeed: number;
  flowWeight: number;
}

interface MemoryTrailPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angularV: number;
  timestamp: number;
  strength: number;
}

export function IntelligenceField({
  chatbotAnchorId = "chatbot-hero-anchor",
}: {
  chatbotAnchorId?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const { stateRef } = useEnvironment();

  // Trail buffer of recent mouse path
  const trailRef = useRef<MemoryTrailPoint[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];

    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 520 : 1250;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Palette: Soft Emerald (#42C98A), Light Mint (#8DE8BF), Deep Emerald (#167A55)
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
      return { x: width / 2, y: height * 0.45, width: 480, height: 420 };
    };

    const initParticles = () => {
      particles = [];
      const cog = getCenterOfGravity();

      for (let i = 0; i < particleCount; i++) {
        // Multi-tier distribution:
        // 55% dense near chatbot gravity well, 30% intermediate ambient haze, 15% outer perimeter
        const roll = Math.random();
        let x = 0;
        let y = 0;

        if (roll < 0.55) {
          // Clustered around chatbot with organic eccentricity
          const angle = Math.random() * Math.PI * 2;
          const dist = (Math.random() * 0.75 + 0.08) * Math.max(cog.width, cog.height) * 0.88;
          x = cog.x + Math.cos(angle) * dist * (1 + (Math.random() - 0.5) * 0.4);
          y = cog.y + Math.sin(angle) * dist * (1 + (Math.random() - 0.5) * 0.4);
        } else if (roll < 0.85) {
          // Mid-range atmospheric field
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * Math.max(width, height) * 0.58;
          x = cog.x + Math.cos(angle) * dist;
          y = cog.y + Math.sin(angle) * dist;
        } else {
          // Page wide dust
          x = Math.random() * width;
          y = Math.random() * height;
        }

        const dCenter = Math.hypot(x - cog.x, y - cog.y);
        const normDist = Math.min(dCenter / (Math.max(width, height) * 0.52), 1);

        // Color gradation based on proximity to center of gravity
        let color = mintRGB;
        if (normDist < 0.25) {
          color = Math.random() < 0.65 ? deepRGB : emeraldRGB;
        } else if (normDist < 0.55) {
          color = Math.random() < 0.55 ? emeraldRGB : mintRGB;
        }

        // Variable microscopic sizes
        const radius = 0.65 + Math.random() * 1.35;
        const mass = radius * 1.3;
        const baseAlpha = (1 - normDist * 0.78) * (0.12 + Math.random() * 0.35);

        particles.push({
          x,
          y,
          originX: x,
          originY: y,
          vx: (Math.random() - 0.5) * 0.1,
          vy: (Math.random() - 0.5) * 0.1,
          mass,
          radius,
          baseAlpha,
          r: color[0],
          g: color[1],
          b: color[2],
          phase: Math.random() * Math.PI * 2,
          driftSpeed: 0.0005 + Math.random() * 0.0008,
          flowWeight: 0.4 + Math.random() * 0.6,
        });
      }
    };

    // Tracking mouse & touch movements with velocity and angular momentum
    const handlePointerMove = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const newX = clientX - rect.left;
      const newY = clientY - rect.top;
      const now = performance.now();
      const mouse = stateRef.current.mouse;
      const dt = Math.max(now - (mouse.lastTime || now), 16);

      const rawVx = (newX - mouse.x) / dt;
      const rawVy = (newY - mouse.y) / dt;
      mouse.vx = mouse.vx * 0.65 + rawVx * 0.35;
      mouse.vy = mouse.vy * 0.65 + rawVy * 0.35;
      mouse.speed = Math.hypot(mouse.vx, mouse.vy);

      // Angular velocity calculation (detect circling motions!)
      const dx = newX - mouse.x;
      const dy = newY - mouse.y;
      const currentAngle = Math.atan2(dy, dx);
      if (mouse.lastAngle !== 0) {
        let deltaAngle = currentAngle - mouse.lastAngle;
        if (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
        if (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2;
        mouse.angularVelocity = mouse.angularVelocity * 0.7 + (deltaAngle / dt) * 0.3;
      }
      mouse.lastAngle = currentAngle;

      mouse.targetX = newX;
      mouse.targetY = newY;
      mouse.lastTime = now;
      mouse.isHovering = true;

      // Add to mouse memory trail (ring buffer up to 40 points)
      trailRef.current.push({
        x: newX,
        y: newY,
        vx: mouse.vx,
        vy: mouse.vy,
        angularV: mouse.angularVelocity,
        timestamp: now,
        strength: Math.min(mouse.speed * 2.0 + 0.4, 2.2),
      });

      if (trailRef.current.length > 40) {
        trailRef.current.shift();
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY);
    };

    const onMouseDown = (e: MouseEvent) => {
      stateRef.current.mouse.isDown = true;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Trigger click physical ripple
      stateRef.current.ripples.push({
        id: Date.now(),
        x,
        y,
        radius: 6,
        maxRadius: 280,
        strength: 0.9,
        type: "click",
      });
    };

    const onMouseUp = () => {
      stateRef.current.mouse.isDown = false;
    };

    const onMouseLeave = () => {
      const mouse = stateRef.current.mouse;
      mouse.isHovering = false;
      mouse.targetX = -9999;
      mouse.targetY = -9999;
      mouse.vx = 0;
      mouse.vy = 0;
      mouse.speed = 0;
      mouse.angularVelocity = 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        handlePointerMove(touch.clientX, touch.clientY);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        handlePointerMove(touch.clientX, touch.clientY);
      }
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);

    resize();

    // Render loop with high precision physics
    const render = (now: number) => {
      if (document.hidden) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const env = stateRef.current;
      const mouse = env.mouse;
      const cog = getCenterOfGravity();
      const glassBounds = env.glassBounds;

      // Mouse position spring interpolation
      if (mouse.isHovering) {
        mouse.x += (mouse.targetX - mouse.x) * 0.16;
        mouse.y += (mouse.targetY - mouse.y) * 0.16;
        mouse.vx *= 0.93;
        mouse.vy *= 0.93;
        mouse.angularVelocity *= 0.92;
      }

      // Expire memory trail points older than 2200ms
      trailRef.current = trailRef.current.filter((pt) => now - pt.timestamp < 2200);

      // AI Breathing factor (compound harmonic waves)
      const breathing =
        Math.sin(now * 0.0006) * 0.07 + Math.sin(now * 0.0013 + 1.2) * 0.03;

      // Typing or Input Focus organization boost
      const focusMultiplier = env.inputFocused ? 1.35 : env.isTyping ? 1.25 : 1.0;

      // Update active ripples / shockwaves
      for (let rIdx = env.ripples.length - 1; rIdx >= 0; rIdx--) {
        const rip = env.ripples[rIdx];
        rip.radius += rip.type === "send" ? 7.5 : 5.0;
        rip.strength = Math.max(0, 1 - rip.radius / rip.maxRadius);
        if (rip.radius >= rip.maxRadius) {
          env.ripples.splice(rIdx, 1);
        }
      }

      const mouseSpeed = mouse.speed;
      const vortexStrength = mouse.angularVelocity;

      // Multi-radius zone radii
      const zone1Radius = Math.min(48 + mouseSpeed * 25, 75);
      const zone2Radius = Math.min(150 + mouseSpeed * 80, 230);
      const zone3Radius = Math.min(280 + mouseSpeed * 120, 360);

      // Render & update each particle
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          // 1. COMPOUND ORGANIC VECTOR FLOWS
          p.phase += p.driftSpeed;
          // Flow A: gentle diagonal drift
          const flowAx = Math.cos(p.phase + p.originY * 0.003) * 0.22 * p.flowWeight;
          const flowAy = Math.sin(p.phase * 1.2 + p.originX * 0.003) * 0.18 * p.flowWeight;

          // Flow B: organic circulation around chatbot gravity well
          const cdx = p.x - cog.x;
          const cdy = p.y - cog.y;
          const cDist = Math.hypot(cdx, cdy);
          let orbitVx = 0;
          let orbitVy = 0;
          if (cDist > 20 && cDist < Math.max(cog.width, cog.height) * 1.2) {
            const orbitFactor = (1 - cDist / (Math.max(cog.width, cog.height) * 1.2)) * 0.28;
            // Tangential swirl vector (-cdy, cdx)
            orbitVx = (-cdy / cDist) * orbitFactor;
            orbitVy = (cdx / cDist) * orbitFactor;
            // Gentle inward gravity pull
            orbitVx -= (cdx / cDist) * 0.04;
            orbitVy -= (cdy / cDist) * 0.04;
          }

          // 2. LAYER 1 & 4: MULTI-RADIUS MOUSE PHYSICAL FORCES
          let forceX = 0;
          let forceY = 0;

          if (mouse.isHovering) {
            const mdx = p.x - mouse.x;
            const mdy = p.y - mouse.y;
            const mDist = Math.hypot(mdx, mdy);

            if (mDist < zone3Radius && mDist > 0.5) {
              if (mDist < zone1Radius) {
                // Zone 1 (Immediate Core): Strong repulsion + momentum push
                const norm = 1 - mDist / zone1Radius;
                const push = (norm * norm * 3.2) / p.mass;
                forceX += (mdx / mDist) * push + mouse.vx * norm * 1.2;
                forceY += (mdy / mDist) * push + mouse.vy * norm * 1.2;
              } else if (mDist < zone2Radius) {
                // Zone 2 (Middle Shear): Viscous drag + trailing velocity wake
                const norm = 1 - (mDist - zone1Radius) / (zone2Radius - zone1Radius);
                const push = (norm * 1.2) / p.mass;
                forceX += (mdx / mDist) * push * 0.4 + mouse.vx * norm * 0.8;
                forceY += (mdy / mDist) * push * 0.4 + mouse.vy * norm * 0.8;

                // LAYER 3 CIRCLING VORTEX EDDY (Angular momentum transfer)
                if (Math.abs(vortexStrength) > 0.001) {
                  const vortexFactor = vortexStrength * norm * 45;
                  forceX += (-mdy / mDist) * vortexFactor;
                  forceY += (mdx / mDist) * vortexFactor;
                }
              } else {
                // Zone 3 (Outer Zone): Gentle atmospheric displacement
                const norm = 1 - (mDist - zone2Radius) / (zone3Radius - zone2Radius);
                forceX += (mdx / mDist) * norm * 0.15;
                forceY += (mdy / mDist) * norm * 0.15;
              }
            }
          }

          // 3. LAYER 3: MOUSE MEMORY TRAIL DISTURBANCE
          for (let t = 0; t < trailRef.current.length; t++) {
            const pt = trailRef.current[t];
            const age = now - pt.timestamp;
            const ageRatio = 1 - age / 2200;
            const tdx = p.x - pt.x;
            const tdy = p.y - pt.y;
            const tDist = Math.hypot(tdx, tdy);

            if (tDist < 85 && tDist > 1) {
              const trailPush = (1 - tDist / 85) * ageRatio * pt.strength * 0.4;
              forceX += (tdx / tDist) * trailPush + pt.vx * trailPush * 0.3;
              forceY += (tdy / tDist) * trailPush + pt.vy * trailPush * 0.3;

              if (Math.abs(pt.angularV) > 0.002) {
                const eddy = pt.angularV * ageRatio * 18;
                forceX += (-tdy / tDist) * eddy;
                forceY += (tdx / tDist) * eddy;
              }
            }
          }

          // 4. ATTRACTOR FORCE (Buttons / Send hover)
          if (env.attractor) {
            const adx = env.attractor.x - p.x;
            const ady = env.attractor.y - p.y;
            const aDist = Math.hypot(adx, ady);
            if (aDist < env.attractor.radius && aDist > 5) {
              const pull = (1 - aDist / env.attractor.radius) * env.attractor.strength * 0.75;
              forceX += (adx / aDist) * pull;
              forceY += (ady / aDist) * pull;
            }
          }

          // 5. SHOCKWAVE RIPPLES (Click & Send pulses)
          for (let r = 0; r < env.ripples.length; r++) {
            const rip = env.ripples[r];
            const rdx = p.x - rip.x;
            const rdy = p.y - rip.y;
            const rDist = Math.hypot(rdx, rdy);
            const distFromCrest = Math.abs(rDist - rip.radius);

            if (distFromCrest < 38 && rDist > 0) {
              const crestFactor =
                (1 - distFromCrest / 38) * rip.strength * (rip.type === "send" ? 3.0 : 1.6);
              forceX += (rdx / rDist) * crestFactor;
              forceY += (rdy / rDist) * crestFactor;
            }
          }

          // 6. SPRING RESTORATION WITH DAMPING & MASS
          const springK = 0.015 / p.mass;
          const damping = 0.89;

          p.vx = (p.vx + (p.originX - p.x) * springK + forceX + flowAx + orbitVx) * damping;
          p.vy = (p.vy + (p.originY - p.y) * springK + forceY + flowAy + orbitVy) * damping;

          p.x += p.vx;
          p.y += p.vy;
        }

        // Alpha calculation with breathing & focus
        let currentAlpha = p.baseAlpha * (1 + breathing) * focusMultiplier;

        // Gravitational Interaction Lens effect
        if (mouse.isHovering) {
          const dMouse = Math.hypot(p.x - mouse.x, p.y - mouse.y);
          if (dMouse < 95) {
            const lensBonus = (1 - dMouse / 95) * 0.42;
            currentAlpha = Math.min(currentAlpha + lensBonus, 0.82);
          }
        }

        // 7. OPTICAL GLASS REFRACTION & REVELATION
        let renderX = p.x;
        let renderY = p.y;
        let isBehindGlass = false;

        if (glassBounds) {
          const inGlassX = p.x >= glassBounds.x && p.x <= glassBounds.x + glassBounds.width;
          const inGlassY = p.y >= glassBounds.y && p.y <= glassBounds.y + glassBounds.height;

          if (inGlassX && inGlassY) {
            isBehindGlass = true;
            // Physical optical refraction: shift coordinates slightly along 3D tilt normal
            renderX += glassBounds.tiltY * 0.6;
            renderY -= glassBounds.tiltX * 0.6;
            // Under glass, slightly higher mint tint and softened transmission
            currentAlpha *= 0.65;
          }
        }

        // Draw the microscopic particle
        ctx.fillStyle = isBehindGlass
          ? `rgba(${mintRGB[0]}, ${mintRGB[1]}, ${mintRGB[2]}, ${Math.max(0.04, currentAlpha)})`
          : `rgba(${p.r}, ${p.g}, ${p.b}, ${Math.max(0.03, currentAlpha)})`;

        ctx.beginPath();
        ctx.arc(renderX, renderY, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("mouseleave", onMouseLeave);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [chatbotAnchorId, stateRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 will-change-transform"
      aria-hidden="true"
    />
  );
}

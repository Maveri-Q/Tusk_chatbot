"use client";

import React, { createContext, useContext, useRef, useCallback } from "react";

export type CursorMode =
  | "default"
  | "particles"
  | "glass"
  | "button"
  | "send"
  | "typing";

export interface RippleTrigger {
  id: number;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  strength: number;
  type: "click" | "send" | "compress" | "button";
}

export interface AttractorTarget {
  x: number;
  y: number;
  strength: number;
  radius: number;
}

export interface GlassBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  tiltX: number;
  tiltY: number;
  isHovered: boolean;
}

interface EnvironmentState {
  mouse: {
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    vx: number;
    vy: number;
    speed: number;
    angularVelocity: number;
    lastAngle: number;
    lastTime: number;
    isHovering: boolean;
    isDown: boolean;
  };
  cursorMode: CursorMode;
  ripples: RippleTrigger[];
  attractor: AttractorTarget | null;
  glassBounds: GlassBounds | null;
  isTyping: boolean;
  inputFocused: boolean;
}

interface EnvironmentContextValue {
  stateRef: React.MutableRefObject<EnvironmentState>;
  setCursorMode: (mode: CursorMode) => void;
  triggerRipple: (x: number, y: number, type?: RippleTrigger["type"], maxRadius?: number) => void;
  setAttractor: (x: number, y: number, strength?: number, radius?: number) => void;
  clearAttractor: () => void;
  updateGlassBounds: (bounds: Partial<GlassBounds>) => void;
  setIsTyping: (typing: boolean) => void;
  setInputFocused: (focused: boolean) => void;
}

const EnvironmentContext = createContext<EnvironmentContextValue | null>(null);

let rippleIdCounter = 0;

export function EnvironmentProvider({ children }: { children: React.ReactNode }) {
  const stateRef = useRef<EnvironmentState>({
    mouse: {
      x: -9999,
      y: -9999,
      targetX: -9999,
      targetY: -9999,
      vx: 0,
      vy: 0,
      speed: 0,
      angularVelocity: 0,
      lastAngle: 0,
      lastTime: 0,
      isHovering: false,
      isDown: false,
    },
    cursorMode: "default",
    ripples: [],
    attractor: null,
    glassBounds: null,
    isTyping: false,
    inputFocused: false,
  });

  const setCursorMode = useCallback((mode: CursorMode) => {
    stateRef.current.cursorMode = mode;
  }, []);

  const triggerRipple = useCallback(
    (x: number, y: number, type: RippleTrigger["type"] = "click", maxRadius = 380) => {
      stateRef.current.ripples.push({
        id: ++rippleIdCounter,
        x,
        y,
        radius: 8,
        maxRadius,
        strength: 1.0,
        type,
      });
    },
    []
  );

  const setAttractor = useCallback(
    (x: number, y: number, strength = 1.0, radius = 160) => {
      stateRef.current.attractor = { x, y, strength, radius };
    },
    []
  );

  const clearAttractor = useCallback(() => {
    stateRef.current.attractor = null;
  }, []);

  const updateGlassBounds = useCallback((bounds: Partial<GlassBounds>) => {
    if (!stateRef.current.glassBounds) {
      stateRef.current.glassBounds = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        tiltX: 0,
        tiltY: 0,
        isHovered: false,
        ...bounds,
      };
    } else {
      Object.assign(stateRef.current.glassBounds, bounds);
    }
  }, []);

  const setIsTyping = useCallback((typing: boolean) => {
    stateRef.current.isTyping = typing;
  }, []);

  const setInputFocused = useCallback((focused: boolean) => {
    stateRef.current.inputFocused = focused;
  }, []);

  return (
    <EnvironmentContext.Provider
      value={{
        stateRef,
        setCursorMode,
        triggerRipple,
        setAttractor,
        clearAttractor,
        updateGlassBounds,
        setIsTyping,
        setInputFocused,
      }}
    >
      {children}
    </EnvironmentContext.Provider>
  );
}

export function useEnvironment() {
  const ctx = useContext(EnvironmentContext);
  if (!ctx) {
    throw new Error("useEnvironment must be used within an EnvironmentProvider");
  }
  return ctx;
}

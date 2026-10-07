"use client";

import React from "react";
import { Sparkles, Moon, HelpCircle, Calendar, Send } from "lucide-react";

interface StarterChipsProps {
  onSelect: (prompt: string) => void;
}

export function StarterChips({ onSelect }: StarterChipsProps) {
  const starters = [
    {
      label: "Remember that I'm a night owl",
      icon: Moon,
    },
    {
      label: "What do you know about me?",
      icon: HelpCircle,
    },
    {
      label: "Plan my week",
      icon: Calendar,
    },
    {
      label: "Help me write a message",
      icon: Send,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-xl">
      {starters.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.label}
            onClick={() => onSelect(item.label)}
            className="flex items-center gap-2.5 p-3 rounded-sm bg-bg-elev border border-border hover:border-border-strong hover:bg-bg-elev-2 text-left transition-all group"
          >
            <div className="h-7 w-7 rounded bg-flare/10 border border-flare/20 flex items-center justify-center text-flare shrink-0 group-hover:scale-105 transition-transform">
              <Icon className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs text-text font-normal truncate">
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

"use client";

import React from "react";
import { Brain, PanelRight, ShieldAlert, Sparkles, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TopBarProps {
  onTogglePanel: () => void;
  onToggleSidebar: () => void;
  isPanelOpen: boolean;
  advancedTools: boolean;
  relayerStatus?: "ok" | "degraded" | "down";
}

export function TopBar({
  onTogglePanel,
  onToggleSidebar,
  isPanelOpen,
  advancedTools,
  relayerStatus = "ok",
}: TopBarProps) {
  return (
    <header className="h-14 glass-panel border-b border-border px-4 flex items-center justify-between z-20 sticky top-0">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-8 w-8 text-text"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation sidebar"
        >
          <Menu className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <span className="font-display font-semibold text-text text-sm sm:text-base">
            Conversation
          </span>
          <span className="text-xs text-text-muted hidden sm:inline">•</span>
          <span className="text-xs text-text-muted hidden sm:inline">
            Long-term memory active
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Advanced tools indicators (hidden by default) */}
        {advancedTools && (
          <div className="flex items-center gap-2 animate-in fade-in-0 duration-200">
            <Badge variant="outline" className="text-[11px] gap-1.5 py-0.5">
              <span
                className={`h-2 w-2 rounded-full ${
                  relayerStatus === "ok"
                    ? "bg-lime"
                    : relayerStatus === "degraded"
                    ? "bg-warn"
                    : "bg-danger"
                }`}
              />
              Mainnet Relayer
            </Badge>
          </div>
        )}

        <Button
          variant={isPanelOpen ? "secondary" : "ghost"}
          size="sm"
          onClick={onTogglePanel}
          className="gap-2 text-xs h-8 border-border"
          aria-label="Toggle memory lens panel"
        >
          <Brain className="h-3.5 w-3.5 text-lime" />
          <span className="hidden sm:inline">Memory Lens</span>
          <PanelRight className="h-3.5 w-3.5 text-text-muted" />
        </Button>
      </div>
    </header>
  );
}

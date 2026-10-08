"use client";

import React from "react";
import { Brain, PanelRight, User, Menu, LogIn, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TuskSymbol } from "@/components/brand/TuskSymbol";

interface TopBarProps {
  onTogglePanel: () => void;
  onToggleSidebar: () => void;
  isPanelOpen: boolean;
  advancedTools: boolean;
  onToggleAdvancedTools?: () => void;
  relayerStatus?: "ok" | "degraded" | "down";
  userDisplayName?: string;
  isLoggedIn?: boolean;
  onOpenAuth?: () => void;
}

export function TopBar({
  onTogglePanel,
  onToggleSidebar,
  isPanelOpen,
  advancedTools,
  onToggleAdvancedTools,
  relayerStatus = "ok",
  userDisplayName = "Explorer",
  isLoggedIn = false,
  onOpenAuth,
}: TopBarProps) {
  return (
    <header className="h-14 glass-panel border-b border-border px-4 flex items-center justify-between z-20 sticky top-0 bg-bg/90 backdrop-blur-md">
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
          <TuskSymbol size={18} active={true} />
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
        {/* User Account / Sign In Pill */}
        {onOpenAuth && (
          <button
            onClick={onOpenAuth}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors shadow-xs ${
              isLoggedIn
                ? "bg-bg-elev-2 hover:bg-bg-elev border border-border text-text"
                : "bg-[#17191C] hover:bg-[#167A55] text-white"
            }`}
            title={isLoggedIn ? "Account Profile" : "Sign In with Google or Email"}
          >
            {isLoggedIn ? (
              <>
                <User className="h-3 w-3 text-[#167A55]" />
                <span className="font-medium text-[11px]">{userDisplayName}</span>
              </>
            ) : (
              <>
                <LogIn className="h-3 w-3" />
                <span className="font-medium text-[11px]">Sign In</span>
              </>
            )}
          </button>
        )}

        {/* Small Discreet Settings Icon Button */}
        {onToggleAdvancedTools && (
          <button
            onClick={onToggleAdvancedTools}
            className={`p-1.5 rounded-lg border transition-colors ${
              advancedTools
                ? "border-[#167A55]/40 bg-[#C8F5DE]/30 text-[#167A55]"
                : "border-transparent text-text-muted hover:text-text hover:bg-bg-elev-2"
            }`}
            title={advancedTools ? "Developer & Memory inspection active (Click to hide)" : "Settings"}
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        )}

        {/* Relayer Status (shown only when developer tools enabled) */}
        {advancedTools && (
          <div className="flex items-center gap-2 animate-in fade-in-0 duration-200">
            <Badge variant="outline" className="text-[11px] gap-1.5 py-0.5">
              <span
                className={`h-2 w-2 rounded-full ${
                  relayerStatus === "ok"
                    ? "bg-[#167A55]"
                    : relayerStatus === "degraded"
                    ? "bg-warn"
                    : "bg-danger"
                }`}
              />
              Mainnet Relayer
            </Badge>
          </div>
        )}

        {/* Memory Lens Panel Toggle: Hidden by default; visible only when advanced tools is enabled */}
        {advancedTools && (
          <Button
            variant={isPanelOpen ? "secondary" : "ghost"}
            size="sm"
            onClick={onTogglePanel}
            className="gap-2 text-xs h-8 border-border animate-in fade-in-0 duration-200"
            aria-label="Toggle memory lens panel"
          >
            <Brain className="h-3.5 w-3.5 text-[#167A55]" />
            <span className="hidden sm:inline">Memory Lens</span>
            <PanelRight className="h-3.5 w-3.5 text-text-muted" />
          </Button>
        )}
      </div>
    </header>
  );
}

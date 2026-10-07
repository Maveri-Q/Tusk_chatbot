"use client";

import React from "react";
import {
  Plus,
  MessageSquare,
  Shield,
  LogOut,
  Sliders,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  onNewChat: () => void;
  advancedTools: boolean;
  onToggleAdvancedTools: (val: boolean) => void;
  userDisplayName?: string;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  onNewChat,
  advancedTools,
  onToggleAdvancedTools,
  userDisplayName = "Explorer",
  isOpenMobile = false,
  onCloseMobile,
}: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-bg-elev border-r border-border flex flex-col justify-between transition-transform duration-200 md:translate-x-0 ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top: Branding and New Chat */}
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-sm bg-flare/20 border border-flare/40 flex items-center justify-center text-flare font-display font-bold text-lg">
                T
              </div>
              <div>
                <span className="font-display font-bold text-text text-lg tracking-tight">
                  TUSK
                </span>
                <span className="ml-1.5 text-[10px] text-lime font-mono px-1.5 py-0.5 rounded bg-lime/10 border border-lime/20">
                  WALRUS
                </span>
              </div>
            </div>
          </div>

          <Button
            onClick={onNewChat}
            variant="default"
            className="w-full justify-start gap-2 h-9 text-xs"
          >
            <Plus className="h-4 w-4" />
            <span>New Chat</span>
          </Button>

          {/* Chat History Placeholder / Recent Sessions */}
          <div className="mt-2">
            <span className="text-[11px] font-medium text-text-muted px-2 uppercase tracking-wider">
              Recent Chats
            </span>
            <div className="mt-2 flex flex-col gap-1">
              <button className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-sm text-xs text-text bg-bg-elev-2 border border-border/80 text-left truncate">
                <MessageSquare className="h-3.5 w-3.5 text-flare shrink-0" />
                <span className="truncate">Current Session</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom: Advanced tools switch and Account Menu */}
        <div className="p-4 border-t border-border bg-bg-elev flex flex-col gap-3">
          {/* Advanced Tools Toggle Switch */}
          <div className="rounded-sm bg-bg-elev-2 p-3 border border-border flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="advanced-tools-toggle"
                className="text-xs font-medium text-text cursor-pointer flex items-center gap-1.5"
              >
                <Sliders className="h-3.5 w-3.5 text-flare" />
                Advanced tools
              </label>
              <Switch
                id="advanced-tools-toggle"
                checked={advancedTools}
                onCheckedChange={onToggleAdvancedTools}
              />
            </div>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Shows security log, attack demo, and relayer network status.
            </p>
          </div>

          <Separator />

          {/* User Profile */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="h-8 w-8 bg-flare/10 border-flare/30">
                <AvatarFallback className="text-flare font-medium text-xs">
                  {userDisplayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-text truncate">
                  {userDisplayName}
                </span>
                <span className="text-[10px] text-text-muted truncate">
                  Decentralized memory
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

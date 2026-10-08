"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  MessageSquare,
  Trash2,
  LogOut,
  LogIn,
  Sliders,
  Shield,
  User,
  Users,
  Settings,
  Brain,
  MoreHorizontal,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { TuskSymbol } from "@/components/brand/TuskSymbol";

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface SidebarProps {
  onNewChat: () => void;
  sessions?: ChatSession[];
  activeSessionId?: string;
  onSelectSession?: (id: string) => void;
  onDeleteSession?: (id: string) => void;
  advancedTools: boolean;
  onToggleAdvancedTools: (val: boolean) => void;
  userDisplayName?: string;
  userNamespace?: string;
  userEmail?: string;
  isLoggedIn?: boolean;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  onOpenSettings?: () => void;
  onOpenMemoryLens?: () => void;
  memoriesCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  onNewChat,
  sessions = [],
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  advancedTools,
  onToggleAdvancedTools,
  userDisplayName = "Explorer",
  userNamespace = "personal:default",
  userEmail,
  isLoggedIn = false,
  onOpenAuth,
  onLogout,
  onOpenSettings,
  onOpenMemoryLens,
  memoriesCount = 0,
  isOpenMobile = false,
  onCloseMobile,
}: SidebarProps) {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Close account menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setIsAccountMenuOpen(false);
      }
    }
    if (isAccountMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAccountMenuOpen]);

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
        <div className="p-4 flex flex-col gap-4 flex-1 min-h-0 overflow-hidden">
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#C8F5DE]/30 border border-[#8DE8BF]/40 flex items-center justify-center shadow-xs">
                <TuskSymbol size={22} active={true} />
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
            className="w-full justify-start gap-2 h-9 text-xs shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>New Chat</span>
          </Button>

          {/* Chat History: Real persistent sessions list */}
          <div className="flex-1 min-h-0 flex flex-col mt-1 overflow-hidden">
            <div className="flex items-center justify-between px-1 mb-2 shrink-0">
              <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
                Saved Chats ({sessions.length})
              </span>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1">
              {sessions.length === 0 ? (
                <div className="p-3 rounded-lg border border-dashed border-border text-center text-text-muted text-[11px]">
                  No saved conversations yet. Start chatting!
                </div>
              ) : (
                sessions.map((sess) => {
                  const isActive = sess.id === activeSessionId;
                  return (
                    <div
                      key={sess.id}
                      className={`group flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-xs transition-colors ${
                        isActive
                          ? "bg-flare text-flare-foreground font-medium shadow-xs"
                          : "text-text hover:bg-bg-elev-2 border border-transparent hover:border-border"
                      }`}
                    >
                      <button
                        onClick={() => onSelectSession?.(sess.id)}
                        className="flex items-center gap-2 min-w-0 flex-1 text-left"
                      >
                        <MessageSquare
                          className={`h-3.5 w-3.5 shrink-0 ${
                            isActive ? "text-flare-foreground" : "text-text-muted"
                          }`}
                        />
                        <span className="truncate">{sess.title}</span>
                      </button>

                      {onDeleteSession && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(sess.id);
                          }}
                          className={`opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-red-500 transition-opacity ml-1`}
                          title="Delete conversation"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Bottom: ChatGPT-Style Account & Settings Section */}
        <div className="p-3 border-t border-border bg-bg-elev shrink-0 relative" ref={accountMenuRef}>
          {/* Popover Menu (ChatGPT style) */}
          {isAccountMenuOpen && (
            <div className="absolute bottom-[calc(100%+8px)] left-3 right-3 z-50 rounded-2xl bg-bg-elev border border-border shadow-2xl p-1.5 flex flex-col gap-0.5 animate-in fade-in-0 zoom-in-95 duration-150">
              {/* Profile Card Header */}
              <div className="px-3 py-2.5 rounded-xl bg-bg-elev-2/70 border border-border/50 flex items-center gap-2.5 mb-1">
                <Avatar className="h-8 w-8 bg-lime/10 border border-lime/25 shrink-0">
                  <AvatarFallback className="text-lime font-bold text-xs">
                    {isLoggedIn ? userDisplayName.slice(0, 2).toUpperCase() : "G"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-semibold text-text truncate">
                    {isLoggedIn ? userDisplayName : "Guest User"}
                  </span>
                  <span className="text-[10px] text-text-muted truncate font-mono">
                    {isLoggedIn ? (userEmail || userNamespace) : "Walrus guest mode"}
                  </span>
                </div>
              </div>

              {/* Menu Item: Settings */}
              {onOpenSettings && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAccountMenuOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-text hover:bg-bg-elev-2 hover:text-text transition-colors text-left"
                >
                  <Settings className="h-4 w-4 text-text-muted" />
                  <span className="flex-1 font-medium">Settings</span>
                </button>
              )}

              {/* Menu Item: Memory Lens / What Tusk Remembers */}
              {onOpenMemoryLens && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAccountMenuOpen(false);
                    onOpenMemoryLens();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-text hover:bg-bg-elev-2 hover:text-text transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Brain className="h-4 w-4 text-lime" />
                    <span className="font-medium">What Tusk Remembers</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-lime/10 text-lime border border-lime/20">
                    {memoriesCount}
                  </span>
                </button>
              )}

              {/* Menu Item: Account & Profile Details */}
              {onOpenAuth && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAccountMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-text hover:bg-bg-elev-2 hover:text-text transition-colors text-left"
                >
                  <User className="h-4 w-4 text-text-muted" />
                  <span className="flex-1 font-medium">Account & Profile</span>
                </button>
              )}

              <div className="h-px bg-border/60 my-1" />

              {/* Menu Item: Log Out / Sign In */}
              {isLoggedIn ? (
                onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-danger hover:bg-danger/10 transition-colors text-left font-medium"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </button>
                )
              ) : (
                onOpenAuth && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      onOpenAuth();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-lime hover:bg-lime/10 transition-colors text-left font-medium"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Sign in with Google / Email</span>
                  </button>
                )
              )}
            </div>
          )}

          {/* Trigger Button (ChatGPT style profile card at bottom) */}
          <button
            type="button"
            onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
            className={`w-full p-2 rounded-xl flex items-center justify-between transition-all border ${
              isAccountMenuOpen
                ? "bg-bg-elev-2 border-border shadow-xs"
                : "bg-bg-elev hover:bg-bg-elev-2 border-transparent hover:border-border"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0 text-left">
              <Avatar className="h-8 w-8 bg-lime/10 border border-lime/20 shrink-0">
                <AvatarFallback className="text-lime font-bold text-xs">
                  {isLoggedIn ? userDisplayName.slice(0, 2).toUpperCase() : "G"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-text truncate">
                  {isLoggedIn ? userDisplayName : "Guest User"}
                </span>
                <span className="text-[10px] text-text-muted font-mono truncate">
                  {isLoggedIn ? (userEmail || userNamespace) : "Click for Settings & Account"}
                </span>
              </div>
            </div>

            <MoreHorizontal className="h-4 w-4 text-text-muted shrink-0 ml-1.5" />
          </button>
        </div>
      </aside>
    </>
  );
}

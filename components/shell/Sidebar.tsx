"use client";

import React from "react";
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

        {/* Bottom: Clean User Account Section */}
        <div className="p-4 border-t border-border bg-bg-elev shrink-0">
          <div className="p-2.5 rounded-xl bg-bg-elev-2 border border-border flex items-center justify-between">
            {isLoggedIn ? (
              <>
                <div
                  onClick={onOpenAuth}
                  className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1 group"
                >
                  <Avatar className="h-8 w-8 bg-[#167A55]/15 border border-[#167A55]/30">
                    <AvatarFallback className="text-[#167A55] font-semibold text-xs">
                      {userDisplayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-text truncate group-hover:text-[#167A55] transition-colors">
                      {userDisplayName}
                    </span>
                    <span className="text-[10px] text-text-muted font-mono truncate">
                      {userEmail || userNamespace}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {onLogout && (
                    <button
                      onClick={onLogout}
                      className="p-1.5 rounded-md text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      title="Sign out"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={onOpenAuth}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#17191C] hover:bg-[#167A55] text-white text-xs font-medium transition-all shadow-xs"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In (Google / Email)</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

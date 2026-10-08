"use client";

import React, { useState } from "react";
import {
  Settings,
  Brain,
  Shield,
  User,
  Sparkles,
  X,
  Trash2,
  ExternalLink,
  Check,
  LogOut,
  Moon,
  Sun,
  Database,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserProfile } from "@/components/auth/AuthModal";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Personalization / Memory
  memoryEnabled: boolean;
  onToggleMemory: (enabled: boolean) => void;
  memoriesCount: number;
  onOpenMemoryLens: () => void;
  // Security / Advanced Tools
  advancedTools: boolean;
  onToggleAdvancedTools: (enabled: boolean) => void;
  relayerStatus: "ok" | "degraded" | "down";
  // Account
  currentUser: UserProfile;
  isLoggedIn: boolean;
  onOpenAuth: () => void;
  onLogout: () => void;
  // Chats
  onClearAllChats?: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  memoryEnabled,
  onToggleMemory,
  memoriesCount,
  onOpenMemoryLens,
  advancedTools,
  onToggleAdvancedTools,
  relayerStatus,
  currentUser,
  isLoggedIn,
  onOpenAuth,
  onLogout,
  onClearAllChats,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"general" | "memory" | "security" | "account">("memory");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-bg-elev border border-border shadow-2xl overflow-hidden flex flex-col md:flex-row h-[540px] text-text">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 p-1.5 rounded-full hover:bg-bg-elev-2 text-text-muted hover:text-text transition-colors"
          aria-label="Close settings"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Left Sidebar Tabs (ChatGPT Style) */}
        <div className="w-full md:w-52 border-b md:border-b-0 md:border-r border-border p-3 flex flex-row md:flex-col gap-1 shrink-0 bg-bg/50">
          <div className="px-3 py-2 hidden md:flex items-center gap-2 text-xs font-semibold text-text uppercase tracking-wider">
            <Settings className="h-3.5 w-3.5 text-lime" />
            <span>Settings</span>
          </div>

          <button
            onClick={() => setActiveTab("memory")}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left w-full ${
              activeTab === "memory"
                ? "bg-bg-elev-2 text-text shadow-xs font-semibold"
                : "text-text-muted hover:text-text hover:bg-bg-elev-2/50"
            }`}
          >
            <Brain className="h-4 w-4 text-lime" />
            <span className="flex-1">Personalization</span>
            <Badge variant="lime" className="text-[10px] px-1 py-0 h-4">
              {memoriesCount}
            </Badge>
          </button>

          <button
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left w-full ${
              activeTab === "general"
                ? "bg-bg-elev-2 text-text shadow-xs font-semibold"
                : "text-text-muted hover:text-text hover:bg-bg-elev-2/50"
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>General</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left w-full ${
              activeTab === "security"
                ? "bg-bg-elev-2 text-text shadow-xs font-semibold"
                : "text-text-muted hover:text-text hover:bg-bg-elev-2/50"
            }`}
          >
            <Shield className="h-4 w-4 text-flare" />
            <span>Security & Data</span>
          </button>

          <button
            onClick={() => setActiveTab("account")}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left w-full ${
              activeTab === "account"
                ? "bg-bg-elev-2 text-text shadow-xs font-semibold"
                : "text-text-muted hover:text-text hover:bg-bg-elev-2/50"
            }`}
          >
            <User className="h-4 w-4" />
            <span>Account</span>
          </button>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between">
          <div>
            {/* 1. PERSONALIZATION / MEMORY TAB (ChatGPT Style) */}
            {activeTab === "memory" && (
              <div className="flex flex-col gap-5 animate-in fade-in-0 duration-150">
                <div>
                  <h3 className="text-base font-display font-semibold text-text">
                    Personalization & Memory
                  </h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    Manage how Tusk remembers details about you and syncs context across your conversations using decentralized Walrus storage.
                  </p>
                </div>

                <div className="divide-y divide-border/60">
                  {/* Memory On/Off Switch */}
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-text">
                        Memory
                      </span>
                      <span className="text-[11px] text-text-muted leading-relaxed">
                        Tusk will reference durable facts you share and remember past discussions to personalize answers.
                      </span>
                    </div>
                    <Switch
                      checked={memoryEnabled}
                      onCheckedChange={onToggleMemory}
                    />
                  </div>

                  {/* Manage Memories Button (ChatGPT Style) */}
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-text">
                        Manage Memories
                      </span>
                      <span className="text-[11px] text-text-muted leading-relaxed">
                        View what Tusk remembers about you, inspect cryptographic Walrus Blob IDs, or delete specific memories.
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onClose();
                        onOpenMemoryLens();
                      }}
                      className="text-xs h-8 shrink-0 gap-1.5 border-border hover:border-lime/50"
                    >
                      <Brain className="h-3.5 w-3.5 text-lime" />
                      <span>Manage ({memoriesCount})</span>
                    </Button>
                  </div>

                  {/* Walrus Storage Info */}
                  <div className="py-4 flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-text flex items-center gap-1.5">
                        <Database className="h-3.5 w-3.5 text-lime" />
                        Decentralized Walrus Storage
                      </span>
                      <span className="text-[11px] text-text-muted leading-relaxed font-mono">
                        Namespace: personal:{currentUser.id}
                      </span>
                    </div>
                    <Badge variant="lime" className="text-[10px] shrink-0 font-mono">
                      Persistent
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* 2. GENERAL TAB */}
            {activeTab === "general" && (
              <div className="flex flex-col gap-5 animate-in fade-in-0 duration-150">
                <div>
                  <h3 className="text-base font-display font-semibold text-text">
                    General Settings
                  </h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    Customize chat preferences and conversation history.
                  </p>
                </div>

                <div className="divide-y divide-border/60">
                  {/* Theme */}
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-text">Theme</span>
                      <span className="text-[11px] text-text-muted">
                        Visual appearance for chat interface
                      </span>
                    </div>
                    <span className="text-xs font-medium text-text-muted bg-bg-elev-2 px-3 py-1 rounded-md border border-border">
                      Dark / System
                    </span>
                  </div>

                  {/* Clear Conversations */}
                  {onClearAllChats && (
                    <div className="py-4 flex items-center justify-between gap-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-danger">
                          Clear all chats
                        </span>
                        <span className="text-[11px] text-text-muted">
                          Delete all saved conversation histories for this account
                        </span>
                      </div>
                      {!showClearConfirm ? (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setShowClearConfirm(true)}
                          className="text-xs h-8 shrink-0"
                        >
                          Clear all
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              onClearAllChats();
                              setShowClearConfirm(false);
                            }}
                            className="text-xs h-8"
                          >
                            Confirm
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowClearConfirm(false)}
                            className="text-xs h-8 text-text-muted"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. SECURITY & DATA TAB */}
            {activeTab === "security" && (
              <div className="flex flex-col gap-5 animate-in fade-in-0 duration-150">
                <div>
                  <h3 className="text-base font-display font-semibold text-text">
                    Security & Data Controls
                  </h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    Inspect cryptographic firewall layers and decentralized network connectivity.
                  </p>
                </div>

                <div className="divide-y divide-border/60">
                  {/* Mainnet Relayer Status */}
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-text">
                        Walrus Memory Relayer
                      </span>
                      <span className="text-[11px] text-text-muted">
                        Decentralized memory epoch sync node
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[11px] gap-1.5 py-0.5"
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          relayerStatus === "ok"
                            ? "bg-[#167A55]"
                            : relayerStatus === "degraded"
                            ? "bg-warn"
                            : "bg-danger"
                        }`}
                      />
                      <span>{relayerStatus === "ok" ? "Connected" : relayerStatus}</span>
                    </Badge>
                  </div>

                  {/* Advanced Developer & Firewall Inspection Tools */}
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-text">
                        Advanced Firewall & Developer Tools
                      </span>
                      <span className="text-[11px] text-text-muted leading-relaxed">
                        Enables prompt injection firewall logs and security attack simulations in the memory panel.
                      </span>
                    </div>
                    <Switch
                      checked={advancedTools}
                      onCheckedChange={onToggleAdvancedTools}
                    />
                  </div>

                  {/* Privacy Guarantees */}
                  <div className="py-4 flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-text flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-lime" />
                      Zero-Knowledge Privacy Rules
                    </span>
                    <p className="text-[11px] text-text-muted leading-relaxed">
                      Passwords, private keys, API tokens, and payment card numbers are automatically screened and never written to Walrus storage or memory context.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. ACCOUNT TAB */}
            {activeTab === "account" && (
              <div className="flex flex-col gap-5 animate-in fade-in-0 duration-150">
                <div>
                  <h3 className="text-base font-display font-semibold text-text">
                    Account & Profile
                  </h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    Manage your identity and authentication status.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-bg-elev-2 border border-border flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-11 w-11 bg-lime/10 border border-lime/20 shrink-0">
                      <AvatarFallback className="text-lime font-bold text-sm">
                        {isLoggedIn ? currentUser.name.slice(0, 2).toUpperCase() : "G"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-text truncate">
                        {isLoggedIn ? currentUser.name : "Guest User"}
                      </span>
                      <span className="text-xs text-text-muted truncate">
                        {isLoggedIn ? currentUser.email : "Not signed in"}
                      </span>
                      <span className="text-[10px] font-mono text-lime truncate mt-0.5">
                        ID: {currentUser.id}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {isLoggedIn ? (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          onLogout();
                          onClose();
                        }}
                        className="text-xs h-8 gap-1.5"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Log Out</span>
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          onClose();
                          onOpenAuth();
                        }}
                        className="text-xs h-8 gap-1.5"
                      >
                        <User className="h-3.5 w-3.5" />
                        <span>Sign In</span>
                      </Button>
                    )}
                  </div>
                </div>

                {isLoggedIn && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onClose();
                        onOpenAuth();
                      }}
                      className="text-xs h-8 border-border hover:border-lime/40"
                    >
                      Switch Account
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Dialog Footer */}
          <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs text-text-muted">
            <span className="text-[11px] font-mono">Tusk AI • Decentralized Walrus Memory</span>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs h-8 px-4"
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

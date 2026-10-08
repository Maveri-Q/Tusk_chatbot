"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Brain,
  Shield,
  User,
  Sparkles,
  X,
  Trash2,
  Check,
  LogOut,
  Moon,
  Sun,
  Laptop,
  Database,
  Lock,
  ArrowLeft,
  Search,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserProfile } from "@/components/auth/AuthModal";

export interface MemoryItem {
  blob_id: string;
  text: string;
  category?: string;
  createdAt?: string;
  relevance?: number;
  status?: "saving" | "saved";
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Personalization / Memory
  memoryEnabled: boolean;
  onToggleMemory: (enabled: boolean) => void;
  memories: MemoryItem[];
  onDeleteMemory: (blobId: string) => void;
  onRefreshMemories?: () => void;
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
  memories = [],
  onDeleteMemory,
  onRefreshMemories,
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
  const [isManagingMemories, setIsManagingMemories] = useState(false);
  const [memorySearch, setMemorySearch] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark" | "system">("dark");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = (localStorage.getItem("tusk_theme") as "light" | "dark" | "system") || "dark";
      setCurrentTheme(stored);
    }
  }, [isOpen]);

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setCurrentTheme(newTheme);
    try {
      localStorage.setItem("tusk_theme", newTheme);
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else if (newTheme === "light") {
        document.documentElement.classList.remove("dark");
      } else if (newTheme === "system") {
        const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (isSystemDark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    } catch (_) {}
  };

  const handleDeleteFact = async (blobId: string) => {
    setDeletingId(blobId);
    try {
      await onDeleteMemory(blobId);
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  const filteredMemories = memories.filter((m) =>
    m.text.toLowerCase().includes(memorySearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-bg-elev border border-border shadow-2xl overflow-hidden flex flex-col md:flex-row h-[550px] text-text">
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
            onClick={() => {
              setActiveTab("memory");
              setIsManagingMemories(false);
            }}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left w-full ${
              activeTab === "memory"
                ? "bg-bg-elev-2 text-text shadow-xs font-semibold"
                : "text-text-muted hover:text-text hover:bg-bg-elev-2/50"
            }`}
          >
            <Brain className="h-4 w-4 text-lime" />
            <span className="flex-1">Personalization</span>
            <Badge variant="lime" className="text-[10px] px-1 py-0 h-4">
              {memories.length}
            </Badge>
          </button>

          <button
            onClick={() => {
              setActiveTab("general");
              setIsManagingMemories(false);
            }}
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
            onClick={() => {
              setActiveTab("security");
              setIsManagingMemories(false);
            }}
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
            onClick={() => {
              setActiveTab("account");
              setIsManagingMemories(false);
            }}
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
            {/* ========================================================
                1. PERSONALIZATION / MEMORY TAB (ChatGPT Style)
               ======================================================== */}
            {activeTab === "memory" && (
              !isManagingMemories ? (
                /* Main Personalization Overview */
                <div className="flex flex-col gap-5 animate-in fade-in-0 duration-150">
                  <div>
                    <h3 className="text-base font-display font-semibold text-text">
                      Personalization & Memory
                    </h3>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                      Manage how Tusk remembers details about you and syncs context across your conversations.
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
                          Tusk will remember durable facts you share (preferences, projects, background) to personalize responses.
                        </span>
                      </div>
                      <Switch
                        checked={memoryEnabled}
                        onCheckedChange={onToggleMemory}
                      />
                    </div>

                    {/* Manage Memories Action (Opens clean facts list) */}
                    <div className="py-4 flex items-center justify-between gap-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-text">
                          Manage Memories
                        </span>
                        <span className="text-[11px] text-text-muted leading-relaxed">
                          Browse facts Tusk has remembered about you, or delete specific memories anytime.
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsManagingMemories(true)}
                        className="text-xs h-8 shrink-0 gap-1.5 border-border hover:border-lime/50"
                      >
                        <Brain className="h-3.5 w-3.5 text-lime" />
                        <span>Manage ({memories.length})</span>
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
              ) : (
                /* Sub-View: Manage Memories (Clean Facts List, NO BLOB IDs!) */
                <div className="flex flex-col gap-4 animate-in fade-in-0 slide-in-from-right-2 duration-150">
                  <div className="flex items-center justify-between pb-1 border-b border-border/60">
                    <button
                      type="button"
                      onClick={() => setIsManagingMemories(false)}
                      className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text transition-colors"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Back to Personalization</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <Badge variant="lime" className="text-[10px] h-5 px-2">
                        {memories.length} {memories.length === 1 ? "Fact" : "Facts"}
                      </Badge>
                      {onRefreshMemories && (
                        <button
                          type="button"
                          onClick={onRefreshMemories}
                          className="p-1 rounded text-text-muted hover:text-text hover:bg-bg-elev-2"
                          title="Refresh memories from Walrus"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Search filter if 3 or more memories */}
                  {memories.length >= 3 && (
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-muted" />
                      <input
                        type="text"
                        value={memorySearch}
                        onChange={(e) => setMemorySearch(e.target.value)}
                        placeholder="Search saved facts..."
                        className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs bg-bg-elev-2 border border-border outline-none focus:border-lime"
                      />
                    </div>
                  )}

                  {/* Facts List */}
                  <div className="flex flex-col gap-2 max-h-[310px] overflow-y-auto pr-1">
                    {memories.length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 my-auto">
                        <Brain className="h-7 w-7 text-text-muted/50" />
                        <span className="text-xs font-medium text-text">No memories stored yet</span>
                        <p className="text-[11px] text-text-muted max-w-xs leading-relaxed">
                          Tusk will automatically save durable facts you share in conversations when Memory is switched on.
                        </p>
                      </div>
                    ) : filteredMemories.length === 0 ? (
                      <div className="p-6 text-center text-text-muted text-xs">
                        No memories match &quot;{memorySearch}&quot;
                      </div>
                    ) : (
                      filteredMemories.map((mem) => (
                        <div
                          key={mem.blob_id}
                          className="p-3 rounded-xl bg-bg-elev-2 border border-border flex items-start justify-between gap-3 group hover:border-lime/30 transition-colors shadow-xs"
                        >
                          <div className="flex flex-col gap-1 min-w-0 flex-1">
                            {/* Saved fact text */}
                            <span className="text-xs text-text font-medium leading-relaxed">
                              {mem.text}
                            </span>
                            {mem.category && (
                              <span className="text-[10px] text-lime font-mono capitalize">
                                {mem.category}
                              </span>
                            )}
                          </div>

                          {/* Delete Fact Action */}
                          <button
                            type="button"
                            onClick={() => handleDeleteFact(mem.blob_id)}
                            disabled={deletingId === mem.blob_id}
                            className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors shrink-0"
                            title="Delete this fact"
                            aria-label="Delete memory fact"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            )}

            {/* ========================================================
                2. GENERAL TAB (Interactive Theme Switcher & Clear Chats)
               ======================================================== */}
            {activeTab === "general" && (
              <div className="flex flex-col gap-5 animate-in fade-in-0 duration-150">
                <div>
                  <h3 className="text-base font-display font-semibold text-text">
                    General Settings
                  </h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    Customize your visual theme and chat histories.
                  </p>
                </div>

                <div className="divide-y divide-border/60">
                  {/* Interactive Theme Switcher */}
                  <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-text">Theme</span>
                      <span className="text-[11px] text-text-muted">
                        Select light, dark, or sync with your system preference
                      </span>
                    </div>

                    <div className="flex items-center gap-1 bg-bg-elev-2 p-1 rounded-xl border border-border shrink-0">
                      {/* Light theme button */}
                      <button
                        type="button"
                        onClick={() => handleThemeChange("light")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          currentTheme === "light"
                            ? "bg-bg text-text shadow-xs font-semibold"
                            : "text-text-muted hover:text-text"
                        }`}
                      >
                        <Sun className="h-3.5 w-3.5 text-amber-500" />
                        <span>Light</span>
                      </button>

                      {/* Dark theme button */}
                      <button
                        type="button"
                        onClick={() => handleThemeChange("dark")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          currentTheme === "dark"
                            ? "bg-bg text-text shadow-xs font-semibold"
                            : "text-text-muted hover:text-text"
                        }`}
                      >
                        <Moon className="h-3.5 w-3.5 text-lime" />
                        <span>Dark</span>
                      </button>

                      {/* System theme button */}
                      <button
                        type="button"
                        onClick={() => handleThemeChange("system")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          currentTheme === "system"
                            ? "bg-bg text-text shadow-xs font-semibold"
                            : "text-text-muted hover:text-text"
                        }`}
                      >
                        <Laptop className="h-3.5 w-3.5" />
                        <span>System</span>
                      </button>
                    </div>
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

            {/* ========================================================
                3. SECURITY & DATA TAB
               ======================================================== */}
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
                        Enables prompt injection firewall logs and security attack simulations.
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

            {/* ========================================================
                4. ACCOUNT TAB
               ======================================================== */}
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
            <span className="text-[11px] font-mono">Tusk AI • Encrypted Walrus Memory</span>
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

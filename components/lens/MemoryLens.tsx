"use client";

import React, { useState, useEffect } from "react";
import {
  Brain,
  X,
  Search,
  Shield,
  Sparkles,
  ChevronDown,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
  Flame,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

export interface MemoryItem {
  blob_id: string;
  text: string;
  category?: string;
  createdAt?: string;
  relevance?: number;
  status?: "saving" | "saved";
}

interface SecurityLogItem {
  ts: string;
  snippet: string;
  reason: string;
  layer: "write" | "read";
}

interface MemoryLensProps {
  isOpen: boolean;
  onClose: () => void;
  advancedTools: boolean;
  memories?: MemoryItem[];
  onRefreshMemories?: () => void;
  userId?: string;
}

export function MemoryLens({
  isOpen,
  onClose,
  advancedTools,
  memories = [],
  onRefreshMemories,
  userId = "alice",
}: MemoryLensProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [newFactText, setNewFactText] = useState("");
  const [isAddingFact, setIsAddingFact] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [securityLogs, setSecurityLogs] = useState<SecurityLogItem[]>([]);
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackSuccessMessage, setAttackSuccessMessage] = useState<string | null>(null);

  // Auto-refresh memories as soon as panel opens and periodically every 4s
  useEffect(() => {
    if (isOpen && onRefreshMemories) {
      onRefreshMemories();
      const interval = setInterval(() => {
        onRefreshMemories();
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen, onRefreshMemories]);

  // Fetch security logs when advanced tools is enabled
  const fetchSecLogs = async () => {
    try {
      const res = await fetch("/api/security-log");
      if (res.ok) {
        const data = await res.json();
        setSecurityLogs(data.log || []);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (advancedTools && isOpen) {
      fetchSecLogs();
    }
  }, [advancedTools, isOpen]);

  if (!isOpen) return null;

  const handleAddFact = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newFactText.trim();
    if (!trimmed || isAddingFact) return;

    setIsAddingFact(true);
    try {
      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, userId }),
      });
      if (res.ok) {
        setNewFactText("");
        if (onRefreshMemories) onRefreshMemories();
      }
    } catch (err) {
      console.error("Add fact error:", err);
    } finally {
      setIsAddingFact(false);
    }
  };

  const toggleDetails = (id: string) => {
    setExpandedDetails((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyBlobId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleForget = async (blobId: string) => {
    try {
      const res = await fetch("/api/memories/forget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blobId, userId }),
      });
      if (res.ok) {
        if (onRefreshMemories) onRefreshMemories();
      }
    } catch (e) {
      console.error("Forget failed:", e);
    }
  };

  const handleAttackDemo = async () => {
    setIsAttacking(true);
    setAttackSuccessMessage(null);
    try {
      const res = await fetch("/api/demo/attack", { method: "POST" });
      const data = await res.json();
      if (data.blocked) {
        setAttackSuccessMessage(data.reason);
        fetchSecLogs();
      }
    } catch (e) {
      console.error("Attack demo error:", e);
    } finally {
      setIsAttacking(false);
    }
  };

  const filteredMemories = memories.filter((m) =>
    m.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-full md:w-80 lg:w-[340px] bg-bg-elev border-l border-border flex flex-col h-full z-20 shrink-0">
      {/* Panel Header */}
      <div className="h-14 px-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-lime" />
          <h2 className="font-display font-semibold text-text text-sm">
            What Tusk Remembers
          </h2>
          <Badge variant="lime" className="text-[10px] h-5 px-1.5">
            {memories.length}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          {onRefreshMemories && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefreshMemories}
              className="h-8 w-8 text-text-muted hover:text-text"
              aria-label="Refresh memories"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-text-muted hover:text-text"
            aria-label="Close memory panel"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {/* Quick Add Fact Input */}
        <form onSubmit={handleAddFact} className="flex gap-1.5 items-center">
          <Input
            type="text"
            placeholder="Add fact (e.g. I prefer dark mode)..."
            value={newFactText}
            onChange={(e) => setNewFactText(e.target.value)}
            disabled={isAddingFact}
            className="h-8 text-xs bg-bg-elev-2 flex-1 border-border focus:border-[#167A55]"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!newFactText.trim() || isAddingFact}
            className="h-8 px-2.5 text-xs bg-[#167A55] hover:bg-[#126344] text-white shrink-0 font-medium shadow-xs"
          >
            {isAddingFact ? "Saving..." : "Add"}
          </Button>
        </form>

        {/* Search box (visible if 4 or more memories) */}
        {memories.length >= 4 && (
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-text-muted" />
            <Input
              type="text"
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-bg-elev-2"
            />
          </div>
        )}

        {advancedTools ? (
          <Tabs defaultValue="memories" className="w-full">
            <TabsList className="w-full grid grid-cols-2 h-8">
              <TabsTrigger value="memories" className="text-xs">
                Memories ({memories.length})
              </TabsTrigger>
              <TabsTrigger value="security" className="text-xs gap-1.5">
                <Shield className="h-3 w-3 text-flare" />
                Security Log
              </TabsTrigger>
            </TabsList>

            <TabsContent value="memories" className="mt-3 flex flex-col gap-2.5">
              {renderMemoryList()}
            </TabsContent>

            <TabsContent value="security" className="mt-3 flex flex-col gap-3">
              {/* Firewall stats card */}
              <div className="rounded-sm bg-bg-elev-2 p-3 border border-border flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-medium text-text">
                  <span className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-lime" />
                    Memory Firewall
                  </span>
                  <Badge variant="lime" className="text-[10px]">Active</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="p-2 rounded bg-bg/50 border border-border text-center">
                    <span className="text-[10px] text-text-muted block">Saved Facts</span>
                    <span className="text-sm font-bold text-lime font-mono">{memories.length}</span>
                  </div>
                  <div className="p-2 rounded bg-bg/50 border border-border text-center">
                    <span className="text-[10px] text-text-muted block">Threats Blocked</span>
                    <span className="text-sm font-bold text-danger font-mono">{securityLogs.length}</span>
                  </div>
                </div>

                {/* "Attack me" Demo Button */}
                <div className="pt-2 border-t border-border/50">
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={isAttacking}
                    onClick={handleAttackDemo}
                    className="w-full text-xs gap-1.5 h-8 font-semibold"
                  >
                    <Flame className="h-3.5 w-3.5" />
                    <span>{isAttacking ? "Testing..." : "Attack me (Demo Injection)"}</span>
                  </Button>
                  {attackSuccessMessage && (
                    <div className="mt-2 p-2 rounded bg-danger/10 border border-danger/30 text-[11px] text-danger leading-relaxed animate-in fade-in-0">
                      ✓ Blocked: {attackSuccessMessage}
                    </div>
                  )}
                </div>
              </div>

              {/* Security Incidents List */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-medium text-text-muted">
                  Recent Firewall Events
                </span>
                {securityLogs.length === 0 ? (
                  <div className="p-4 rounded-sm border border-dashed border-border text-center text-xs text-text-muted">
                    No threats detected yet. Click "Attack me" to test defenses.
                  </div>
                ) : (
                  securityLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-sm bg-bg-elev-2 border border-danger/20 flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <Badge variant="danger" className="text-[9px] px-1 py-0 uppercase">
                          {log.layer} Block
                        </Badge>
                        <span className="text-text-muted font-mono">
                          {new Date(log.ts).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-text font-mono truncate">
                        "{log.snippet}"
                      </p>
                      <p className="text-[11px] text-danger leading-tight">
                        {log.reason}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          renderMemoryList()
        )}
      </div>
    </aside>
  );

  function renderMemoryList() {
    if (filteredMemories.length === 0) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="h-10 w-10 rounded-full bg-lime/10 border border-lime/20 flex items-center justify-center text-lime mb-3">
            <Sparkles className="h-5 w-5" />
          </div>
          <p className="text-xs font-medium text-text">
            Nothing remembered yet
          </p>
          <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
            Tell Tusk something about yourself, your preferences, or projects in chat.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2.5">
        {filteredMemories.map((mem) => {
          const isExpanded = expandedDetails[mem.blob_id];
          return (
            <div
              key={mem.blob_id}
              className="rounded-sm bg-bg-elev-2 border border-border p-3 flex flex-col gap-2 transition-all hover:border-border-strong group"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-text leading-relaxed font-normal">
                  {mem.text}
                </p>
                <span
                  className={`text-[10px] font-mono shrink-0 px-1.5 py-0.5 rounded border ${
                    mem.category === "request"
                      ? "text-[#FF854D] bg-[#FF854D]/10 border-[#FF854D]/30"
                      : "text-lime bg-lime/10 border border-lime/20"
                  }`}
                >
                  {mem.category === "request" ? "Request" : "Fact"}
                </span>
              </div>

              {/* Bottom Card Controls */}
              <div className="flex items-center justify-between pt-1 border-t border-border/50">
                <button
                  onClick={() => toggleDetails(mem.blob_id)}
                  className="text-[11px] text-text-muted hover:text-text flex items-center gap-1 transition-colors"
                >
                  <ChevronDown
                    className={`h-3 w-3 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                  <span>Details</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-text-muted">
                    {mem.createdAt || "Active"}
                  </span>

                  {/* Forget Button with honest popover */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        className="text-text-muted hover:text-danger opacity-70 hover:opacity-100 transition-opacity p-1"
                        aria-label="Forget memory"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3 flex flex-col gap-2">
                      <div className="flex items-center gap-1.5 text-warn text-xs font-medium">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Forget this memory?</span>
                      </div>
                      <p className="text-[11px] text-text-muted leading-relaxed">
                        Hidden from Tusk. The encrypted data stays on Walrus until it expires.
                      </p>
                      <div className="flex justify-end gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="danger"
                          className="h-7 text-xs px-2.5"
                          onClick={() => handleForget(mem.blob_id)}
                        >
                          Forget
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Collapsed Technical Details Drawer */}
              {isExpanded && (
                <div className="rounded bg-bg p-2 text-[10px] font-mono text-text-muted flex flex-col gap-1.5 mt-1 border border-border">
                  <div className="flex items-center justify-between">
                    <span>Walrus Blob ID:</span>
                    <button
                      onClick={() => copyBlobId(mem.blob_id)}
                      className="hover:text-text flex items-center gap-1"
                    >
                      {copiedId === mem.blob_id ? (
                        <Check className="h-3 w-3 text-lime" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                  <span className="text-text truncate select-all">{mem.blob_id}</span>
                  {mem.category && (
                    <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[9px]">
                      <span>Category:</span>
                      <span className="uppercase text-text font-semibold">{mem.category}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }
}

"use client";

import React, { useState } from "react";
import {
  Brain,
  X,
  Search,
  Shield,
  Clock,
  Sparkles,
  ChevronDown,
  Copy,
  Check,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export interface MemoryItem {
  blob_id: string;
  text: string;
  category?: string;
  createdAt?: string;
  relevance?: number;
  status?: "saving" | "saved";
}

interface MemoryLensProps {
  isOpen: boolean;
  onClose: () => void;
  advancedTools: boolean;
  memories?: MemoryItem[];
}

export function MemoryLens({
  isOpen,
  onClose,
  advancedTools,
  memories = [],
}: MemoryLensProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleDetails = (id: string) => {
    setExpandedDetails((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyBlobId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Search box (visible if 6 or more memories) */}
        {memories.length >= 6 && (
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
              <div className="rounded-sm bg-bg-elev-2 p-3 border border-border flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-medium text-text">
                  <span>Firewall Status</span>
                  <Badge variant="lime" className="text-[10px]">Active</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="p-2 rounded bg-bg/50 border border-border text-center">
                    <span className="text-[10px] text-text-muted block">Saved Facts</span>
                    <span className="text-sm font-bold text-lime font-mono">{memories.length}</span>
                  </div>
                  <div className="p-2 rounded bg-bg/50 border border-border text-center">
                    <span className="text-[10px] text-text-muted block">Blocked</span>
                    <span className="text-sm font-bold text-danger font-mono">0</span>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-sm border border-dashed border-border text-center text-xs text-text-muted">
                No security incidents logged yet.
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
              className="rounded-sm bg-bg-elev-2 border border-border p-3 flex flex-col gap-2 transition-all hover:border-border-strong"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-text leading-relaxed font-normal">
                  {mem.text}
                </p>
                <span className="text-[10px] text-lime font-mono shrink-0 px-1.5 py-0.5 rounded bg-lime/10 border border-lime/20">
                  Saved
                </span>
              </div>

              {/* Collapsed Technical Details */}
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

                <span className="text-[10px] text-text-muted">
                  {mem.createdAt || "Just now"}
                </span>
              </div>

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
                  <span className="text-text truncate">{mem.blob_id}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }
}
